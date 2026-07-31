import React, { useState, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, toast } from './components/Toast';
import { ProductDetailsModal } from './components/Modal';

// Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { Profile } from './pages/Profile';
import { CustomerLogin } from './pages/CustomerLogin';
import { AdminLogin } from './pages/AdminLogin';

// Admin Portal Pages
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminOrders } from './pages/admin/AdminOrders';

function MainAppLayout() {
  const [currentTab, setTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { user, loading } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart.`);
  };

  // Route protection gate
  const navigateToTab = (tab) => {
    if (tab.startsWith('admin-')) {
      if (!user || user.role !== 'admin') {
        console.log('[navigateToTab] BLOCKED admin tab. user:', user?.email, 'role:', user?.role, 'tab:', tab);
        toast.error("Unauthenticated. Please log in as an administrator.");
        setTab('admin-login');
        return;
      }
      console.log('[navigateToTab] ALLOWED admin tab. user:', user?.email, 'role:', user?.role, 'tab:', tab);
    } else {
      console.log('[navigateToTab] Non-admin tab. tab:', tab);
    }
    setTab(tab);
  };

  // Renders active page content
  const renderPageContent = () => {
    switch (currentTab) {
      // Customer Portal
      case 'home':
        return (
          <Home 
            setTab={navigateToTab} 
            setCategoryFilter={setCategoryFilter} 
            onProductSelect={handleProductSelect} 
          />
        );
      case 'products':
        return (
          <Products 
            categoryFilter={categoryFilter} 
            setCategoryFilter={setCategoryFilter} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onProductSelect={handleProductSelect} 
          />
        );
      case 'cart':
        return <Cart setTab={navigateToTab} />;
      case 'checkout':
        return <Checkout setTab={navigateToTab} setLastOrderDetails={setLastOrderDetails} />;
      case 'confirmation':
        return <Confirmation setTab={navigateToTab} orderDetails={lastOrderDetails} />;
      case 'profile':
        return <Profile setTab={navigateToTab} />;
      case 'login':
        return <CustomerLogin setTab={navigateToTab} setTabRaw={setTab} />;
      case 'admin-login':
        return <AdminLogin setTab={navigateToTab} setTabRaw={setTab} />;

      // Admin Portal
      case 'admin-dashboard':
        return <AdminDashboard setTab={navigateToTab} />;
      case 'admin-products':
        return <AdminProducts />;
      case 'admin-categories':
        return <AdminCategories />;
      case 'admin-users':
        return <AdminUsers />;
      case 'admin-orders':
        return <AdminOrders />;
      
      default:
        return <Home setTab={navigateToTab} setCategoryFilter={setCategoryFilter} onProductSelect={handleProductSelect} />;
    }
  };

  const isAdminTab = currentTab.startsWith('admin-') && currentTab !== 'admin-login';

  if (loading) {
    return (
      <div className="app-init-loader">
        <div className="init-spinner">🌿</div>
        <p>Loading GreenBasket services...</p>
        <style>{`
          .app-init-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: var(--light-gray);
            gap: 16px;
            color: var(--text-muted);
            font-family: 'Outfit', sans-serif;
          }
          .init-spinner {
            font-size: 3rem;
            animation: spinEmoji 2s linear infinite;
          }
          @keyframes spinEmoji {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isAdminTab ? (
        /* Admin layout with Sidebar */
        <div className="admin-layout">
          <Sidebar currentTab={currentTab} setTab={navigateToTab} />
          <main className="admin-main">
            {renderPageContent()}
          </main>
        </div>
      ) : (
        /* Customer Portal Layout */
        <>
          <Navbar 
            setTab={navigateToTab} 
            currentTab={currentTab} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <main className="main-content">
            {renderPageContent()}
          </main>
        </>
      )}

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Detail Overlay Modal */}
      <ProductDetailsModal 
        isOpen={selectedProduct !== null} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  if (!googleClientId) {
    return (
      <AuthProvider>
        <CartProvider>
          <MainAppLayout />
        </CartProvider>
      </AuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <CartProvider>
          <MainAppLayout />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
