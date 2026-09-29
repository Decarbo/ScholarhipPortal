// Main App Component - Routing & Layout
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./store";
import { Header, Sidebar, ToastContainer } from "./components/ui";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentSchemes } from "./pages/student/StudentSchemes";
import { StudentApply } from "./pages/student/StudentApply";
import { StudentTracker } from "./pages/student/StudentTracker";
import { StudentDisbursal } from "./pages/student/StudentDisbursal";
import { StudentNotifications } from "./pages/student/StudentNotifications";
import { StudentGrievances } from "./pages/student/StudentGrievances";
import { StudentRenewal } from "./pages/student/StudentRenewal";
import { StudentProfile } from "./pages/student/StudentProfile";
import { StudentVault } from "./pages/student/Documents";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminSchemeConfig } from "./pages/admin/AdminSchemeConfig";
import { AdminScreening } from "./pages/admin/AdminScreening";
import { AdminCommunication } from "./pages/admin/AdminCommunication";
import { AdminAuditLog } from "./pages/admin/AdminAuditLog";
import { AdminDisbursal } from "./pages/admin/AdminDisbursal";
import { AdminGrievances } from "./pages/admin/AdminGrievances";
import { GovernmentDashboard } from "./pages/government/GovernmentDashboard";
import { GovernmentSchemePerformance } from "./pages/government/GovernmentSchemePerformance";
import { GovernmentBudget } from "./pages/government/GovernmentBudget";
import { GovernmentReports } from "./pages/government/GovernmentReports";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Send,
  Bell,
  RefreshCw,
  User,
  Settings,
  MessageSquare,
  BarChart3,
  IndianRupee,
  ClipboardList,
  Mail,
  History,
  Wallet,
  AlertCircle,
  PieChart,
  FolderOpen,
} from "lucide-react";
import { OfflineIndicator } from "./components/accessibility";
import StudentVaultOCR from "./pages/student/StudentVaultOCR";
import Tracker from "./pages/student/Tracker";
import Issues from "./pages/student/Issues";
import CalliflyBot from "./components/CalliflyBot";

/* ============================================================
 *  HELPERS
 * ============================================================ */
const homeForRole = (role?: string) => {
  if (role === "admin") return "/admin";
  if (role === "government") return "/government";
  return "/student";
};

/* ============================================================
 *  LAYOUTS
 * ============================================================ */
const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation("common");

  const navItems = [
    {
      label: t("nav.dashboard"),
      icon: <LayoutDashboard size={18} />,
      path: "/student",
    },
    {
      label: t("nav.tracker"),
      icon: <FileText size={18} />,
      path: "/student/track",
    },
    {
      label: t("nav.schemes"),
      icon: <BookOpen size={18} />,
      path: "/student/schemes",
    },
    { label: t("nav.apply"), icon: <Send size={18} />, path: "/student/apply" },
    {
      label: t("nav.documents"),
      icon: <FolderOpen size={18} />,
      path: "/student/vault/ocr",
    },
    {
      label: t("nav.disbursal"),
      icon: <Wallet size={18} />,
      path: "/student/disbursal",
    },
    {
      label: t("nav.notifications"),
      icon: <Bell size={18} />,
      path: "/student/notifications",
    },
    {
      label: t("nav.issue"),
      icon: <AlertCircle size={18} />,
      path: "/student/issues",
    },
    {
      label: t("nav.renewal"),
      icon: <RefreshCw size={18} />,
      path: "/student/renewal",
    },
    {
      label: t("nav.profile"),
      icon: <User size={18} />,
      path: "/student/profile",
    },
  ];

  return (
    <div className='h-screen w-full overflow-hidden flex flex-col bg-[#F8F8F8] dark:bg-slate-900 transition-colors'>
      <Header title={t("portal.student")} />
      {/* Mobile Bottom Quick Bar for Students */}
      <nav className='fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-[#DEE2E6] dark:border-slate-800 md:hidden shadow-lg'>
        <div className='flex items-center justify-around py-2'>
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-1.5 transition-colors cursor-pointer ${
                path === item.path
                  ? "text-[#0B75A4] dark:text-[#7EC5E2] font-semibold"
                  : "text-[#64748B] hover:text-[#0B75A4] dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {item.icon}
              <span className='text-[10px] mt-0.5'>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Responsive Sidebar (Full/Icons on desktop, slide drawer on mobile) */}
      <div className='flex-1 flex overflow-hidden relative w-full'>
        <Sidebar
          items={navItems}
          currentPath={path}
          onNavigate={(p) => navigate(p)}
        />
        <main className='flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 pb-16 md:pb-0'>
          {children}
        </main>
      </div>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation("common");

  const navItems = [
    {
      label: t("nav.dashboard"),
      icon: <LayoutDashboard size={18} />,
      path: "/admin",
    },
    {
      label: t("nav.schemeConfig"),
      icon: <Settings size={18} />,
      path: "/admin/schemes",
    },
    {
      label: t("nav.screening"),
      icon: <ClipboardList size={18} />,
      path: "/admin/screening",
    },
    {
      label: t("nav.communication"),
      icon: <Mail size={18} />,
      path: "/admin/communication",
    },
    {
      label: t("nav.auditLog"),
      icon: <History size={18} />,
      path: "/admin/audit",
    },
    {
      label: t("nav.disbursals"),
      icon: <IndianRupee size={18} />,
      path: "/admin/disbursal",
    },
    {
      label: t("nav.grievances"),
      icon: <MessageSquare size={18} />,
      path: "/admin/grievances",
    },
  ];

  return (
    <div className='h-screen w-full overflow-hidden flex flex-col bg-[#F8F8F8] dark:bg-slate-900 transition-colors'>
      <Header title={t("portal.admin")} />
      <div className='flex-1 flex overflow-hidden relative w-full'>
        <Sidebar
          items={navItems}
          currentPath={path}
          onNavigate={(p) => navigate(p)}
        />
        <main className='flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0'>{children}</main>
      </div>
    </div>
  );
};

const GovernmentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation("common");

  const navItems = [
    {
      label: t("nav.dashboard"),
      icon: <LayoutDashboard size={18} />,
      path: "/government",
    },
    {
      label: t("nav.schemePerformance"),
      icon: <BarChart3 size={18} />,
      path: "/government/performance",
    },
    {
      label: t("nav.budgetTracker"),
      icon: <IndianRupee size={18} />,
      path: "/government/budget",
    },
    {
      label: t("nav.reports"),
      icon: <PieChart size={18} />,
      path: "/government/reports",
    },
  ];

  return (
    <div className='h-screen w-full overflow-hidden flex flex-col bg-[#F8F8F8] dark:bg-slate-900 transition-colors'>
      <Header title={t("portal.government")} />
      <div className='flex-1 flex overflow-hidden relative w-full'>
        <Sidebar
          items={navItems}
          currentPath={path}
          onNavigate={(p) => navigate(p)}
        />
        <main className='flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0'>{children}</main>
      </div>
    </div>
  );
};

/* ============================================================
 *  ROUTE GUARDS
 * ============================================================ */
const ProtectedRoute: React.FC<{ children: React.ReactNode; role: string }> = ({
  children,
  role,
}) => {
  // selector form → guaranteed re-render on state change
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to='/login' replace />;
  if (user?.role !== role) {
    // wrong role → send to their own home, never to '/'
    return <Navigate to={homeForRole(user?.role)} replace />;
  }
  return <>{children}</>;
};

/** Wrapper for /login — auto-redirects logged-in users to their home */
const LoginGate: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }
  return <Login />;
};

/** Wrapper for /register — auto-redirects logged-in users to their home */
const RegisterGate: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }
  return <Register />;
};

/* ============================================================
 *  ROUTES
 * ============================================================ */
const AppRoutes: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  return (
    <Routes>
      {/* Auth */}
      <Route path='/login' element={<LoginGate />} />
      <Route path='/register' element={<RegisterGate />} />

      {/* ===== Student ===== */}
      <Route
        path='/student'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/schemes'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentSchemes />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/apply'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentApply />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/tracker'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentTracker />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/track'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <Tracker />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/disbursal'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentDisbursal />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/notifications'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentNotifications />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/grievances'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentGrievances />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/issues'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <Issues />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/renewal'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentRenewal />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/vault'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentVault />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/vault/ocr'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentVaultOCR />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/student/profile'
        element={
          <ProtectedRoute role='student'>
            <StudentLayout>
              <StudentProfile />
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* ===== Admin ===== */}
      <Route
        path='/admin'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/schemes'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminSchemeConfig />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/screening'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminScreening />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/communication'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminCommunication />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/audit'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminAuditLog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/disbursal'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminDisbursal />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/grievances'
        element={
          <ProtectedRoute role='admin'>
            <AdminLayout>
              <AdminGrievances />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ===== Government ===== */}
      <Route
        path='/government'
        element={
          <ProtectedRoute role='government'>
            <GovernmentLayout>
              <GovernmentDashboard />
            </GovernmentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/government/performance'
        element={
          <ProtectedRoute role='government'>
            <GovernmentLayout>
              <GovernmentSchemePerformance />
            </GovernmentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/government/budget'
        element={
          <ProtectedRoute role='government'>
            <GovernmentLayout>
              <GovernmentBudget />
            </GovernmentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/government/reports'
        element={
          <ProtectedRoute role='government'>
            <GovernmentLayout>
              <GovernmentReports />
            </GovernmentLayout>
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route
        path='/'
        element={
          !isAuthenticated ? (
            <Navigate to='/login' replace />
          ) : (
            <Navigate to={homeForRole(user?.role)} replace />
          )
        }
      />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

/* ============================================================
 *  APP
 * ============================================================ */
function App() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HashRouter>
      <AppRoutes />
      <ToastContainer />
      <OfflineIndicator />
      <CalliflyBot />
    </HashRouter>
  );
}

export default App;
