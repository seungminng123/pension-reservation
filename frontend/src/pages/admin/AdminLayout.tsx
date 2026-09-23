import {
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Plus,
  WalletCards,
  Tags,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuthStore } from "@/stores/adminAuth";
const links = [
  { to: "/admin", label: "운영 현황", icon: LayoutDashboard, end: true },
  { to: "/admin/reservations", label: "예약 관리", icon: CalendarDays },
  { to: "/admin/rooms", label: "객실 관리", icon: BedDouble, end: true },
  { to: "/admin/pricing", label: "가격 관리", icon: Tags },
  { to: "/admin/settlements", label: "정산 관리", icon: WalletCards },
];
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = useQueryClient();
  const logout = useAdminAuthStore((state) => state.logout);
  useEffect(() => {
    document.title = "펜션 관리자";
    return () => {
      document.title = "펜션 예약";
    };
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-base font-bold sm:text-lg">펜션 관리자</h1>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              예약 · 시설 · 정산 운영
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/?from=admin"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              예약하기
            </NavLink>
            <button
              type="button"
              aria-label="로그아웃"
              onClick={() => {
                logout();
                client.clear();
                navigate("/admin/login", { replace: true });
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-600"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-slate-200 bg-white lg:min-h-[calc(100dvh-70px)] lg:w-48 lg:border-r lg:border-b-0">
          <nav
            aria-label="관리자 메뉴"
            className="flex gap-1 overflow-x-auto p-2 lg:sticky lg:top-0 lg:flex-col lg:p-3"
          >
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm ${isActive || (to === "/admin/pricing" && /^\/admin\/rooms\/[^/]+\/pricing$/.test(location.pathname)) ? "bg-slate-900 font-semibold text-white" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
