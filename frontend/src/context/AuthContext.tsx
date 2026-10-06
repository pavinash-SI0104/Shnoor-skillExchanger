import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../config/firebase";

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

const INACTIVITY_TIMEOUT = 
30 * 60 * 1000; // 30 minutes

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const inactivityTimer =
    useRef<number | null>(null);

  /*
   * ==========================================
   * CLEAR INACTIVITY TIMER
   * ==========================================
   */

  const clearInactivityTimer = () => {
    if (
      inactivityTimer.current !== null
    ) {
      window.clearTimeout(
        inactivityTimer.current
      );

      inactivityTimer.current = null;
    }
  };

  /*
   * ==========================================
   * LOGOUT AFTER INACTIVITY
   * ==========================================
   */

  const startInactivityTimer = () => {
    clearInactivityTimer();

    inactivityTimer.current =
      window.setTimeout(async () => {
        try {
          sessionStorage.setItem(
            "session-expired",
            "true"
          );
          await signOut(auth);
        } catch (error) {
          console.error(
            "Automatic logout failed:",
            error
          );
        }
      }, INACTIVITY_TIMEOUT);
  };

  /*
   * ==========================================
   * RESET TIMER ON USER ACTIVITY
   * ==========================================
   */

  const resetInactivityTimer = () => {
    if (!auth.currentUser) {
      return;
    }

    startInactivityTimer();
  };

  /*
   * ==========================================
   * AUTH STATE
   * ==========================================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
          setLoading(false);

          if (user) {
            startInactivityTimer();
          } else {
            clearInactivityTimer();
          }
        }
      );

    return () => {
      unsubscribe();
      clearInactivityTimer();
    };
  }, []);

  /*
   * ==========================================
   * USER ACTIVITY LISTENERS
   * ==========================================
   */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          resetInactivityTimer
        );
      }
    );

    return () => {
      activityEvents.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            resetInactivityTimer
          );
        }
      );
    };
  }, [currentUser]);

  /*
   * ==========================================
   * AUTH PROVIDER
   * ==========================================
   */

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}
