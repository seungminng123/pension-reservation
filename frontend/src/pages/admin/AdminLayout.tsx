import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAdminAuthStore } from "@/stores/adminAuth";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = useAdminAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">펜션 관리자</h1>

            <p className="mt-1 text-sm text-gray-500">예약 및 객실 관리</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-48 shrink-0">
          <nav className="space-y-2">
            <NavLink
              to="/admin/reservations"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 ${
                  isActive
                    ? "bg-black font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              예약 관리
            </NavLink>

            <NavLink
              to="/admin/rooms"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 ${
                  isActive
                    ? "bg-black font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              객실 관리
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
