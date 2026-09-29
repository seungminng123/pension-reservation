import { MapPin } from "lucide-react";
import { homeContent } from "./homeContent";

export default function LocationSection() {
  return (
    <section
      id="location"
      className="home-container home-section grid gap-10 md:grid-cols-2 md:gap-20"
      aria-labelledby="location-title"
    >
      <div>
        <p className="home-label">LOCATION</p>
        <h2 id="location-title" className="home-title">
          쉼으로 향하는 길
        </h2>
        <dl className="mt-8 space-y-6 text-sm">
          {[
            { label: "주소", value: homeContent.address },
            { label: "연락처", value: homeContent.phone },
            { label: "체크인", value: homeContent.checkIn },
            { label: "체크아웃", value: homeContent.checkOut },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[5rem_1fr] gap-3">
              <dt className="font-semibold">{label}</dt>
              <dd className="text-stone-500">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div
        className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-stone-200 bg-stone-100 p-8 text-center"
        role="img"
        aria-label="위치 안내 지도 준비 중"
      >
        <MapPin size={36} strokeWidth={1.3} aria-hidden="true" />
        <p className="font-medium">{homeContent.address}</p>
        <p className="text-sm text-stone-500">
          지도 안내를 준비하고 있습니다.
        </p>
      </div>
    </section>
  );
}
