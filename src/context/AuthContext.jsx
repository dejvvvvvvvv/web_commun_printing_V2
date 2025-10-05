// AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // subscribe na změny auth stavu
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          setCurrentUser(userDocSnap.exists()
            ? { ...user, ...userDocSnap.data() }
            : user
          );
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    // cleanup při unmountu
    return () => unsubscribe();
  }, []); // důležité: jen jednou po mountu

  const value = useMemo(() => ({ user: currentUser, loading }), [currentUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// pohodlný hook
export function useAuth() {
  return useContext(AuthContext);
}
