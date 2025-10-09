import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/ui/Header';

export default function SiteLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Fallback pro lazy routy, ať nikdy nevidíš „bílou stránku“ při načítání */}
      <Suspense fallback={<div className="container mx-auto px-4 py-6">Načítám…</div>}>
        <main className="container mx-auto px-4 py-6">
          <Outlet />
        </main>
      </Suspense>
    </div>
  );
}
