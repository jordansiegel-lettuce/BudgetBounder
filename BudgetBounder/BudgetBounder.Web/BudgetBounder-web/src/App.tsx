import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AdminShell from "./components/admin/AdminShell";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Missions from "./pages/admin/Missions";
import Monitoring from "./pages/admin/Monitoring";
import Overview from "./pages/admin/Overview";
import Placeholder from "./pages/admin/Placeholder";
import Users from "./pages/admin/Users";
import "./App.css";
import { canAccessAdmin } from "./auth/authToken";

function AdminRoute() {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!canAccessAdmin(user)) return <Navigate to="/login?reason=admin" replace />;
  return <Outlet />;
}

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<AdminRoute />}>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/ai-review" element={<Placeholder title="AI recommendation review" description="Human approval for generated recommendations and missions." />} />
        <Route path="/analytics" element={<Placeholder title="Product analytics" description="Retention, finance habits, missions, progression and AI engagement." />} />
        <Route path="/game" element={<Placeholder title="Game operations" description="Unity WebGL sessions, results, errors and suspicious scores." />} />
        <Route path="/rewards" element={<Placeholder title="Rewards and achievements" description="Safe cosmetic rewards, badge definitions and unlock health." />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/audit-log" element={<Placeholder title="Audit log" description="Sensitive administrative actions and security events." />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/overview" replace />} />
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
