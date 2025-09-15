import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../../../firebase'; // Import Firebase instances
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegistrationForm = ({ selectedRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false,
    // Host specific
    companyName: '',
    businessId: '',
    city: '',
    postalCode: '',
    address: '',
    confirmEquipment: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
     if (errors.general) {
        setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Basic validations
    if (!formData.firstName) newErrors.firstName = 'Jméno je povinné.';
    if (!formData.lastName) newErrors.lastName = 'Příjmení je povinné.';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Neplatný formát emailu.';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Heslo musí mít alespoň 6 znaků.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Hesla se neshodují.';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Musíte souhlasit s podmínkami.';

    if (selectedRole === 'host') {
      if (!formData.city) newErrors.city = 'Město je povinné.';
      if (!formData.postalCode) newErrors.postalCode = 'PSČ je povinné.';
      if (!formData.address) newErrors.address = 'Adresa je povinná.';
      if (!formData.confirmEquipment) newErrors.confirmEquipment = 'Musíte potvrdit vlastnictví zařízení.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        role: selectedRole,
        createdAt: new Date(),
        // Host specific data
        ...(selectedRole === 'host' && {
          companyName: formData.companyName || '',
          businessId: formData.businessId || '',
          address: {
            city: formData.city,
            postalCode: formData.postalCode,
            street: formData.address,
          },
        })
      });

      // 3. Redirect to login page after successful registration
      navigate('/login?status=success');

    } catch (error) {
      let errorMessage = 'Při registraci se vyskytla chyba.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Tento e-mail je již používán.';
      }
      setErrors({ general: errorMessage });
      console.error("Firebase registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && <p className="text-red-500">{errors.general}</p>}
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="User" size={20} />
          <span>Osobní údaje</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Jméno *"
            type="text"
            name="firstName"
            placeholder="Vaše jméno"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Příjmení *"
            type="text"
            name="lastName"
            placeholder="Vaše příjmení"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="E-mailová adresa *"
          type="email"
          name="email"
          placeholder="vas@email.cz"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />
        <Input
          label="Telefon"
          type="tel"
          name="phone"
          placeholder="+420 123 456 789"
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
        />
      </div>
      {/* Password Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Lock" size={20} />
          <span>Zabezpečení</span>
        </h3>

        <div className="relative">
          <Input
            label="Heslo *"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Vytvořte silné heslo"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors">
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
          </button>
        </div>

        <div className="relative">
          <Input
            label="Potvrzení hesla *"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Zadejte heslo znovu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            required
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors">
            <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
          </button>
        </div>
      </div>
      
      {selectedRole === 'host' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Building" size={20} />
            <span>Informace o podnikání</span>
          </h3>
          <Input label="Název společnosti" name="companyName" value={formData.companyName} onChange={handleInputChange} error={errors.companyName} />
          <Input label="IČO" name="businessId" value={formData.businessId} onChange={handleInputChange} error={errors.businessId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Město *" name="city" value={formData.city} onChange={handleInputChange} error={errors.city} required />
            <Input label="PSČ *" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} required />
          </div>
          <Input label="Adresa *" name="address" value={formData.address} onChange={handleInputChange} error={errors.address} required />
        </div>
      )}

      {/* Legal Agreements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="FileText" size={20} />
          <span>Právní souhlasy</span>
        </h3>
        <Checkbox
          name="agreeTerms"
          label={
            <span className="text-sm">
              Souhlasím s <Link to="/terms" className="text-primary hover:underline">obchodními podmínkami</Link> a <Link to="/privacy" className="text-primary hover:underline">zásadami ochrany osobních údajů</Link> *
            </span>
          }
          checked={formData.agreeTerms}
          onChange={handleInputChange}
          error={errors.agreeTerms}
          required
        />
        <Checkbox name="agreeMarketing" label="Souhlasím s marketingovými e-maily a novinkami" checked={formData.agreeMarketing} onChange={handleInputChange} />
        {selectedRole === 'host' && (
          <Checkbox
            name="confirmEquipment"
            label="Potvrzujem, že vlastním nebo mám oprávnění provozovat 3D tiskárny *"
            checked={formData.confirmEquipment}
            onChange={handleInputChange}
            error={errors.confirmEquipment}
            required
          />
        )}
      </div>

      <div className="pt-4">
        <Button type="submit" variant="default" size="lg" fullWidth loading={isLoading} iconName="UserPlus" iconPosition="left">
          {isLoading ? 'Vytváření účtu...' : 'Vytvořit účet'}
        </Button>
      </div>
      
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Již máte účet?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Přihlásit se
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;
