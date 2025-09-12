import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SocialLogin from './components/SocialLogin';
import LoginActions from './components/LoginActions';
import LanguageToggle from './components/LanguageToggle';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');

    if (isAuthenticated === 'true' && userRole) {
      // Redirect to appropriate dashboard
      switch (userRole) {
        case 'customer': navigate('/customer-dashboard');
          break;
        case 'host': navigate('/host-dashboard');
          break;
        case 'admin': navigate('/customer-dashboard');
          break;
        default:
          navigate('/customer-dashboard');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Language Toggle */}
      <LanguageToggle />
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-success/10 rounded-full blur-lg"></div>
      {/* Main Content */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 elevation-4">
          {/* Header */}
          <LoginHeader />

          {/* Login Form */}
          <LoginForm />

          {/* Social Login */}
          <SocialLogin />

          {/* Additional Actions */}
          <LoginActions />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date()?.getFullYear()} Commun Printing. Všechna práva vyhrazena.
          </p>
          <div className="mt-2 space-x-4">
            <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-micro">
              Podmínky použití
            </a>
            <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-micro">
              Ochrana soukromí
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;