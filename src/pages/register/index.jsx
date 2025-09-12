import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import RoleSelectionCard from './components/RoleSelectionCard';
import RegistrationForm from './components/RegistrationForm';
import LanguageToggle from './components/LanguageToggle';
import ProgressSteps from './components/ProgressSteps';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const Register = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('cs');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessId: '',
    city: '',
    postalCode: '',
    address: '',
    agreeTerms: false,
    agreeMarketing: false,
    confirmEquipment: false
  });

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'cs';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Handle language change
  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  // Registration steps configuration
  const steps = [
    {
      id: 'role',
      title: currentLanguage === 'cs' ? 'Role' : 'Role',
      description: currentLanguage === 'cs' ? 'Výběr role' : 'Select role'
    },
    {
      id: 'details',
      title: currentLanguage === 'cs' ? 'Údaje' : 'Details',
      description: currentLanguage === 'cs' ? 'Osobní info' : 'Personal info'
    },
    {
      id: 'verification',
      title: currentLanguage === 'cs' ? 'Ověření' : 'Verification',
      description: currentLanguage === 'cs' ? 'E-mail' : 'Email'
    }
  ];

  // Role options
  const roleOptions = [
    {
      role: 'customer',
      title: currentLanguage === 'cs' ? 'Zákazník' : 'Customer',
      description: currentLanguage === 'cs' ?'Potřebuji vytisknout 3D modely a hledám kvalitní tiskové služby.' :'I need to print 3D models and am looking for quality printing services.',
      icon: 'User',
      benefits: currentLanguage === 'cs' ? [
        'Nahrávání 3D modelů (.stl, .obj)',
        'Automatický výpočet ceny',
        'Výběr z ověřených tiskáren',
        'Sledování objednávek v reálném čase',
        'Bezplatná doprava v Ostravě',
        'Express tisk (stejný den)'
      ] : [
        'Upload 3D models (.stl, .obj)',
        'Automatic price calculation',
        'Choose from verified printers',
        'Real-time order tracking',
        'Free delivery in Ostrava',
        'Express printing (same day)'
      ]
    },
    {
      role: 'host',
      title: currentLanguage === 'cs' ? 'Poskytovatel' : 'Host',
      description: currentLanguage === 'cs' ?'Vlastním 3D tiskárny a chci je monetizovat prostřednictvím platformy.' :'I own 3D printers and want to monetize them through the platform.',
      icon: 'Printer',
      benefits: currentLanguage === 'cs' ? [
        'Pasivní příjem z tiskáren',
        'Automatické rozdělování objednávek',
        'Detailní statistiky výdělků',
        'Referenční program s bonusy',
        'Správa více tiskáren',
        'Flexibilní dostupnost'
      ] : [
        'Passive income from printers',
        'Automatic order distribution',
        'Detailed earnings statistics',
        'Referral program with bonuses',
        'Multiple printer management',
        'Flexible availability'
      ]
    }
  ];

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData?.firstName?.trim()) {
      newErrors.firstName = currentLanguage === 'cs' ? 'Jméno je povinné' : 'First name is required';
    }
    if (!formData?.lastName?.trim()) {
      newErrors.lastName = currentLanguage === 'cs' ? 'Příjmení je povinné' : 'Last name is required';
    }
    if (!formData?.email?.trim()) {
      newErrors.email = currentLanguage === 'cs' ? 'E-mail je povinný' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = currentLanguage === 'cs' ? 'Neplatný formát e-mailu' : 'Invalid email format';
    }
    if (!formData?.password) {
      newErrors.password = currentLanguage === 'cs' ? 'Heslo je povinné' : 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = currentLanguage === 'cs' ? 'Heslo musí mít alespoň 8 znaků' : 'Password must be at least 8 characters';
    }
    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = currentLanguage === 'cs' ? 'Hesla se neshodují' : 'Passwords do not match';
    }
    if (!formData?.agreeTerms) {
      newErrors.agreeTerms = currentLanguage === 'cs' ? 'Musíte souhlasit s podmínkami' : 'You must agree to terms';
    }

    // Host-specific validation
    if (selectedRole === 'host') {
      if (!formData?.city?.trim()) {
        newErrors.city = currentLanguage === 'cs' ? 'Město je povinné' : 'City is required';
      }
      if (!formData?.postalCode?.trim()) {
        newErrors.postalCode = currentLanguage === 'cs' ? 'PSČ je povinné' : 'Postal code is required';
      }
      if (!formData?.address?.trim()) {
        newErrors.address = currentLanguage === 'cs' ? 'Adresa je povinná' : 'Address is required';
      }
      if (!formData?.confirmEquipment) {
        newErrors.confirmEquipment = currentLanguage === 'cs' ? 'Musíte potvrdit vlastnictví tiskáren' : 'You must confirm printer ownership';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1 && selectedRole) {
      setCurrentStep(2);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Mock registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success - redirect to appropriate dashboard
      const dashboardRoute = selectedRole === 'host' ? '/host-dashboard' : '/customer-dashboard';
      navigate(dashboardRoute);
    } catch (error) {
      setErrors({
        submit: currentLanguage === 'cs' ?'Chyba při vytváření účtu. Zkuste to znovu.' :'Error creating account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {currentLanguage === 'cs' ? 'Vytvořit účet' : 'Create Account'}
                </h1>
                <p className="text-muted-foreground">
                  {currentLanguage === 'cs' ?'Připojte se k největší 3D tiskové komunitě v České republice' :'Join the largest 3D printing community in Czech Republic'
                  }
                </p>
              </div>
              <LanguageToggle 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {/* Progress Steps */}
            <ProgressSteps 
              currentStep={currentStep}
              totalSteps={3}
              steps={steps}
            />
          </div>

          {/* Registration Content */}
          <div className="bg-card rounded-xl shadow-lg border border-border p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {currentLanguage === 'cs' ? 'Vyberte svou roli' : 'Choose Your Role'}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentLanguage === 'cs' ?'Jak chcete používat naši platformu?' :'How do you want to use our platform?'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roleOptions?.map((option) => (
                    <RoleSelectionCard
                      key={option?.role}
                      role={option?.role}
                      isSelected={selectedRole === option?.role}
                      onSelect={handleRoleSelect}
                      title={option?.title}
                      description={option?.description}
                      benefits={option?.benefits}
                      icon={option?.icon}
                    />
                  ))}
                </div>

                {selectedRole && (
                  <div className="flex justify-center pt-6">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleNextStep}
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      {currentLanguage === 'cs' ? 'Pokračovat' : 'Continue'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {currentLanguage === 'cs' ? 'Registrační údaje' : 'Registration Details'}
                    </h2>
                    <p className="text-muted-foreground">
                      {currentLanguage === 'cs' 
                        ? `Registrace jako ${selectedRole === 'host' ? 'Poskytovatel' : 'Zákazník'}`
                        : `Registering as ${selectedRole === 'host' ? 'Host' : 'Customer'}`
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousStep}
                    iconName="ArrowLeft"
                    iconPosition="left"
                  >
                    {currentLanguage === 'cs' ? 'Zpět' : 'Back'}
                  </Button>
                </div>

                <RegistrationForm
                  selectedRole={selectedRole}
                  formData={formData}
                  onFormChange={setFormData}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  errors={errors}
                />
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                {currentLanguage === 'cs' ? 'Bezpečné' : 'Secure'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentLanguage === 'cs' ?'Vaše data jsou chráněna podle GDPR' :'Your data is protected according to GDPR'
                }
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={24} className="text-success" />
              </div>
              <h3 className="font-semibold text-foreground">
                {currentLanguage === 'cs' ? 'Komunita' : 'Community'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentLanguage === 'cs' ?'Přes 5,000 aktivních uživatelů' :'Over 5,000 active users'
                }
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">
                {currentLanguage === 'cs' ? 'Rychlé' : 'Fast'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentLanguage === 'cs' ?'Registrace za méně než 2 minuty' :'Registration in less than 2 minutes'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;