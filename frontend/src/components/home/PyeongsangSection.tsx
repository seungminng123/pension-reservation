import { Link } from "react-router-dom";
import { homeContent } from "./homeContent";
import HomeImage from "./HomeImage";

export default function PyeongsangSection() {
  return (
    <section
      id="pyeongsang"
      className="home-container home-section grid items-center gap-10 md:grid-cols-2 md:gap-20"
      aria-labelledby="pyeongsang-title"
    >
      <HomeImage
        src={homeContent.pyeongsangImage}
        alt="숲에서 즐기는 휴식 분위기 예시"
        className="aspect-[4/3] rounded-2xl"
      />
      <div>
        <p className="home-label">A DAY IN NATURE</p>
        <h2 id="pyeongsang-title" className="home-title whitespace-pre-line">
          {homeContent.pyeongsangTitle}
        </h2>
        <p className="home-description">{homeContent.pyeongsangDescription}</p>
        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-stone-500">
          {homeContent.pyeongsangGuide}
        </p>
        <Link to="/reservation" className="home-button mt-8">
          평상 예약하기
        </Link>
      </div>
    </section>
  );
}
