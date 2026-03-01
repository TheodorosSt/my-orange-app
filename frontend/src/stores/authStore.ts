/* ===================================
   ORANGE — Auth State
   Session management with Supabase.
   =================================== */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '@/services/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        session: null,
        loading: false,
        initialized: false,

        initialize: async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
              const { data: { user } } = await supabase.auth.getUser();
              set({ user, session, initialized: true });
            } else {
              set({ user: null, session: null, initialized: true });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange((_event, session) => {
              set({
                session,
                user: session?.user ?? null,
              });
            });
          } catch {
            set({ user: null, session: null, initialized: true });
          }
        },

        signUp: async (email, password, fullName) => {
          set({ loading: true });
          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName,
                  app: 'orange-platform',
                },
              },
            });

            if (error) {
              set({ loading: false });
              return { error: error.message };
            }

            set({
              user: data.user,
              session: data.session,
              loading: false,
            });

            return {};
          } catch (e) {
            set({ loading: false });
            return { error: (e as Error).message };
          }
        },

        signIn: async (email, password) => {
          set({ loading: true });
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              set({ loading: false });
              return { error: error.message };
            }

            set({
              user: data.user,
              session: data.session,
              loading: false,
            });

            return {};
          } catch (e) {
            set({ loading: false });
            return { error: (e as Error).message };
          }
        },

        signOut: async () => {
          await supabase.auth.signOut();
          set({ user: null, session: null });

          // Also reset app state
          const { reset } = await import('@/stores/appStore').then(m => m.useAppStore.getState());
          reset();
        },

        resetPassword: async (email) => {
          set({ loading: true });
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });

            set({ loading: false });
            if (error) return { error: error.message };
            return {};
          } catch (e) {
            set({ loading: false });
            return { error: (e as Error).message };
          }
        },
      }),
      {
        name: 'orange-auth',
        partialize: (state) => ({
          // Only persist minimal auth indicator, not tokens
          initialized: state.initialized,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);