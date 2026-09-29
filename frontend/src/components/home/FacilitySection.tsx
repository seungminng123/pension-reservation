import { facilities, homeContent } from "./homeContent";
import ScrollReveal from "./ScrollReveal";

export default function FacilitySection() {
  return (
    <section
      id="facilities"
      className="bg-stone-50"
      aria-labelledby="facilities-title"
    >
      <div className="home-container home-section">
        <p className="home-label">FACILITIES</p>
        <h2 id="facilities-title" className="home-title">
          더 편안한 머무름을 위해
        </h2>
        <p className="home-description">{homeContent.facilityDescription}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map(({ name, icon: Icon, description }, index) => (
            <ScrollReveal key={name} delay={(index % 3) * 90}>
              <article className="h-full rounded-2xl border border-stone-200 bg-white p-7">
                <Icon size={28} strokeWidth={1.4} aria-hidden="true" />
                <h3 className="mt-6 text-lg font-semibold">{name}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  {description}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
