import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import EarningsPanel from './components/EarningsPanel';
import PrinterManagementCards from './components/PrinterManagementCards';
import ActiveJobsTable from './components/ActiveJobsTable';
import NotificationCenter from './components/NotificationCenter';
import AnalyticsWidgets from './components/AnalyticsWidgets';

const HostDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('cs-CZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('cs-CZ', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const quickStats = {
    activePrinters: 3,
    todayOrders: 8,
    pendingJobs: 5,
    todayEarnings: 2450
  };

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: 'LayoutDashboard' },
    { id: 'jobs', label: 'Zakázky', icon: 'Package' },
    { id: 'printers', label: 'Tiskárny', icon: 'Printer' },
    { id: 'earnings', label: 'Výdělky', icon: 'DollarSign' },
    { id: 'analytics', label: 'Analytika', icon: 'BarChart3' },
    { id: 'notifications', label: 'Oznámení', icon: 'Bell' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="w-full px-6 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Vítejte zpět, hostiteli!
                </h1>
                <p className="text-muted-foreground">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => window.location.href = '/add-printer'}
                >
                  Přidat tiskárnu
                </Button>
                <Button
                  variant="outline"
                  iconName="Settings"
                  iconPosition="left"
                >
                  Nastavení
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg border border-border p-4 elevation-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <Icon name="Printer" size={20} className="text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{quickStats?.activePrinters}</div>
                  <div className="text-sm text-muted-foreground">Aktivní tiskárny</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4 elevation-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{quickStats?.todayOrders}</div>
                  <div className="text-sm text-muted-foreground">Dnešní objednávky</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4 elevation-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{quickStats?.pendingJobs}</div>
                  <div className="text-sm text-muted-foreground">Čekající zakázky</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4 elevation-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Icon name="DollarSign" size={20} className="text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{quickStats?.todayEarnings?.toLocaleString()} Kč</div>
                  <div className="text-sm text-muted-foreground">Dnešní výdělky</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2">
                    <ActiveJobsTable />
                  </div>
                  <div>
                    <NotificationCenter />
                  </div>
                </div>
                <PrinterManagementCards />
                <EarningsPanel />
              </div>
            )}

            {activeTab === 'jobs' && (
              <ActiveJobsTable />
            )}

            {activeTab === 'printers' && (
              <PrinterManagementCards />
            )}

            {activeTab === 'earnings' && (
              <EarningsPanel />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsWidgets />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenter />
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h3 className="text-lg font-medium text-foreground mb-2">Rychlé akce</h3>
                <p className="text-sm text-muted-foreground">
                  Nejčastěji používané funkce pro efektivní správu
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link to="/add-printer">
                  <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
                    Přidat tiskárnu
                  </Button>
                </Link>
                <Link to="/maintenance-schedule">
                  <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left">
                    Naplánovat údržbu
                  </Button>
                </Link>
                <Link to="/earnings-export">
                  <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
                    Export výdělků
                  </Button>
                </Link>
                <Link to="/customer-support">
                  <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                    Podpora zákazníků
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;