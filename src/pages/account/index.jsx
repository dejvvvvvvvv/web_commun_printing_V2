// src/pages/account/Account.jsx
import React, { useState } from 'react';
import Header from '../../components/ui/Header'; // ⬅️ přidáno
import { useAuth } from '../../context/AuthContext';
import { sendEmailVerification, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function Account() {
  const { currentUser } = useAuth();
  const [sendingVerify, setSendingVerify] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);

  if (!currentUser) {
    // bezpečnostní pojistka, PrivateRoute by stejně přesměroval
    return null;
  }

  const handleSendVerify = async () => {
    try {
      setErr(null); setInfo(null); setSendingVerify(true);
      await sendEmailVerification(auth.currentUser);
      setInfo('Ověřovací e-mail byl odeslán.');
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSendingVerify(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setErr(null); setInfo(null); setSendingReset(true);
      await sendPasswordResetEmail(auth, currentUser.email);
      setInfo('Na váš e-mail jsme poslali odkaz pro změnu hesla.');
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSendingReset(false);
    }
  };

  // "Odhlásit na všech zařízeních" – z frontendu spolehlivě odhlásíme aktuální session.
  // (Skutečné "na všech" vyžaduje Cloud Function s Admin SDK pro revokeTokens – přidáme v další fázi.)
  const handleSignOutEverywhere = async () => {
    try {
      setErr(null); setInfo(null);
      await signOut(auth);
      // po signOut tě PrivateRoute přesměruje na /login
    } catch (e) {
      setErr(e.message || String(e));
    }
  };

  const lastSignIn = auth.currentUser?.metadata?.lastSignInTime;

  return (
    <>
      {/* ⬇️ sjednocené horní menu jako na ostatních stránkách */}
      <Header />

      {/* obsah stránky v kontejneru jako jinde */}
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Účet</h1>

        <section className="rounded-2xl border bg-card text-card-foreground p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar s iniciálou */}
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-medium">
                  {currentUser.displayName || 'Uživatel'}
                </div>
                <div className="text-sm text-muted-foreground">{currentUser.email}</div>

                <div className="mt-2 flex items-center gap-2">
                  {currentUser.emailVerified ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                      E-mail ověřen
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        E-mail neověřen
                      </span>
                      <button
                        disabled={sendingVerify}
                        onClick={handleSendVerify}
                        className="inline-flex items-center px-3 py-1 rounded-md border bg-foreground text-background text-xs hover:opacity-90 disabled:opacity-60"
                      >
                        {sendingVerify ? 'Posílám…' : 'Poslat ověřovací e-mail'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {lastSignIn && (
              <div className="text-xs text-muted-foreground">
                Poslední přihlášení: {lastSignIn}
              </div>
            )}
          </div>

          {/* Rychlé akce */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-md border hover:bg-muted">
              Upravit profil
            </button>
            <button
              onClick={handlePasswordReset}
              disabled={sendingReset}
              className="px-4 py-2 rounded-md border hover:bg-muted disabled:opacity-60"
            >
              {sendingReset ? 'Odesílám…' : 'Změnit heslo'}
            </button>
            <button
              onClick={handleSignOutEverywhere}
              className="px-4 py-2 rounded-md border hover:bg-muted"
              title="Pro úplné odhlášení 'na všech' přidáme serverové odvolání tokenů."
            >
              Odhlásit na všech zařízeních
            </button>
          </div>

          {/* Hlášky */}
          {(info || err) && (
            <div className="mt-4 text-sm">
              {info && <div className="text-green-700">{info}</div>}
              {err && <div className="text-red-600">{err}</div>}
            </div>
          )}
        </section>
      </main>
    </>
  );
}