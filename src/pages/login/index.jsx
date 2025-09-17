import React from 'react';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import LoginActions from './components/LoginActions';
import SocialLogin from './components/SocialLogin';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto py-12 md:py-20">
        <LoginHeader />
        <div className="px-6 md:px-0">
          <LoginForm />
          <LoginActions />
          <SocialLogin />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
