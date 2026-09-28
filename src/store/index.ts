// Zustand Store for global state management — FRONTEND ONLY
import { create } from "zustand";
import i18next from "i18next";
import { students, type Application, type Notification } from "../mock/data";

export type UserRole = "student" | "admin" | "government";
export type Theme = "light" | "dark";
export type Language = "en" | "hi" | "sat";

/* ============================================================
 *  DEMO ACCOUNTS (shared with Login page)
 * ============================================================ */
export interface DemoAccount {
  id: string;
  role: UserRole;
  email: string;
  password: string;
  name: string;
  state?: string;
  district?: string;
  designation?: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  /* 4 students */
  {
    id: "stu-001",
    role: "student",
    email: "rahul.sharma@student.in",
    password: "student123",
    name: "Rahul Sharma",
    state: "Maharashtra",
  },
  {
    id: "stu-002",
    role: "student",
    email: "priya.verma@student.in",
    password: "student123",
    name: "Priya Verma",
    state: "Karnataka",
  },
  {
    id: "stu-003",
    role: "student",
    email: "anjali.singh@student.in",
    password: "student123",
    name: "Anjali Singh",
    state: "Delhi",
  },
  {
    id: "stu-004",
    role: "student",
    email: "vikram.patel@student.in",
    password: "student123",
    name: "Vikram Patel",
    state: "Gujarat",
  },

  /* 2 admins (location-wise) */
  {
    id: "adm-001",
    role: "admin",
    email: "admin.mh@mota.gov.in",
    password: "admin123",
    name: "Suresh Deshmukh",
    state: "Maharashtra",
    district: "Mumbai",
    designation: "State Admin Officer — Maharashtra",
  },
  {
    id: "adm-002",
    role: "admin",
    email: "admin.ka@mota.gov.in",
    password: "admin123",
    name: "Lakshmi Rao",
    state: "Karnataka",
    district: "Bengaluru",
    designation: "State Admin Officer — Karnataka",
  },

  /* 1 government */
  {
    id: "gov-001",
    role: "government",
    email: "secretary@mota.gov.in",
    password: "gov123",
    name: "Dr. A. K. Mehta",
    designation: "Joint Secretary, Ministry of Tribal Affairs",
  },
];

/* ============================================================
 *  STORAGE KEYS
 * ============================================================ */
const SESSION_KEY = "auth_session_v1";
const ATTEMPTS_KEY = "auth_attempts_v1";
const REMEMBER_KEY = "auth_remember_email_v1";
const REGISTERED_KEY = "auth_registered_users_v1";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const LOCK_MS = 30 * 1000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  state?: string;
  district?: string;
  designation?: string;
}

export interface Session {
  user: SessionUser;
  loggedInAt: number;
  expiresAt: number;
}

/* ============================================================
 *  LOCAL HELPERS
 * ============================================================ */
const readSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: Session = JSON.parse(raw);
    if (s.expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
};

const writeSession = (user: SessionUser) => {
  const session: Session = {
    user,
    loggedInAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const readRegistered = (): DemoAccount[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeRegistered = (list: DemoAccount[]) =>
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(list));

const readAttempts = () => {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : { count: 0 };
  } catch {
    return { count: 0 };
  }
};

const writeAttempts = (rec: { count: number; lockedUntil?: number }) =>
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(rec));

/* ============================================================
 *  AUTH STATE
 * ============================================================ */
