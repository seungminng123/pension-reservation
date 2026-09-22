import { BedDouble, CalendarDays, LogOut, WalletCards } from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAdminAuthStore } from "@/stores/adminAuth";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = useAdminAuthStore((state) => state.logout);

  useEffect(() => {
    document.title = "펜션 관리자";

    return () => {
      document.title = "펜션 예약";
    };
  }, []);

  const handleLogout = () => {
    logout();

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h1 className="text-xl font-bold">펜션 관리자</h1>

            <p className="mt-1 text-sm text-gray-500">예약 및 객실 관리</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <LogOut size={20} strokeWidth={2} aria-hidden="true" />
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:flex-row md:gap-8 md:py-8">
        <aside className="w-full shrink-0 md:w-48">
          <nav
            aria-label="관리자 메뉴"
            className="grid grid-cols-3 gap-2 md:grid-cols-1"
          >
            <NavLink
              to="/admin/reservations"
              className={({ isActive }) =>
                `flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm sm:px-4 sm:text-base md:justify-start ${
                  isActive
                    ? "bg-black font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <CalendarDays size={20} strokeWidth={2} aria-hidden="true" />
              예약 관리
            </NavLink>

            <NavLink
              to="/admin/rooms"
              className={({ isActive }) =>
                `flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm sm:px-4 sm:text-base md:justify-start ${
                  isActive
                    ? "bg-black font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <BedDouble size={20} strokeWidth={2} aria-hidden="true" />
              객실 관리
            </NavLink>

            <NavLink
              to="/admin/settlements"
              className={({ isActive }) =>
                `flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm sm:px-4 sm:text-base md:justify-start ${
                  isActive
                    ? "bg-black font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <WalletCards size={20} strokeWidth={2} aria-hidden="true" />
              정산
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
