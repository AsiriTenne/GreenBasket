const express = require('express');
const router = express.Router();
const { getQuery, runQuery, allQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/products (Public Catalog with filter, sort, page)
router.get('/', async (req, res) => {
  let { search, category, sort, featured, page, limit, include_inactive } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 8;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  // Filter out inactive products unless Admin explicitly wants all
  if (include_inactive !== 'true') {
    conditions.push("p.status = 'active'");
  }

  if (search) {
    conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    if (isNaN(category)) {
      // It is a slug
      conditions.push("c.slug = ?");
    } else {
      conditions.push("p.category_id = ?");
    }
    params.push(category);
  }

  if (featured === '1') {
    conditions.push("p.featured = 1");
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  // Sorting
  let orderBy = "p.created_at DESC"; // default newest
  if (sort === 'price_asc') {
    orderBy = "p.price ASC";
  } else if (sort === 'price_desc') {
    orderBy = "p.price DESC";
  }

  try {
    // Get total count
    const countSql = `
      SELECT COUNT(*) as count 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ${whereClause}
    `;
    const countRow = await getQuery(countSql, params);
    const total = countRow ? countRow.count : 0;
    const pages = Math.ceil(total / limit);

    // Get rows
    const dataSql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const listParams = [...params, limit, offset];
    const products = await allQuery(dataSql, listParams);

    res.json({
      products,
      total,
      page,
      pages,
      limit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving products.' });
  }
});

// GET /api/products/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await getQuery(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving product details.' });
  }
});

// POST /api/products (Admin Only - Create product with optional image upload)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category_id, featured, status } = req.body;

  if (!name || !price || !stock) {
    return res.status(400).json({ error: 'Name, price, and stock are required.' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.png';
  const isFeatured = featured === 'true' || featured === '1' ? 1 : 0;
  const productStatus = status || 'active';

  try {
    const result = await runQuery(`
      INSERT INTO products (name, description, price, stock, category_id, image_url, featured, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, parseFloat(price), parseInt(stock), category_id ? parseInt(category_id) : null, imageUrl, isFeatured, productStatus]);

    const newProduct = await getQuery("SELECT * FROM products WHERE id = ?", [result.lastID]);
    res.status(201).json({ product: newProduct, message: 'Product created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating product.' });
  }
});

// PUT /api/products/:id (Admin Only - Update product)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category_id, featured, status } = req.body;

  try {
    const existing = await getQuery("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updatedImageUrl = req.file ? `/uploads/${req.file.filename}` : existing.image_url;
    const isFeatured = featured !== undefined ? (featured === 'true' || featured === '1' ? 1 : 0) : existing.featured;
    const productStatus = status || existing.status;

    await runQuery(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?, featured = ?, status = ?
      WHERE id = ?
    `, [
      name || existing.name,
      description !== undefined ? description : existing.description,
      price !== undefined ? parseFloat(price) : existing.price,
      stock !== undefined ? parseInt(stock) : existing.stock,
      category_id !== undefined ? (category_id ? parseInt(category_id) : null) : existing.category_id,
      updatedImageUrl,
      isFeatured,
      productStatus,
      req.params.id
    ]);

    const updatedProduct = await getQuery("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.json({ product: updatedProduct, message: 'Product updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating product.' });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const existing = await getQuery("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await runQuery("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting product.' });
  }
});

module.exports = router;
