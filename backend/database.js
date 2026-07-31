const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'greenbasket.db');
const db = new sqlite3.Database(dbPath);

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initializeDatabase() {
  await runQuery(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    status TEXT DEFAULT 'active',
    passkey_credential_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runQuery(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runQuery(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category_id INTEGER,
    image_url TEXT,
    featured INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
  )`);

  await runQuery(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
  )`);

  await runQuery(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
  )`);

  console.log("Database tables verified/created.");

  // Seed default users if they don't exist
  const adminExists = await getQuery("SELECT id FROM users WHERE email = ?", ['admin@greenbasket.com']);
  if (!adminExists) {
    const adminHash = await bcrypt.hash('admin123', 10);
    await runQuery("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      ['Admin User', 'admin@greenbasket.com', adminHash, 'admin']
    );
    console.log("Seeded admin user.");
  }

  const customerExists = await getQuery("SELECT id FROM users WHERE email = ?", ['customer@greenbasket.com']);
  if (!customerExists) {
    const customerHash = await bcrypt.hash('customer123', 10);
    await runQuery("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      ['Jane Customer', 'customer@greenbasket.com', customerHash, 'customer']
    );
    console.log("Seeded customer user.");
  }

  // Seed Categories if none exist
  const catCount = await getQuery("SELECT COUNT(*) as count FROM categories");
  if (catCount.count === 0) {
    await runQuery("INSERT INTO categories (name, slug) VALUES (?, ?)", ['Vegetables', 'vegetables']);
    await runQuery("INSERT INTO categories (name, slug) VALUES (?, ?)", ['Fruits', 'fruits']);
    await runQuery("INSERT INTO categories (name, slug) VALUES (?, ?)", ['Cakes', 'cakes']);
    await runQuery("INSERT INTO categories (name, slug) VALUES (?, ?)", ['Biscuits', 'biscuits']);
    console.log("Seeded categories.");

    // Seed Products
    const catRows = await allQuery("SELECT id, name FROM categories");
    const catMap = {};
    catRows.forEach(r => catMap[r.name] = r.id);

    const products = [
      // Vegetables
      {
        name: 'Organic Tomatoes',
        description: 'Fresh organic vine-ripened red tomatoes. Locally grown, juicy and packed with flavor.',
        price: 3.99,
        stock: 45,
        category_id: catMap['Vegetables'],
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
        featured: 1
      },
      {
        name: 'Sweet Orange Carrots',
        description: 'Crisp, sweet, and crunchy fresh orange carrots. Perfect for salads, juices, or roasting.',
        price: 1.89,
        stock: 60,
        category_id: catMap['Vegetables'],
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
        featured: 0
      },
      {
        name: 'Fresh Broccoli Crown',
        description: 'Nutrient-rich, vibrant green broccoli crowns. Hand-picked and fresh from local farms.',
        price: 2.49,
        stock: 5,
        category_id: catMap['Vegetables'],
        image_url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
        featured: 1
      },
      {
        name: 'Baby Spinach leaves',
        description: 'Tender baby spinach leaves. Pre-washed and ready to enjoy in salads or smoothies.',
        price: 2.99,
        stock: 30,
        category_id: catMap['Vegetables'],
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
        featured: 0
      },
      // Fruits
      {
        name: 'Honeycrisp Apples',
        description: 'Premium sweet and exceptionally crisp Honeycrisp apples. Great for snacking or baking.',
        price: 4.99,
        stock: 40,
        category_id: catMap['Fruits'],
        image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
        featured: 1
      },
      {
        name: 'Organic Cavendish Bananas',
        description: 'Rich in potassium, sweet and creamy organic bananas. Sold in bunches of 5-6.',
        price: 1.99,
        stock: 80,
        category_id: catMap['Fruits'],
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop',
        featured: 0
      },
      {
        name: 'Fresh Strawberries',
        description: 'Sweet, juicy red strawberries. Bursting with vitamins and delicious fresh taste.',
        price: 3.49,
        stock: 18,
        category_id: catMap['Fruits'],
        image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&h=400&fit=crop',
        featured: 1
      },
      // Cakes
      {
        name: 'Double Chocolate Fudge Cake',
        description: 'Indulgent, moist chocolate cake layered with rich dark chocolate fudge icing.',
        price: 18.99,
        stock: 8,
        category_id: catMap['Cakes'],
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        featured: 1
      },
      {
        name: 'Classic Red Velvet Cake',
        description: 'Traditional red velvet layers with a luxurious, smooth cream cheese frosting.',
        price: 21.50,
        stock: 4,
        category_id: catMap['Cakes'],
        image_url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=400&fit=crop',
        featured: 0
      },
      {
        name: 'Strawberry Cheesecake',
        description: 'Creamy New York style cheesecake topped with a sweet glazed strawberry compote.',
        price: 19.99,
        stock: 6,
        category_id: catMap['Cakes'],
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop',
        featured: 1
      },
      // Biscuits
      {
        name: 'Belgian Chocolate Chip Cookies',
        description: 'Crisp on the outside, chewy on the inside, loaded with real Belgian chocolate chunks.',
        price: 5.49,
        stock: 50,
        category_id: catMap['Biscuits'],
        image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
        featured: 1
      },
      {
        name: 'Buttery Shortbread Biscuits',
        description: 'Melt-in-the-mouth traditional Scottish shortbread made with pure creamery butter.',
        price: 4.89,
        stock: 35,
        category_id: catMap['Biscuits'],
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
        featured: 0
      }
    ];

    for (const p of products) {
      await runQuery(`INSERT INTO products 
        (name, description, price, stock, category_id, image_url, featured) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.price, p.stock, p.category_id, p.image_url, p.featured]
      );
    }
    console.log("Seeded products.");
  }
}

module.exports = {
  db,
  runQuery,
  allQuery,
  getQuery,
  initializeDatabase
};
