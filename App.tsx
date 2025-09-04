import React, { useState, useEffect } from 'react';
import { initialProducts, initialUsers, initialOrders } from './data';
import { User, Order, PaymentAccountDetails, ProductsData } from './types';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import ProductFlow from './ProductFlow';
import BuyCreditsView from './BuyCreditsView';
import MyOrdersView from './MyOrdersView';
import AdminPanel from './AdminPanel';
import FAQView from './FAQView';
import UserProfileView from './UserProfileView';
import { useLanguage } from './i18n';
import { LoadingSpinner } from './components';
import { usePersistentState } from './utils';

const initialPaymentDetails: PaymentAccountDetails = {
    'KPay': { name: 'ATOM Point Admin', number: '09 987 654 321' },
    'Wave Pay': { name: 'ATOM Point Services', number: '09 123 456 789' }
};

const App = () => {
  const { t } = useLanguage();
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  
  // Persisted "Database" State
  const [products, setProducts] = usePersistentState<ProductsData>('app_products', initialProducts);
  const [users, setUsers] = usePersistentState<User[]>('app_users', initialUsers);
  const [orders, setOrders] = usePersistentState<Order[]>('app_orders', initialOrders);

  // Persisted Site-wide editable settings
  const [paymentDetails, setPaymentDetails] = usePersistentState<PaymentAccountDetails>('app_paymentDetails', initialPaymentDetails);
  const [adminContact, setAdminContact] = usePersistentState<string>('app_adminContact', 'https://t.me/CEO_METAVERSE');

  // Effect to restore session on initial load
  useEffect(() => {
    try {
        const storedUser = sessionStorage.getItem('currentUser');
        const storedView = sessionStorage.getItem('currentView');

        if (storedUser) {
            const user: User = JSON.parse(storedUser);
            // Quick check to ensure the user still exists in our persistent user list
            if (users.some(u => u.id === user.id)) {
                setCurrentUser(user);
                setIsLoggedIn(true);
                setCurrentView(storedView || 'DASHBOARD');
            }
        }
    } catch (error) {
        console.error("Failed to parse session storage:", error);
        sessionStorage.clear(); // Clear corrupted storage
    } finally {
        setIsLoading(false);
    }
  }, []); // Intentionally empty: runs only once on mount after state is initialized from localStorage


  // Effect to manage body class for dynamic backgrounds
  useEffect(() => {
    const className = isLoggedIn ? 'dashboard-background' : 'auth-background';
    document.documentElement.className = className;
    document.body.className = className;

    // Cleanup on component unmount
    return () => {
      document.documentElement.className = '';
      document.body.className = '';
    };
  }, [isLoggedIn]);


  // Update currentUser in real-time when users state changes
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        // Prevent unnecessary re-renders if the user object is identical
        if (JSON.stringify(currentUser) !== JSON.stringify(updatedUser)) {
          setCurrentUser(updatedUser);
          sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      } else {
        // The user was deleted, log them out
        handleLogout();
      }
    }
  }, [users, currentUser]);

  const handleLoginSuccess = (username: string, password?: string) => {
    // In a real app, never handle passwords on the client side like this.
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        if (user.banned) {
            alert(t('app.alerts.accountBanned'));
            return;
        }
        setCurrentUser(user);
        setIsLoggedIn(true);
        setCurrentView('DASHBOARD');
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('currentView', 'DASHBOARD');
    } else {
        alert(t('app.alerts.invalidCredentials'));
    }
  };

  const handleRegisterSuccess = (username: string, password: string, securityAmount: number) => {
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        if (existingUser.banned) {
            alert(t('app.alerts.usernameBanned'));
        } else {
            alert(t('app.alerts.usernameTaken'));
        }
        return;
    }
      
    const newUser: User = { 
        id: Math.floor(100000 + Math.random() * 900000), // Generate a random 6-digit ID
        username, 
        password, // Use the provided password
        isAdmin: false, 
        credits: 0, 
        securityAmount,
        banned: false,
        notifications: ["Welcome to the new Atom Point Web!"],
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setCurrentView('DASHBOARD');
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    sessionStorage.setItem('currentView', 'DASHBOARD');
    alert(t('app.alerts.registrationSuccess', { id: newUser.id }));
  };

  const handlePasswordReset = (userId: number, newPassword: string) => {
    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === userId ? { ...u, password: newPassword } : u))
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentView');
  };

  const handleBroadcast = (message: string, targetIds: number[]) => {
      setUsers(prevUsers =>
          prevUsers.map(user => {
              if (targetIds.includes(user.id)) {
                  // Create a new notifications array to ensure state updates correctly
                  const newNotifications = [...user.notifications, message];
                  return { ...user, notifications: newNotifications };
              }
              return user;
          })
      );
      alert(t('app.alerts.broadcastSent', { count: targetIds.length }));
  };

  const sendAdminNotification = (message: string) => {
    const ADMIN_ID = 123456; // Admin user 'Tw'
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === ADMIN_ID) {
          const newNotifications = [...user.notifications, message];
          return { ...user, notifications: newNotifications };
        }
        return user;
      })
    );

    // The native browser Notification API was causing crashes in restrictive
    // webview environments. It has been removed to ensure app stability.
    // The in-app notification system still works for the admin.
  };
  
  const navigateTo = (view: string) => {
    setCurrentView(view);
    sessionStorage.setItem('currentView', view);
  };

  // --- View Renderer --- //
  const renderView = () => {
    if (!currentUser) return null; // Should not happen if logged in
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} adminContact={adminContact} />;
      case 'BROWSE_PRODUCTS':
        return <ProductFlow products={products} onNavigate={navigateTo} user={currentUser} setOrders={setOrders} setUsers={setUsers} users={users} onAdminNotify={sendAdminNotification} />;
      case 'BUY_CREDITS':
        return <BuyCreditsView user={currentUser} onNavigate={navigateTo} setOrders={setOrders} onAdminNotify={sendAdminNotification} paymentAccountDetails={paymentDetails} />;
      case 'MY_ORDERS':
        return <MyOrdersView user={currentUser} onNavigate={navigateTo} orders={orders} />;
      case 'ADMIN_PANEL':
        return <AdminPanel 
                    onNavigate={navigateTo} 
                    products={products} setProducts={setProducts} 
                    users={users} setUsers={setUsers} 
                    orders={orders} setOrders={setOrders}
                    onBroadcast={handleBroadcast}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    paymentDetails={paymentDetails}
                    setPaymentDetails={setPaymentDetails}
                    adminContact={adminContact}
                    setAdminContact={setAdminContact}
                />;
       case 'FAQ':
        return <FAQView onNavigate={navigateTo} />;
      case 'USER_PROFILE':
        return <UserProfileView user={currentUser} orders={orders} onNavigate={navigateTo} />;
      default:
        return <Dashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} adminContact={adminContact} />;
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isLoggedIn && currentUser ? (
        renderView()
      ) : (
        <AuthPage 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterSuccess={handleRegisterSuccess}
            onPasswordReset={handlePasswordReset}
            users={users}
            adminContact={adminContact}
        />
      )}
    </>
  );
};

export default App;
