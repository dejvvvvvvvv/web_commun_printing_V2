import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import OrderCard from './components/OrderCard';
import QuickActions from './components/QuickActions';
import MetricsCard from './components/MetricsCard';
import RecommendedPrinters from './components/RecommendedPrinters';
import NotificationCenter from './components/NotificationCenter';
import Icon from '../../components/AppIcon';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendedPrinters, setRecommendedPrinters] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      // Mock orders data
      const mockOrders = [
        {
          id: "ORD-2025-001",
          modelName: "Miniaturní robot",
          status: "printing",
          totalPrice: 450,
          quantity: 2,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          printer: {
            id: "PRT-001",
            name: "Prusa i3 MK3S+",
            hostName: "Jan Novák",
            hostId: "HOST-001",
            location: "Ostrava-Jih",
            rating: 4.8
          },
          trackingInfo: "Tisk probíhá - 65% dokončeno"
        },
        {
          id: "ORD-2025-002",
          modelName: "Náhradní díl ventilátoru",
          status: "completed",
          totalPrice: 180,
          quantity: 1,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          printer: {
            id: "PRT-002",
            name: "Ender 3 V2",
            hostName: "Marie Svobodová",
            hostId: "HOST-002",
            location: "Ostrava-Poruba",
            rating: 4.6
          },
          trackingInfo: "Doručeno - podepsáno příjemcem"
        },
        {
          id: "ORD-2025-003",
          modelName: "Dekorativní váza",
          status: "pending",
          totalPrice: 320,
          quantity: 1,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          printer: null,
          trackingInfo: null
        }
      ];

      // Mock notifications data
      const mockNotifications = [
        {
          id: "NOT-001",
          type: "order_update",
          title: "Objednávka dokončena",
          message: "Vaše objednávka ORD-2025-002 byla úspěšně dokončena a je připravena k vyzvednutí.",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false,
          actionUrl: "/orders/ORD-2025-002",
          actionText: "Zobrazit objednávku"
        },
        {
          id: "NOT-002",
          type: "printer",
          title: "Nová tiskárna v okolí",
          message: "V oblasti Ostrava-Vítkovice je nyní dostupná nová tiskárna s expresním tiskem.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
          actionUrl: "/printer-catalog",
          actionText: "Prohlédnout tiskárny"
        },
        {
          id: "NOT-003",
          type: "promotion",
          title: "Sleva 15% na první objednávku",
          message: "Využijte speciální slevu pro nové zákazníky. Platí do konce měsíce.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isRead: true,
          actionUrl: "/model-upload",
          actionText: "Nahrát model"
        },
        {
          id: "NOT-004",
          type: "system",
          title: "Aktualizace platformy",
          message: "Systém byl aktualizován s novými funkcemi pro lepší sledování objednávek.",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRead: true
        }
      ];

      // Mock recommended printers data
      const mockRecommendedPrinters = [
        {
          id: "PRT-003",
          name: "Prusa MINI+",
          hostName: "Tomáš Dvořák",
          hostId: "HOST-003",
          location: "Ostrava-Centrum",
          rating: 4.9,
          pricePerGram: 2.5,
          estimatedTime: "2-3 dny",
          isExpress: true,
          isAvailable: true,
          materials: ["PLA", "PETG", "ABS"],
          image: "https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: "PRT-004",
          name: "Artillery Sidewinder X2",
          hostName: "Pavel Krejčí",
          hostId: "HOST-004",
          location: "Ostrava-Mariánské Hory",
          rating: 4.7,
          pricePerGram: 2.2,
          estimatedTime: "1-2 dny",
          isExpress: false,
          isAvailable: true,
          materials: ["PLA", "ABS", "WOOD", "CARBON"],
          image: "https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: "PRT-005",
          name: "Bambu Lab A1 mini",
          hostName: "Lucie Horáková",
          hostId: "HOST-005",
          location: "Ostrava-Jih",
          rating: 4.8,
          pricePerGram: 3.0,
          estimatedTime: "1 den",
          isExpress: true,
          isAvailable: false,
          materials: ["PLA", "PETG", "TPU", "SUPPORT"],
          image: "https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
      ];

      // Mock metrics data
      const mockMetrics = {
        activeOrders: {
          value: mockOrders?.filter(o => ['pending', 'printing']?.includes(o?.status))?.length,
          trend: 25,
          subtitle: "Aktuálně zpracovávané"
        },
        completedProjects: {
          value: 12,
          trend: 15,
          subtitle: "Celkem dokončeno"
        },
        loyaltyPoints: {
          value: 1250,
          progress: 62,
          subtitle: "Do další úrovně: 750 bodů"
        },
        totalSpent: {
          value: "8,450 Kč",
          trend: -5,
          subtitle: "Tento měsíc"
        }
      };

      setOrders(mockOrders);
      setNotifications(mockNotifications);
      setRecommendedPrinters(mockRecommendedPrinters);
      setMetrics(mockMetrics);
      setLoading(false);
    };

    // Simulate API call delay
    setTimeout(initializeData, 500);
  }, []);

  const handleViewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleContactHost = (hostId) => {
    navigate(`/chat/${hostId}`);
  };

  const handleReorder = (orderId) => {
    const order = orders?.find(o => o?.id === orderId);
    if (order) {
      navigate('/model-upload', { state: { reorderData: order } });
    }
  };

  const handleViewPrinter = (printerId) => {
    navigate(`/printer-catalog/${printerId}`);
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev?.map(notification => 
        notification?.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev?.map(notification => ({ ...notification, isRead: true }))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)]?.map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {[...Array(3)]?.map((_, i) => (
                    <div key={i} className="h-48 bg-muted rounded-lg"></div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="h-64 bg-muted rounded-lg"></div>
                  <div className="h-96 bg-muted rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders?.filter(order => ['pending', 'printing']?.includes(order?.status));
  const recentOrders = orders?.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Vítejte zpět! 👋
                </h1>
                <p className="text-muted-foreground">
                  Zde je přehled vašich 3D tiskových projektů
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Calendar" size={16} />
                <span>Poslední aktualizace: {new Date()?.toLocaleDateString('cs-CZ')}</span>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard
              title="Aktivní objednávky"
              value={metrics?.activeOrders?.value || 0}
              subtitle={metrics?.activeOrders?.subtitle}
              icon="Package"
              color="bg-primary/10 text-primary"
              trend={metrics?.activeOrders?.trend}
              progress={null}
            />
            <MetricsCard
              title="Dokončené projekty"
              value={metrics?.completedProjects?.value || 0}
              subtitle={metrics?.completedProjects?.subtitle}
              icon="CheckCircle"
              color="bg-success/10 text-success"
              trend={metrics?.completedProjects?.trend}
              progress={null}
            />
            <MetricsCard
              title="Věrnostní body"
              value={metrics?.loyaltyPoints?.value || 0}
              subtitle={metrics?.loyaltyPoints?.subtitle}
              icon="Star"
              color="bg-accent/10 text-accent"
              trend={null}
              progress={metrics?.loyaltyPoints?.progress}
            />
            <MetricsCard
              title="Celková útrata"
              value={metrics?.totalSpent?.value || "0 Kč"}
              subtitle={metrics?.totalSpent?.subtitle}
              icon="CreditCard"
              color="bg-secondary/10 text-secondary-foreground"
              trend={metrics?.totalSpent?.trend}
              progress={null}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Orders */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Orders */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Nedávné objednávky</h2>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-micro"
                  >
                    Zobrazit vše →
                  </button>
                </div>

                {recentOrders?.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders?.map((order) => (
                      <OrderCard
                        key={order?.id}
                        order={order}
                        onViewDetails={handleViewOrderDetails}
                        onContactHost={handleContactHost}
                        onReorder={handleReorder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Žádné objednávky</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Začněte nahráním svého prvního 3D modelu
                    </p>
                    <button
                      onClick={() => navigate('/model-upload')}
                      className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-micro"
                    >
                      <Icon name="Upload" size={16} />
                      <span>Nahrát model</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recommended Printers */}
              <RecommendedPrinters
                printers={recommendedPrinters}
                onViewPrinter={handleViewPrinter}
                onContactHost={handleContactHost}
              />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActions />

              {/* Notification Center */}
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              />
            </div>
          </div>

          {/* Bottom Section - Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Help & Support */}
            <div className="bg-card border border-border rounded-lg p-6 elevation-2">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="HelpCircle" size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Potřebujete pomoc?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Naše podpora je k dispozici 24/7 pro řešení vašich dotazů
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-micro text-sm">
                  <Icon name="MessageCircle" size={14} />
                  <span>Live Chat</span>
                </button>
                <button className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-micro text-sm">
                  <Icon name="Mail" size={14} />
                  <span>Email</span>
                </button>
                <button className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-micro text-sm">
                  <Icon name="Phone" size={14} />
                  <span>Telefon</span>
                </button>
              </div>
            </div>

            {/* Community */}
            <div className="bg-card border border-border rounded-lg p-6 elevation-2">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Users" size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Komunita</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Připojte se k naší komunitě 3D tiskařů a sdílejte své projekty
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-micro text-sm">
                  <Icon name="MessageSquare" size={14} />
                  <span>Fórum</span>
                </button>
                <button className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-micro text-sm">
                  <Icon name="Calendar" size={14} />
                  <span>Události</span>
                </button>
                <button className="inline-flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-micro text-sm">
                  <Icon name="BookOpen" size={14} />
                  <span>Návody</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;