const express = require('express');
const router = express.Router();
const { getQuery, runQuery, allQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

// GET /api/categories (Public)
router.get('/', async (req, res) => {
  try {
    // Include number of products in each category
    const categories = await allQuery(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id
    `);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving categories.' });
  }
});

// POST /api/categories (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const slug = slugify(name);

  try {
    const existing = await getQuery("SELECT * FROM categories WHERE slug = ?", [slug]);
    if (existing) {
      return res.status(400).json({ error: 'A category with this name or slug already exists.' });
    }

    const result = await runQuery("INSERT INTO categories (name, slug) VALUES (?, ?)", [name, slug]);
    const newCategory = await getQuery("SELECT * FROM categories WHERE id = ?", [result.lastID]);
    res.status(201).json({ category: newCategory, message: 'Category created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating category.' });
  }
});

// PUT /api/categories/:id (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const slug = slugify(name);

  try {
    const existing = await getQuery("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const duplicate = await getQuery("SELECT * FROM categories WHERE slug = ? AND id != ?", [slug, req.params.id]);
    if (duplicate) {
      return res.status(400).json({ error: 'A category with this name or slug already exists.' });
    }

    await runQuery("UPDATE categories SET name = ?, slug = ? WHERE id = ?", [name, slug, req.params.id]);
    const updated = await getQuery("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    res.json({ category: updated, message: 'Category updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating category.' });
  }
});

// DELETE /api/categories/:id (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const existing = await getQuery("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    await runQuery("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting category.' });
  }
});

module.exports = router;
