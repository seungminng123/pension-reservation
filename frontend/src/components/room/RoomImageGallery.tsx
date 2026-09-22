import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getRoomImageDetailUrl, getRoomImages } from "@/api/room";

type RoomImageGalleryProps = {
  roomId: number;
  roomName: string;
};

export default function RoomImageGallery({
  roomId,
  roomName,
}: RoomImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["roomImages", roomId],
    queryFn: () => getRoomImages(roomId),
  });

  if (isLoading) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-gray-400 sm:h-[460px] sm:aspect-auto">
        사진을 불러오는 중입니다.
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-gray-400 sm:h-[460px] sm:aspect-auto">
        이미지가 없습니다.
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, images.length - 1);

  const currentImage = images[safeIndex];

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <div className="relative">
      <img
        src={getRoomImageDetailUrl(roomId, currentImage.imageId)}
        alt={`${roomName} ${safeIndex + 1}`}
        className="aspect-[4/3] w-full object-cover sm:h-[460px] sm:aspect-auto sm:rounded-b-3xl"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="이전 사진"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="다음 사진"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
            {safeIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
