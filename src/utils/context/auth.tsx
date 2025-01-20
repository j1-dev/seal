'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch the initial user
    const fetchUser = async () => {
      console.log('Fetching initial session...');
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };

    fetchUser();

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth State Changed:', { event, session });
      setUser(session?.user || null);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => useContext(AuthContext);
