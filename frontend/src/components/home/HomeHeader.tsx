import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { homeContent, homeSections } from "./homeContent";

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div ref={sentinel} className="home-header-sentinel" aria-hidden="true" />
      <header
        className={`home-header ${scrolled || open ? "home-header-solid" : "home-header-transparent"}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <div className="home-container flex min-h-20 items-center justify-between gap-4">
          <Link
            to="/"
            className="shrink-0"
            aria-label={`${homeContent.name} 홈`}
            onClick={() => setOpen(false)}
          >
            <span className="block text-xl font-semibold tracking-tight">
              {homeContent.name}
            </span>
            <span className="mt-1 block text-[10px] tracking-[0.16em] opacity-75">
              {homeContent.englishName}
            </span>
          </Link>
          <nav
            aria-label="주 메뉴"
            className="hidden items-center gap-5 text-sm xl:flex"
          >
            {homeSections.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className="py-3 hover:text-stone-500">
                {label}
              </a>
            ))}
            <Link to="/reservation/lookup" className="py-3">
              예약 조회
            </Link>
            <Link to="/reservation" className="home-button">
              예약하기
            </Link>
          </nav>
          <button
            ref={toggle}
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            onClick={() => setOpen(!open)}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-stone-200 xl:hidden"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          id="home-mobile-menu"
          aria-label="모바일 메뉴"
          hidden={!open}
          className="home-mobile-menu border-t border-stone-100 bg-white px-6 pb-5 xl:hidden"
        >
          {homeSections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm"
            >
              {label}
            </a>
          ))}
          <Link to="/reservation/lookup" className="block py-3 text-sm">
            예약 조회
          </Link>
          <Link to="/reservation" className="home-button mt-2 w-full">
            예약하기
          </Link>
        </nav>
      </header>
    </>
  );
}
