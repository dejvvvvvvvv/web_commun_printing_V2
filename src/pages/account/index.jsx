import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900 break-all">{value || '—'}</div>
    </div>
  );
}

export default function Account() {
  // Firebase Auth – čteme přímo aktuálního uživatele
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // po odhlášení rovnou na login (případně /)
      window.location.href = '/login';
    } catch (e) {
      console.error('Sign out failed:', e);
      alert('Nepodařilo se odhlásit. Zkuste to prosím znovu.');
    }
  };

  // jednoduchý skeleton, kdyby AuthContext teprve dobíhá
  if (user === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Účet</h1>
        <div className="animate-pulse h-40 rounded-xl bg-gray-100" />
      </div>
    );
  }

  // bezpečnostní pojistka – na chráněné route by se to dít nemělo
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Účet</h1>
        <p className="text-gray-600">Pro zobrazení účtu se prosím přihlaste.</p>
      </div>
    );
  }

  const provider = user.providerData?.[0];
  const meta = user.metadata || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Účet</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Základní informace */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Základní informace</h2>
          <div>
            <Row label="E-mail" value={user.email} />
            <Row label="Zobrazené jméno" value={user.displayName} />
            <Row label="UID" value={user.uid} />
            <Row label="Poskytovatel" value={provider?.providerId} />
          </div>
        </div>

        {/* Bezpečnost / Přihlášení */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Přihlášení</h2>
          <div>
            <Row label="Vytvořen" value={meta.creationTime} />
            <Row label="Poslední přihlášení" value={meta.lastSignInTime} />
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
              >
                Odhlásit se
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}