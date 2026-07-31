const express = require('express');
const router = express.Router();
const { getQuery, runQuery, allQuery, db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/orders (Protected Checkout)
router.post('/', authenticateToken, async (req, res) => {
  const { customer_name, email, address, items } = req.body;

  if (!customer_name || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer details and checkout items are required.' });
  }

  try {
    // 1. Verify stock and calculate totals
    const checkedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await getQuery("SELECT * FROM products WHERE id = ?", [item.product_id]);
      if (!product) {
        return res.status(404).json({ error: `Product ID ${item.product_id} not found.` });
      }

      if (product.status !== 'active') {
        return res.status(400).json({ error: `Product "${product.name}" is no longer active.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}` });
      }

      checkedItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        stockBefore: product.stock
      });

      subtotal += product.price * item.quantity;
    }

    const taxRate = 0.08; // 8% tax
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    // 2. Perform DB updates in transaction-like serialize block
    db.serialize(async () => {
      // Create order
      db.run("BEGIN TRANSACTION");

      try {
        const orderResult = await runQuery(`
          INSERT INTO orders (user_id, customer_name, email, address, subtotal, tax, total, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [req.user.id, customer_name, email, address, subtotal, tax, total]);

        const orderId = orderResult.lastID;

        // Insert items and deduct inventory stock
        for (const item of checkedItems) {
          await runQuery(`
            INSERT INTO order_items (order_id, product_id, quantity, price) 
            VALUES (?, ?, ?, ?)
          `, [orderId, item.product_id, item.quantity, item.price]);

          await runQuery(`
            UPDATE products SET stock = stock - ? WHERE id = ?
          `, [item.quantity, item.product_id]);
        }

        db.run("COMMIT");
        res.status(201).json({ orderId, total, message: 'Order placed successfully.' });
      } catch (err) {
        db.run("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: 'Failed to process checkout transaction.' });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error processing order.' });
  }
});

// GET /api/orders/my-orders (Protected Client History)
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await allQuery(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving order history.' });
  }
});

// GET /api/orders (Admin Only - List and filter orders)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const { status, search } = req.query;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push("(customer_name LIKE ? OR email LIKE ? OR id LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const orders = await allQuery(`
      SELECT * FROM orders 
      ${whereClause} 
      ORDER BY created_at DESC
    `, params);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving orders.' });
  }
});

// GET /api/orders/:id (Protected: details for customer who placed it OR admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await getQuery("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Security check: must be owner of order OR admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const items = await allQuery(`
      SELECT oi.*, p.name as product_name, p.image_url 
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving order details.' });
  }
});

// PUT /api/orders/:id/status (Admin Only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing order status.' });
  }

  try {
    const order = await getQuery("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const oldStatus = order.status;
    if (oldStatus === status) {
      return res.json({ message: `Order status is already "${status}".` });
    }

    db.serialize(async () => {
      db.run("BEGIN TRANSACTION");
      try {
        await runQuery("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);

        // If status changes to cancelled, restore product stock levels
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
          const items = await allQuery("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
          for (const item of items) {
            if (item.product_id) {
              await runQuery("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
            }
          }
        }
        // If status was cancelled but is now un-cancelled (e.g. processing), re-deduct product stock levels
        else if (oldStatus === 'cancelled' && status !== 'cancelled') {
          const items = await allQuery("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
          for (const item of items) {
            if (item.product_id) {
              const product = await getQuery("SELECT stock FROM products WHERE id = ?", [item.product_id]);
              if (product && product.stock < item.quantity) {
                // Return error from inside block (will trigger rollback)
                throw new Error(`Cannot revert cancellation: Insufficient stock for product ID ${item.product_id}.`);
              }
              await runQuery("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product_id]);
            }
          }
        }

        db.run("COMMIT");
        res.json({ message: 'Order status updated successfully.', status });
      } catch (err) {
        db.run("ROLLBACK");
        console.error(err);
        res.status(400).json({ error: err.message || 'Failed to update order status.' });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating order status.' });
  }
});

module.exports = router;
