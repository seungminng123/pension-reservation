import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import RoomSection from "@/components/home/RoomSection";
import PyeongsangSection from "@/components/home/PyeongsangSection";
import FacilitySection from "@/components/home/FacilitySection";
import LocationSection from "@/components/home/LocationSection";
import ReservationCTA from "@/components/home/ReservationCTA";
import HomeFooter from "@/components/home/HomeFooter";
import ScrollReveal from "@/components/home/ScrollReveal";
import "@/components/home/home.css";

export default function PensionHomePage() {
  const { hash, search } = useLocation();
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.getElementById("home-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: "0px 0px 100px 0px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [hash]);

  // 이전 관리자 북마크도 새 예약 경로로 연결합니다.
  if (new URLSearchParams(search).get("from") === "admin")
    return <Navigate to={`/reservation${search}`} replace />;

  return (
    <div className="pension-home">
      <a href="#home-main" className="home-skip">
        본문으로 바로가기
      </a>
      <HomeHeader />
      <main id="home-main">
        <HeroSection />
        <ScrollReveal>
          <AboutSection />
        </ScrollReveal>
        <ScrollReveal>
          <PyeongsangSection />
        </ScrollReveal>
        <ScrollReveal>
          <RoomSection />
        </ScrollReveal>
        <ScrollReveal>
          <FacilitySection />
        </ScrollReveal>
        <ScrollReveal>
          <LocationSection />
        </ScrollReveal>
        <ScrollReveal>
          <ReservationCTA />
        </ScrollReveal>
      </main>
      <HomeFooter />
      {!footerVisible && (
        <div className="home-mobile-cta xl:hidden">
          <Link to="/reservation" className="home-button w-full">
            예약하기
          </Link>
        </div>
      )}
    </div>
  );
}
