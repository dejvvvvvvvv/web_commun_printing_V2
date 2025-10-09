import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/ui/Header';

export default function SiteLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Fallback pro lazy routy, ať nikdy nevidíš „bílou stránku“ při načítání */}
      <Suspense fallback={<div className="container mx-auto px-4">Načítám…</div>}>
        {/*
          Globální odsazení obsahu pod "fixed" headerem.
          `pt-16` je výška mobilního headeru, `md:pt-20` desktopového.
          Původní `py-6` bylo odebráno, aby se padding nesčítal.
        */}
        <main className="container mx-auto px-4 pt-16 md:pt-20">
          <Outlet />
        </main>
      </Suspense>
    </div>
  );
}
