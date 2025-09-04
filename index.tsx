import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { apiClient } from './src/api';

// Import your existing types
import { User, ProductsData, Order, PaymentAccountDetails, FAQ } from './types';

// Your existing components (keep them the same, just update data fetching)

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<ProductsData>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccountDetails>({});
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await apiClient.getCurrentUser();
          setCurrentUser(user);
          
          // Load user-specific data
          const [productsData, ordersData, notificationsData] = await Promise.all([
            apiClient.getProducts(),
            apiClient.getUserOrders(),
            apiClient.getUserNotifications()
          ]);
          
          setProducts(productsData);
          setOrders(ordersData);
          setCurrentUser(prev => prev ? { ...prev, notifications: notificationsData } : null);
        } catch (error) {
          console.error('Failed to load user data:', error);
          apiClient.clearToken();
        }
      }
      
      // Load public data
      const [paymentAccountsData, faqsData] = await Promise.all([
        apiClient.getPaymentAccounts(),
        apiClient.getFAQs()
      ]);
      
      setPaymentAccounts(paymentAccountsData);
      setFAQs(faqsData);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiClient.login(username, password);
      setCurrentUser(response.user);
      await loadInitialData(); // Reload data for the logged-in user
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (username: string, password: string, securityAmount: number) => {
    try {
      const response = await apiClient.register(username, password, securityAmount);
      setCurrentUser(response.user);
      await loadInitialData(); // Reload data for the new user
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setCurrentUser(null);
    setOrders([]);
    // Keep products, payment accounts, and FAQs as they're public
  };

  const handleProductPurchase = async (productId: string, deliveryInfo: string) => {
    try {
      await apiClient.createProductOrder(productId, deliveryInfo);
      
      // Refresh user data and orders
      const [user, ordersData] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getUserOrders()
      ]);
      
      setCurrentUser(prev => prev ? { ...prev, credits: user.credits } : null);
      setOrders(ordersData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleCreditPurchase = async (amount: number, paymentMethod: string, paymentProof: string) => {
    try {
      await apiClient.createCreditOrder(amount, paymentMethod, paymentProof);
      
      // Refresh orders
      const ordersData = await apiClient.getUserOrders();
      setOrders(ordersData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Rest of your existing App component logic...
  // Just replace the localStorage operations with the API calls above
  
  return (
    // Your existing JSX
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
