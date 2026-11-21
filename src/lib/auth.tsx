import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  ReactNode,
} from "react";
import {
  ClerkProvider,
  useUser as useClerkUser,
  SignInButton as ClerkSignInButton,
  UserButton as ClerkUserButton,
  Show as ClerkShow,
} from "@clerk/nextjs";

export const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export interface LocalUser {
  id: string;
  firstName: string;
  fullName: string;
}

interface LocalAuthContextValue {
  user: LocalUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  openSignIn: () => void;
  signInAs: (name: string) => void;
  signOut: () => void;
}

const STORAGE_KEY = "math_teacher_local_user";

let storageListeners: Array<() => void> = [];

function subscribeLocalUser(listener: () => void) {
  storageListeners = [...storageListeners, listener];
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    storageListeners = storageListeners.filter((l) => l !== listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emitLocalUserChange() {
  for (const listener of storageListeners) {
    listener();
  }
}

function getLocalUserSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

const subscribeClient = () => () => {};

const LocalAuthContext = createContext<LocalAuthContextValue>({
  user: null,
  isLoaded: true,
  isSignedIn: false,
  openSignIn: () => {},
  signInAs: () => {},
  signOut: () => {},
});

function LocalAuthProvider({ children }: { children: ReactNode }) {
  const rawUser = useSyncExternalStore(
    subscribeLocalUser,
    getLocalUserSnapshot,
    getServerSnapshot
  );
  const isLoaded = useSyncExternalStore(
    subscribeClient,
    () => true,
    () => false
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const user = useMemo<LocalUser | null>(() => {
    if (!rawUser) return null;
    try {
      const parsed = JSON.parse(rawUser) as LocalUser;
      return parsed && parsed.id ? parsed : null;
    } catch {
      return null;
    }
  }, [rawUser]);

  const signInAs = (rawName: string) => {
    const clean = rawName.trim() || "Explorer";
    const slug =
      clean
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "explorer";
    const localUser: LocalUser = {
      id: `local_${slug}`,
      firstName: clean.split(/\s+/)[0] || "Explorer",
      fullName: clean,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
    } catch {
      // Ignore storage errors
    }
    emitLocalUserChange();
    setModalOpen(false);
    setNameInput("");
  };

  const signOut = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    emitLocalUserChange();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInAs(nameInput);
  };

  return (
    <LocalAuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: Boolean(user),
        openSignIn: () => setModalOpen(true),
        signInAs,
        signOut,
      }}
    >
      {children}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📘</span>
                <h2 className="text-xl font-black text-gray-900">Sign in to Math Teacher</h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                aria-label="Close sign in modal"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Enter your name to track your progress, daily streaks, and quiz scores during this session.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="local-student-name"
                  className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="local-student-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Alex"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm text-sm"
              >
                Continue Learning →
              </button>
            </form>
          </div>
        </div>
      )}
    </LocalAuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isClerkConfigured) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}

export function useUser() {
  if (isClerkConfigured) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, isLoaded, isSignedIn } = useContext(LocalAuthContext);
  return { user, isLoaded, isSignedIn };
}

export function Show({
  when,
  children,
}: {
  when: "signed-in" | "signed-out";
  children: ReactNode;
}) {
  if (isClerkConfigured) {
    return <ClerkShow when={when}>{children}</ClerkShow>;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isSignedIn, isLoaded } = useContext(LocalAuthContext);
  if (!isLoaded) return null;
  if (when === "signed-in" && isSignedIn) return <>{children}</>;
  if (when === "signed-out" && !isSignedIn) return <>{children}</>;
  return null;
}

export function SignInButton({
  mode,
  children,
}: {
  mode?: "modal" | "redirect";
  children?: ReactNode;
}) {
  if (isClerkConfigured) {
    return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { openSignIn } = useContext(LocalAuthContext);

  if (React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        openSignIn();
      },
    });
  }

  return (
    <button
      type="button"
      onClick={openSignIn}
      className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
    >
      Sign In
    </button>
  );
}

export function UserButton() {
  if (isClerkConfigured) {
    return <ClerkUserButton />;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, signOut } = useContext(LocalAuthContext);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const menuRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!user) return null;

  const initial = (user.firstName?.[0] || "E").toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
        title={user.fullName}
        aria-label="User menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
          <div className="px-3.5 py-2 border-b border-gray-100">
            <div className="text-sm font-bold text-gray-900 truncate">{user.fullName}</div>
            <div className="text-xs text-gray-400">Local Student Session</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full text-left px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
