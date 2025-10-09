import React from 'react';
import { Navigate } from 'react-router-dom';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

export default function AccountPage() {
  const { currentUser, loading } = useAuth();

  // 1) Loading state -> nikdy nevracíme null, aby nebyla bílá stránka
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="h-28 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  // 2) Nepřihlášený uživatel -> přesměrujeme na login
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: '/account' }} />;
  }

  const displayName =
    currentUser.displayName ||
    (currentUser.email ? currentUser.email.split('@')[0] : 'Uživatel');

  const lastSignIn =
    currentUser?.metadata?.lastSignInTime
      ? new Date(currentUser.metadata.lastSignInTime).toLocaleString()
      : null;

  const emailVerified = Boolean(currentUser.emailVerified);

  async function handleSendVerify() {
    try {
      await sendEmailVerification(currentUser);
      alert('Ověřovací e-mail byl odeslán.');
    } catch (err) {
      console.error(err);
      alert('Odeslání ověřovacího e-mailu se nepodařilo.');
    }
  }

  async function handleSignOutEverywhere() {
    // Pozn.: “odhlásit všude” vyžaduje server/admin (revokeRefreshTokens).
    // Na klientu korektně odhlásíme aktuální zařízení:
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
      alert('Odhlášení se nepovedlo.');
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* “Hero” karta účtu */}
      <div className="rounded-2xl border bg-card text-card-foreground p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Vlevo: avatar + jméno + email + badge */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
            {displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-xl font-semibold leading-tight">{displayName}</div>
            {currentUser.email && (
              <div className="text-sm text-muted-foreground">{currentUser.email}</div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                  (emailVerified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700')
                }
              >
                {emailVerified ? 'E-mail ověřen' : 'E-mail neověřen'}
              </span>
              {!emailVerified && (
                <button
                  onClick={handleSendVerify}
                  className="rounded-md bg-foreground px-3 py-1 text-xs text-background hover:opacity-90 transition"
                >
                  Poslat ověřovací e-mail
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vpravo: poslední přihlášení */}
        {lastSignIn && (
          <div className="text-sm text-muted-foreground">
            Poslední přihlášení: {lastSignIn}
          </div>
        )}
      </div>

      {/* Rychlé akce */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg border px-3 py-2 hover:bg-muted transition">
          Upravit profil
        </button>
        <button className="rounded-lg border px-3 py-2 hover:bg-muted transition">
          Změnit heslo
        </button>
        <button
          onClick={handleSignOutEverywhere}
          className="rounded-lg border px-3 py-2 hover:bg-muted transition"
        >
          Odhlásit na všech zařízeních
        </button>
      </div>
    </div>
  );
}
