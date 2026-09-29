import { homeContent } from "./homeContent";
import HomeImage from "./HomeImage";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="home-container home-section grid items-center gap-10 md:grid-cols-2 md:gap-20"
      aria-labelledby="about-title"
    >
      <div>
        <p className="home-label">BY THE STREAM</p>
        <h2 id="about-title" className="home-title whitespace-pre-line">
          {homeContent.aboutTitle}
        </h2>
        <p className="home-description">{homeContent.introduction}</p>
        <p className="mt-8 text-sm text-stone-500">{homeContent.aboutNote}</p>
      </div>
      <HomeImage
        src={homeContent.aboutImage}
        alt="물놀이와 자연 속 휴식을 표현하는 임시 풍경"
        className="aspect-[4/3] rounded-2xl"
      />
    </section>
  );
}
