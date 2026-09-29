import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

// 기본 상태는 표시. Observer 미지원이나 모션 감소 설정에서도 내용을 읽을 수 있습니다.
export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || !("IntersectionObserver" in window)) return;
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      if (preference.matches || element.dataset.revealed === "true") {
        element.classList.remove("reveal-pending");
        return;
      }
      element.classList.add("reveal-pending");
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.dataset.revealed = "true";
            element.classList.remove("reveal-pending");
            observer?.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px -32px 0px" },
      );
      observer.observe(element);
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", setup);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`home-reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
