import { Navigate, Route, Routes } from "react-router-dom";

import AdminDomainRedirect from "@/components/admin/AdminDomainRedirect";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import PwaMetaManager from "@/components/common/PwaMetaManager";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminReservationsPage from "@/pages/admin/AdminReservationsPage";
import AdminRoomPricingPage from "@/pages/admin/AdminRoomPricingPage";
import AdminRoomsPage from "@/pages/admin/AdminRoomsPage";
import AdminSettlementsPage from "@/pages/admin/AdminSettlementsPage";

import HomePage from "@/pages/HomePage";
import ReservationLookupPage from "@/pages/ReservationLookupPage";
import RoomDetailPage from "@/pages/RoomDetailPage";

export default function App() {
  return (
    <>
      <AdminDomainRedirect />
      <PwaMetaManager />

      <Routes>
        {/* 사용자 */}
        <Route path="/" element={<HomePage />} />

        <Route path="/rooms/:roomId" element={<RoomDetailPage />} />

        <Route path="/reservation/lookup" element={<ReservationLookupPage />} />

        {/* 관리자 로그인 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* 관리자 인증 필요 */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="reservations" replace />} />

            <Route path="reservations" element={<AdminReservationsPage />} />

            <Route path="settlements" element={<AdminSettlementsPage />} />

            <Route path="rooms" element={<AdminRoomsPage />} />

            <Route
              path="rooms/:roomId/pricing"
              element={<AdminRoomPricingPage />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
