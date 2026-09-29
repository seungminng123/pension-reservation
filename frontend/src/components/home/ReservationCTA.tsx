import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReservationCTA() {
  return (
    <section className="bg-[#303e35] text-white">
      <div className="home-container home-section flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="mb-4 text-xs tracking-[0.2em] text-white/70">
            YOUR NEXT STAY
          </p>
          <h2 className="text-3xl leading-snug font-medium sm:text-4xl">
            머무를 날짜를 확인해보세요
          </h2>
          <p className="mt-5 leading-7 text-white/80">
            원하는 날짜의 객실과 평상 예약 가능 여부를 확인할 수 있습니다.
          </p>
        </div>
        <Link
          to="/reservation"
          className="home-button home-button-light shrink-0"
        >
          예약 가능 여부 확인 <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
