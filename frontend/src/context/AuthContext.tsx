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
import api from "../api/api";

interface AuthContextValue {
  currentUser: User | null;
  role: "admin" | "user" | null;
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

  const [role, setRole] = useState<
    "admin" | "user" | null
  >(null);

  const [loading, setLoading] =
    useState(true);

  const inactivityTimer =
    useRef<number | null>(null);

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

  const resetInactivityTimer = () => {
    if (!auth.currentUser) {
      return;
    }

    startInactivityTimer();
  };

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          setCurrentUser(user);

          if (!user) {
            setRole(null);
            setLoading(false);
            clearInactivityTimer();
            return;
          }

          startInactivityTimer();

          /*
           * Determine the account role through
           * the protected admin endpoint.
           *
           * Successful request = admin.
           * 403 = normal user.
           */
          try {
            await api.get("/admin/overview");

            setRole("admin");
          } catch (error: any) {
            setRole("user");
          } finally {
            setLoading(false);
          }
        }
      );

    return () => {
      unsubscribe();
      clearInactivityTimer();
    };
  }, []);

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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
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