interface AuthState {
  isAuthenticated: boolean;
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  lockRemaining: number;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    state?: string;
  }) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
  tickLock: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const session = readSession();
  const attempts = readAttempts();
  const initialLock =
    attempts.lockedUntil && attempts.lockedUntil > Date.now()
      ? Math.ceil((attempts.lockedUntil - Date.now()) / 1000)
      : 0;

  return {
    isAuthenticated: !!session,
    user: session?.user ?? null,
    loading: false,
    error: null,
    lockRemaining: initialLock,

    initAuth: () => {
      const s = readSession();
      if (s) set({ isAuthenticated: true, user: s.user });
      else set({ isAuthenticated: false, user: null });

      const rec = readAttempts();
      if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
        set({
          lockRemaining: Math.ceil((rec.lockedUntil - Date.now()) / 1000),
        });
      }
    },

    tickLock: () => {
      const rec = readAttempts();
      if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
        set({
          lockRemaining: Math.ceil((rec.lockedUntil - Date.now()) / 1000),
        });
      } else {
        if (get().lockRemaining !== 0) {
          writeAttempts({ count: 0 });
          set({ lockRemaining: 0 });
        }
      }
    },

    login: async (role, email, password) => {
      set({ loading: true, error: null });

      // small fake delay
      await new Promise((r) => setTimeout(r, 500));

      // lock check
      const rec = readAttempts();
      if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
        const secs = Math.ceil((rec.lockedUntil - Date.now()) / 1000);
        set({
          loading: false,
          error: `Too many attempts. Try again in ${secs}s.`,
          lockRemaining: secs,
        });
        throw new Error("Locked");
      }

      if (!email || !password) {
        set({ loading: false, error: "Please enter email and password." });
        throw new Error("Missing credentials");
      }

      const pool = [...DEMO_ACCOUNTS, ...readRegistered()];
      const account = pool.find(
        (a) =>
          a.email.toLowerCase() === email.trim().toLowerCase() &&
          a.password === password &&
          a.role === role,
      );

      if (!account) {
        const nextCount = rec.count + 1;
        const next: { count: number; lockedUntil?: number } = {
          count: nextCount,
        };
        if (nextCount >= MAX_ATTEMPTS) next.lockedUntil = Date.now() + LOCK_MS;
        writeAttempts(next);

        const secs = next.lockedUntil
          ? Math.ceil((next.lockedUntil - Date.now()) / 1000)
          : 0;

        const msg = next.lockedUntil
          ? `Too many failed attempts. Locked for ${LOCK_MS / 1000}s.`
          : `Invalid credentials for "${role}". ${MAX_ATTEMPTS - nextCount} attempt(s) left.`;

        set({ loading: false, error: msg, lockRemaining: secs });
        throw new Error(msg);
      }

      const user: SessionUser = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        state: account.state,
        district: account.district,
        designation: account.designation,
      };
      writeSession(user);
      writeAttempts({ count: 0 });

      set({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
        lockRemaining: 0,
      });
    },

    register: async (data) => {
      set({ loading: true, error: null });
      await new Promise((r) => setTimeout(r, 500));

      const email = data.email.trim().toLowerCase();
      const pool = [...DEMO_ACCOUNTS, ...readRegistered()];

      if (pool.some((a) => a.email.toLowerCase() === email)) {
        set({
          loading: false,
          error: "An account with this email already exists.",
        });
        throw new Error("Email exists");
      }

      if (!data.name.trim() || !email || data.password.length < 6) {
        set({
          loading: false,
          error: "Name, valid email and 6+ char password required.",
        });
        throw new Error("Invalid data");
      }

      const newAccount: DemoAccount = {
        id: `stu-${Date.now()}`,
        role: "student",
        email,
        password: data.password,
        name: data.name.trim(),
        state: data.state,
      };
      writeRegistered([...readRegistered(), newAccount]);

      const user: SessionUser = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        role: "student",
        state: newAccount.state,
      };
      writeSession(user);
      set({ isAuthenticated: true, user, loading: false, error: null });
    },

    logout: () => {
      localStorage.removeItem(SESSION_KEY);
      set({ isAuthenticated: false, user: null, error: null });
    },
  };
});

/* ============================================================
 *  APP STATE
 * ============================================================ */
interface AppState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  toasts: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
  }>;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  addToast: (
    type: "success" | "error" | "info" | "warning",
    message: string,
  ) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => {
  const applyTheme = (theme: Theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  };
  const initialTheme = (localStorage.getItem("theme") as Theme) || "light";
  applyTheme(initialTheme);
  const initialSidebar = typeof localStorage !== 'undefined' && localStorage.getItem("sidebar_open") !== null
    ? localStorage.getItem("sidebar_open") !== "false"
    : true;

  return {
    theme: initialTheme,
    language: (localStorage.getItem("app_language") as Language) || "en",
    sidebarOpen: initialSidebar,
    mobileSidebarOpen: false,
    toasts: [],
    toggleTheme: () =>
      set((state) => {
        const newTheme: Theme = state.theme === "light" ? "dark" : "light";
        applyTheme(newTheme);
        return { theme: newTheme };
      }),
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    setLanguage: (lang) => {
      i18next.changeLanguage(lang);
      set({ language: lang });
    },
    toggleSidebar: () =>
      set((state) => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (isMobile) {
          return { mobileSidebarOpen: !state.mobileSidebarOpen };
        }
        const next = !state.sidebarOpen;
        localStorage.setItem("sidebar_open", String(next));
        return { sidebarOpen: next };
      }),
    setSidebarOpen: (open) => {
      localStorage.setItem("sidebar_open", String(open));
      set({ sidebarOpen: open });
    },
    toggleMobileSidebar: () =>
      set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    addToast: (type, message) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, 4000);
    },
    removeToast: (id) =>
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  };
});

/* ============================================================
 *  STUDENT STATE
 * ============================================================ */
interface StudentState {
  currentStudent: (typeof students)[0] | null;
  myApplications: Application[];
  myNotifications: Notification[];
  setStudent: (student: (typeof students)[0]) => void;
  setApplications: (apps: Application[]) => void;
  setNotifications: (notifs: Notification[]) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  currentStudent: null,
  myApplications: [],
  myNotifications: [],
  setStudent: (student) => set({ currentStudent: student }),
  setApplications: (apps) => set({ myApplications: apps }),
  setNotifications: (notifs) => set({ myNotifications: notifs }),
}));
