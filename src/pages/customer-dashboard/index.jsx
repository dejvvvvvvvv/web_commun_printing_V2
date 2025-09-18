import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import WelcomeHeader from '@/components/ui/WelcomeHeader';
import Header from '@/components/Header';
import Container from '@/components/Container';

const CustomerDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Načítání...</div>;
  }

  return (
    <>
      <Header />
      <Container>
        <WelcomeHeader 
          name={user.displayName || 'zákazníku'}
          subtitle="Zde naleznete přehled svých objednávek a nahraných modelů."
        />
        {/* Další obsah dashboardu přijde sem */}
      </Container>
    </>
  );
};

export default CustomerDashboard;