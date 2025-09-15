import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../firebase'; // Import Firebase auth instance
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email je povinný';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    if (!formData?.password) {
      newErrors.password = 'Heslo je povinné';
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

    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
        setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // TODO: In a real app, you would get the user's role from Firestore or a custom claim
      // For now, we'll default to 'customer'
      const userRole = 'customer';

      // Store user session (in real app, this would be handled by auth context)
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);

      // Redirect based on user role
      navigate('/customer-dashboard');

    } catch (error) {
      let errorMessage = 'Chyba při přihlašování. Zkuste to znovu.';
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Neplatná kombinace emailu a hesla.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Příliš mnoho pokusů o přihlášení. Zkuste to prosím později.';
          break;
        default:
          console.error("Firebase login error:", error);
      }
      setErrors({ general: errorMessage });
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
