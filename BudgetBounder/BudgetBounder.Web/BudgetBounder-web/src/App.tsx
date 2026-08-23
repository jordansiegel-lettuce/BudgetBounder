import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AdminShell from "./components/admin/AdminShell";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Missions from "./pages/admin/Missions";
import Monitoring from "./pages/admin/Monitoring";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
import AuditLog from "./pages/admin/AuditLog";
import AiReview from "./pages/admin/AiReview";
import GameOperations from "./pages/admin/GameOperations";
import Rewards from "./pages/admin/Rewards";
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
        <Route path="/ai-review" element={<AiReview />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/game" element={<GameOperations />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/overview" replace />} />
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
