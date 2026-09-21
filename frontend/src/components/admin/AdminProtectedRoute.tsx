import { Navigate, Outlet } from "react-router-dom";

import { useAdminAuthStore } from "@/stores/adminAuth";

export default function AdminProtectedRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
