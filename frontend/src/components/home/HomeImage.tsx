import { ImageIcon } from "lucide-react";
import { useState } from "react";

export default function HomeImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <div
      className={`${priority ? "" : "home-image-interactive"} overflow-hidden bg-stone-200 ${className}`}
    >
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full min-h-48 flex-col items-center justify-center gap-3 p-6 text-center text-stone-600"
          role="img"
          aria-label={`${alt} · 사진 준비 중`}
        >
          <ImageIcon size={28} aria-hidden="true" />
          <span className="text-sm">사진 준비 중</span>
        </div>
      )}
    </div>
  );
}
