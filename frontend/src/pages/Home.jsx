import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { CartContext } from '../context/CartContext';
import { Spinner } from '../components/Loader';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { toast } from '../components/Toast';

export const Home = ({ setTab, setCategoryFilter, onProductSelect, backendUrl = API_BASE_URL.replace('/api', '') }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?featured=1&limit=4');
        setFeaturedProducts(res.products);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleCategoryClick = (catSlug) => {
    setCategoryFilter(catSlug);
    setTab('products');
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Avoid opening details modal
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const categories = [
    { name: 'Vegetables', slug: 'vegetables', icon: '🥦', desc: 'Fresh organic greens' },
    { name: 'Fruits', slug: 'fruits', icon: '🍎', desc: 'Sweet sun-ripened fruits' },
    { name: 'Cakes', slug: 'cakes', icon: '🍰', desc: 'Gourmet artisanal cakes' },
    { name: 'Biscuits', slug: 'biscuits', icon: '🍪', desc: 'Crispy butter cookies' }
  ];

  return (
    <div className="home-page anim-fade">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-container">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>100% Organic & Fresh Produce</span>
          </div>
          <h1 className="hero-title">
            Healthy Eating <br />
            Made Simple & Beautiful
          </h1>
          <p className="hero-subtitle">
            Order fresh, locally-sourced organic vegetables, fruits, gourmet cakes, and biscuits directly to your doorstep.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-btn-main" onClick={() => handleCategoryClick('')}>
              Shop Fresh Items <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary hero-btn-sec" onClick={() => setTab('products')}>
              Browse All
            </button>
          </div>
        </div>
      </section>

      {/* Feature Selling Points */}
      <section className="features-section container">
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper">
            <Truck className="feature-icon" size={24} />
          </div>
          <h3>Express Delivery</h3>
          <p>Free contactless home delivery on all orders over $40.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper">
            <ShieldCheck className="feature-icon" size={24} />
          </div>
          <h3>Premium Quality</h3>
          <p>Strict safety checks and handpicked organic certifications.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper">
            <Star className="feature-icon" size={24} />
          </div>
          <h3>Local Farmers First</h3>
          <p>Supporting local growers and baking community bakers.</p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section container">
        <div className="section-header">
          <h2>Browse By Category</h2>
          <p>Find the healthiest options in our curated departments</p>
        </div>
        <div className="categories-grid">
          {categories.map((c, idx) => (
            <div 
              key={idx} 
              className="home-category-card glass-panel"
              onClick={() => handleCategoryClick(c.slug)}
            >
              <span className="cat-card-emoji">{c.icon}</span>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <span className="cat-card-arrow"><ArrowRight size={16} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section container">
        <div className="section-header">
          <h2>Weekly Featured Items</h2>
          <p>Top selections highly recommended by our nutrition experts</p>
        </div>

        {loading ? (
          <div className="home-spinner-wrapper">
            <Spinner size="large" />
          </div>
        ) : (
          <div className="cards-grid">
            {featuredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              return (
                <div 
                  key={p.id} 
                  className="product-card glass-panel"
                  onClick={() => onProductSelect(p)}
                >
                  <div className="prod-img-container">
                    <img 
                      src={p.image_url.startsWith('http') ? p.image_url : `${backendUrl}${p.image_url}`} 
                      alt={p.name} 
                      className="prod-img"
                    />
                    <span className="featured-tag">Best Seller</span>
                  </div>
                  <div className="prod-info">
                    <div className="prod-meta">
                      <span className="prod-category">{p.category_name}</span>
                      <span className={`prod-stock-lbl ${isOutOfStock ? 'out' : p.stock < 10 ? 'low' : ''}`}>
                        {isOutOfStock ? 'Out of Stock' : p.stock < 10 ? `Only ${p.stock} left` : 'In Stock'}
                      </span>
                    </div>
                    <h3 className="prod-title">{p.name}</h3>
                    <div className="prod-footer">
                      <span className="prod-price">${p.price.toFixed(2)}</span>
                      <button 
                        className="btn btn-primary add-to-cart-small"
                        onClick={(e) => handleAddToCart(e, p)}
                        disabled={isOutOfStock}
                        title="Add to Cart"
                      >
                        <ShoppingBag size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="featured-footer-action">
          <button className="btn btn-secondary" onClick={() => handleCategoryClick('')}>
            View Whole Catalog
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section container">
        <div className="newsletter-box glass-panel">
          <h2>Join the Fresh Club</h2>
          <p>Subscribe to receive cooking recipes, weekly farm updates, and exclusive 15% discount vouchers.</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }}>
            <input type="email" placeholder="Enter your email address" className="form-input newsletter-input" required />
            <button type="submit" className="btn btn-primary newsletter-btn">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h2>🌿 GreenBasket</h2>
            <p>Bringing premium organic items to your life since 2026.</p>
          </div>
          <div className="footer-links-col">
            <h4>Departments</h4>
            <span onClick={() => handleCategoryClick('vegetables')}>Vegetables</span>
            <span onClick={() => handleCategoryClick('fruits')}>Fruits</span>
            <span onClick={() => handleCategoryClick('cakes')}>Cakes</span>
            <span onClick={() => handleCategoryClick('biscuits')}>Biscuits</span>
          </div>
          <div className="footer-links-col">
            <h4>Portal Auth</h4>
            <span onClick={() => setTab('login')}>Customer Sign In</span>
            <span onClick={() => setTab('admin-login')}>Admin Dashboard Gate</span>
          </div>
        </div>
        <div className="container footer-copy">
          &copy; 2026 GreenBasket. All rights reserved. Made with love.
        </div>
      </footer>

      <style>{`
        .hero-section {
          background: linear-gradient(135deg, hsl(172, 78%, 95%) 0%, hsl(36, 96%, 95%) 100%);
          padding: 100px 0;
          position: relative;
          text-align: center;
          margin-bottom: 50px;
        }
        .hero-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 800px !important;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--primary-glow);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 24px;
          border: 1px solid hsla(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.2);
        }
        .hero-title {
          font-size: 3.5rem;
          line-height: 1.15;
          margin-bottom: 20px;
          font-weight: 800;
          color: var(--dark);
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          margin-bottom: 36px;
          max-width: 600px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
        }
        .hero-btn-main {
          padding: 14px 28px;
        }
        .hero-btn-sec {
          padding: 14px 28px;
        }
        
        .features-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 80px;
        }
        .feature-card {
          padding: 30px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: var(--transition-normal);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
        .feature-icon-wrapper {
          width: 50px;
          height: 50px;
          background-color: var(--primary-glow);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .feature-card p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .section-header h2 {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .section-header p {
          color: var(--text-muted);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 80px;
        }
        .home-category-card {
          padding: 24px;
          text-align: center;
          cursor: pointer;
          position: relative;
          transition: var(--transition-normal);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .home-category-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }
        .cat-card-emoji {
          font-size: 3rem;
          margin-bottom: 12px;
        }
        .home-category-card h3 {
          font-size: 1.15rem;
          margin-bottom: 4px;
        }
        .home-category-card p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .cat-card-arrow {
          color: var(--text-muted);
          transition: var(--transition-fast);
        }
        .home-category-card:hover .cat-card-arrow {
          color: var(--primary);
          transform: translateX(4px);
        }

        .home-spinner-wrapper {
          display: flex;
          justify-content: center;
          padding: 50px 0;
        }
        
        .featured-footer-action {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          margin-bottom: 80px;
        }

        .newsletter-section {
          margin-bottom: 80px;
        }
        .newsletter-box {
          padding: 60px 40px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .newsletter-box h2 {
          font-size: 2.25rem;
        }
        .newsletter-box p {
          max-width: 500px;
          color: var(--text-muted);
        }
        .newsletter-form {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 500px;
          margin-top: 10px;
        }
        .newsletter-input {
          border-radius: var(--radius-full);
          padding-left: 20px;
        }
        .newsletter-btn {
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .home-footer {
          background-color: var(--white);
          border-top: 1px solid var(--border-color);
          padding: 60px 0 20px 0;
          margin-top: 80px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-brand h2 {
          font-size: 1.5rem;
          margin-bottom: 12px;
        }
        .footer-brand p {
          color: var(--text-muted);
          font-size: 0.9rem;
          max-width: 250px;
        }
        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links-col h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .footer-links-col span {
          font-size: 0.875rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .footer-links-col span:hover {
          color: var(--primary);
        }
        .footer-copy {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 992px) {
          .features-section {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 10px;
          }
          .categories-grid {
            grid-template-columns: 1fr;
          }
          .newsletter-form {
            flex-direction: column;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
      `}</style>
    </div>
  );
};
