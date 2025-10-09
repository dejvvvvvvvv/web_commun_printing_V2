import React from 'react';
import Routes from './Routes';
import Header from './components/ui/Header';

function App() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Routes />
      </main>
    </>
  );
}

export default App;