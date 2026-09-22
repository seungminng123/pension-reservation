import { Navigate, useLocation } from "react-router-dom";

export default function AdminDomainRedirect() {
  const location = useLocation();

  const isAdminDomain =
    window.location.hostname === "pension-reservation-admin.vercel.app";

  if (isAdminDomain && location.pathname === "/") {
    return <Navigate to="/admin/login" replace />;
  }

  return null;
}
