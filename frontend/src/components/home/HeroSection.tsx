import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { homeContent } from "./homeContent";
import HomeImage from "./HomeImage";

export default function HeroSection() {
  return (
    <section
      className="home-hero relative isolate flex items-center bg-stone-700 text-white"
      aria-labelledby="home-title"
    >
      <HomeImage
        src={homeContent.heroImage}
        alt="시원하게 흐르는 물과 자연 풍경의 임시 이미지"
        priority
        className="home-hero-image absolute inset-0 -z-20 h-full w-full"
      />
      <div className="home-hero-overlay absolute inset-0 -z-10 bg-black/50" />
      <div className="home-container pt-32 pb-28">
        <p className="hero-enter mb-6 text-sm tracking-[0.2em]">
          {homeContent.heroLabel}
        </p>
        <h1
          id="home-title"
          className="hero-enter hero-title max-w-4xl whitespace-pre-line text-4xl leading-tight font-medium tracking-tight sm:text-6xl lg:text-7xl"
        >
          {homeContent.headline}
        </h1>
        <p className="hero-enter hero-description mt-7 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
          {homeContent.heroDescription}
        </p>
        <div className="hero-enter hero-actions mt-10 flex flex-wrap gap-3">
          <Link to="/reservation" className="home-button home-button-light">
            예약하기 <ArrowUpRight size={18} />
          </Link>
          <a
            href="#pyeongsang"
            className="home-button border border-white/70 !bg-transparent !text-white"
          >
            평상 둘러보기 <ArrowDown size={18} />
          </a>
          <a
            href="#rooms"
            className="home-button border border-white/70 !bg-transparent !text-white"
          >
            객실 둘러보기 <ArrowDown size={18} />
          </a>
        </div>
        <p className="mt-14 text-xs text-white/80">{homeContent.imageNotice}</p>
      </div>
    </section>
  );
}
