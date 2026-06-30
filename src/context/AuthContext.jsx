import { createContext, useContext, useState, useEffect } from "react";
import { getSb } from "../lib/supabase";

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid) => {
    const { data } = await getSb().from("profiles").select("*").eq("id", uid).single();
    setProfile(data);
    return data;
  };

  useEffect(() => {
    const client = getSb();
    if (!client) { setLoading(false); return; }

    client.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchProfile(u.id);
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id); else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    getSb().auth.signInWithPassword({ email, password });

  const signUp = (email, password) =>
    getSb().auth.signUp({ email, password });

  const signOut = () => getSb().auth.signOut();

  const updateProfile = async (updates) => {
    await getSb().from("profiles").update(updates).eq("id", user.id);
    setProfile((p) => ({ ...p, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
