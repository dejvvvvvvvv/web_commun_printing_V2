import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [userRole, setUserRole] = useState('customer'); // 'customer' or 'host'
  const location = useLocation();

  // Mock user role detection - in real app, this would come from auth context
  useEffect(() => {
    const path = location?.pathname;
    if (path?.includes('host-dashboard')) {
      setUserRole('host');
    } else {
      setUserRole('customer');
    }
  }, [location?.pathname]);

  const customerNavItems = [
    { label: 'Dashboard', path: '/customer-dashboard', icon: 'LayoutDashboard' },
    { label: 'Upload Model', path: '/model-upload', icon: 'Upload' },
    { label: 'Printers', path: '/printer-catalog', icon: 'Printer' },
    { label: 'Orders', path: '/orders', icon: 'Package' },
    { label: 'Eshop', path: '/eshop', icon: 'ShoppingCart' },
  ];

  const hostNavItems = [
    { label: 'Dashboard', path: '/host-dashboard', icon: 'LayoutDashboard' },
    { label: 'My Printers', path: '/my-printers', icon: 'Printer' },
    { label: 'Orders', path: '/orders', icon: 'Package' },
    { label: 'Earnings', path: '/earnings', icon: 'DollarSign' },
  ];

  const navItems = userRole === 'host' ? hostNavItems : customerNavItems;

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const handleNotificationClick = () => {
    setNotifications(0);
  };

  const Logo = () => (
    <Link to={userRole === 'host' ? '/host-dashboard' : '/customer-dashboard'} className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon name="Layers3" size={20} color="white" />
      </div>
      <span className="text-xl font-semibold text-foreground">Commun Printing</span>
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-card border-b border-border elevation-2">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-micro hover-scale ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
                {item?.label === 'Orders' && notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Action Button */}
            <Button
              variant="default"
              size="sm"
              iconName={userRole === 'host' ? 'Plus' : 'Upload'}
              iconPosition="left"
              onClick={() => {
                window.location.href = userRole === 'host' ? '/add-printer' : '/model-upload';
              }}
            >
              {userRole === 'host' ? 'Add Printer' : 'Upload Model'}
            </Button>

            {/* Notifications */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-micro rounded-lg hover:bg-muted"
            >
              <Icon name="Bell" size={20} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <Link to="/account" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Icon name="User" size={16} />
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-micro">
                <Icon name="ChevronDown" size={16} />
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-micro rounded-lg hover:bg-muted"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-down">
            <nav className="space-y-2">
              {navItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-micro ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                  {item?.label === 'Orders' && notifications > 0 && (
                    <span className="ml-auto bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <Button
                variant="default"
                fullWidth
                iconName={userRole === 'host' ? 'Plus' : 'Upload'}
                iconPosition="left"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.location.href = userRole === 'host' ? '/add-printer' : '/model-upload';
                }}
              >
                {userRole === 'host' ? 'Add Printer' : 'Upload Model'}
              </Button>

              <div className="flex items-center justify-between px-4 py-2">
                <Link to="/account" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} />
                  </div>
                  <span className="text-sm font-medium">Účet</span>
                </Link>
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-muted-foreground hover:text-foreground transition-micro rounded-lg hover:bg-muted"
                >
                  <Icon name="Bell" size={18} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;