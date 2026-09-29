import { homeContent } from "./homeContent";

export default function HomeFooter() {
  return (
    <footer id="home-footer" className="home-container py-12">
      <p className="text-xl font-semibold">{homeContent.name}</p>
      <div className="mt-5 space-y-2 text-sm text-stone-500">
        <p>{homeContent.address}</p>
        <p>{homeContent.phone}</p>
        <p>{homeContent.business}</p>
      </div>
      <p className="mt-8 border-t border-stone-200 pt-6 text-xs text-stone-500">
        © {new Date().getFullYear()} {homeContent.name}. All rights reserved.
      </p>
    </footer>
  );
}
