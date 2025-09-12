import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for different user roles
  const mockCredentials = {
    customer: { email: 'customer@communprinting.cz', password: 'customer123' },
    host: { email: 'host@communprinting.cz', password: 'host123' },
    admin: { email: 'admin@communprinting.cz', password: 'admin123' }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email je povinný';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    if (!formData?.password) {
      newErrors.password = 'Heslo je povinné';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Heslo musí mít alespoň 6 znaků';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials and determine user role
      let userRole = null;
      let isValidCredentials = false;

      Object.entries(mockCredentials)?.forEach(([role, credentials]) => {
        if (formData?.email === credentials?.email && formData?.password === credentials?.password) {
          userRole = role;
          isValidCredentials = true;
        }
      });

      if (!isValidCredentials) {
        setErrors({
          general: 'Neplatné přihlašovací údaje. Zkuste znovu.'
        });
        setIsLoading(false);
        return;
      }

      // Store user session (in real app, this would be handled by auth context)
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData?.email);

      // Redirect based on user role
      switch (userRole) {
        case 'customer': navigate('/customer-dashboard');
          break;
        case 'host': navigate('/host-dashboard');
          break;
        case 'admin': navigate('/customer-dashboard'); // Admin uses customer dashboard for now
          break;
        default:
          navigate('/customer-dashboard');
      }

    } catch (error) {
      setErrors({
        general: 'Chyba při přihlašování. Zkuste to znovu.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="váš@email.cz"
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          label="Heslo"
          type="password"
          name="password"
          placeholder="Zadejte heslo"
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
          disabled={isLoading}
        />

        {/* Remember Me Checkbox */}
        <Checkbox
          label="Zapamatovat si mě"
          name="rememberMe"
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          disabled={isLoading}
        />

        {/* General Error Message */}
        {errors?.general && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} />
              <span>{errors?.general}</span>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          iconName="LogIn"
          iconPosition="left"
        >
          {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;