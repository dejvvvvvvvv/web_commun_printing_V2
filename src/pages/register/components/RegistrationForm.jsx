import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegistrationForm = ({ selectedRole, formData, onFormChange, onSubmit, isLoading, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[A-Z]/?.test(password)) strength++;
    if (/[a-z]/?.test(password)) strength++;
    if (/[0-9]/?.test(password)) strength++;
    if (/[^A-Za-z0-9]/?.test(password)) strength++;

    const levels = [
      { label: 'Velmi slabé', color: 'bg-red-500' },
      { label: 'Slabé', color: 'bg-orange-500' },
      { label: 'Střední', color: 'bg-yellow-500' },
      { label: 'Silné', color: 'bg-blue-500' },
      { label: 'Velmi silné', color: 'bg-green-500' }
    ];

    return { strength, ...(levels?.[strength - 1] || levels?.[0]) };
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            placeholder="Vaše jméno"
            value={formData?.firstName}
            onChange={(e) => handleInputChange('firstName', e?.target?.value)}
            error={errors?.firstName}
            required
          />

          <Input
            label="Příjmení *"
            type="text"
            placeholder="Vaše příjmení"
            value={formData?.lastName}
            onChange={(e) => handleInputChange('lastName', e?.target?.value)}
            error={errors?.lastName}
            required
          />
        </div>

        <Input
          label="E-mailová adresa *"
          type="email"
          placeholder="vas@email.cz"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />

        <Input
          label="Telefon"
          type="tel"
          placeholder="+420 123 456 789"
          value={formData?.phone}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          error={errors?.phone}
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
            placeholder="Vytvořte silné heslo"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
          </button>
        </div>

        {/* Password Strength Indicator */}
        {formData?.password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Síla hesla:</span>
              <span className={`font-medium ${
                passwordStrength?.strength >= 3 ? 'text-green-600' : 
                passwordStrength?.strength >= 2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {passwordStrength?.label}
              </span>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5]?.map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full ${
                    level <= passwordStrength?.strength
                      ? passwordStrength?.color
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            label="Potvrzení hesla *"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Zadejte heslo znovu"
            value={formData?.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
          </button>
        </div>
      </div>
      {/* Host Additional Information */}
      {selectedRole === 'host' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Building" size={20} />
            <span>Informace o podnikání</span>
          </h3>

          <Input
            label="Název společnosti"
            type="text"
            placeholder="Název vaší společnosti (volitelné)"
            value={formData?.companyName}
            onChange={(e) => handleInputChange('companyName', e?.target?.value)}
            error={errors?.companyName}
          />

          <Input
            label="IČO"
            type="text"
            placeholder="Identifikační číslo organizace"
            value={formData?.businessId}
            onChange={(e) => handleInputChange('businessId', e?.target?.value)}
            error={errors?.businessId}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Město *"
              type="text"
              placeholder="Ostrava"
              value={formData?.city}
              onChange={(e) => handleInputChange('city', e?.target?.value)}
              error={errors?.city}
              required
            />

            <Input
              label="PSČ *"
              type="text"
              placeholder="700 00"
              value={formData?.postalCode}
              onChange={(e) => handleInputChange('postalCode', e?.target?.value)}
              error={errors?.postalCode}
              required
            />
          </div>

          <Input
            label="Adresa *"
            type="text"
            placeholder="Ulice a číslo popisné"
            value={formData?.address}
            onChange={(e) => handleInputChange('address', e?.target?.value)}
            error={errors?.address}
            required
          />
        </div>
      )}
      {/* Legal Agreements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="FileText" size={20} />
          <span>Právní souhlasy</span>
        </h3>

        <div className="space-y-3">
          <Checkbox
            label={
              <span className="text-sm">
                Souhlasím s{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  obchodními podmínkami
                </Link>{' '}
                a{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  zásadami ochrany osobních údajů
                </Link>{' '}
                *
              </span>
            }
            checked={formData?.agreeTerms}
            onChange={(e) => handleInputChange('agreeTerms', e?.target?.checked)}
            error={errors?.agreeTerms}
            required
          />

          <Checkbox
            label="Souhlasím s marketingovými e-maily a novinkami"
            description="Můžete kdykoli odhlásit v nastavení účtu"
            checked={formData?.agreeMarketing}
            onChange={(e) => handleInputChange('agreeMarketing', e?.target?.checked)}
          />

          {selectedRole === 'host' && (
            <Checkbox
              label="Potvrzujem, že vlastním nebo mám oprávnění provozovat 3D tiskárny *"
              checked={formData?.confirmEquipment}
              onChange={(e) => handleInputChange('confirmEquipment', e?.target?.checked)}
              error={errors?.confirmEquipment}
              required
            />
          )}
        </div>
      </div>
      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="UserPlus"
          iconPosition="left"
        >
          {isLoading ? 'Vytváření účtu...' : 'Vytvořit účet'}
        </Button>
      </div>
      {/* Login Link */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Již máte účet?{' '}
          <Link 
            to="/login" 
            className="text-primary hover:underline font-medium"
          >
            Přihlásit se
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;