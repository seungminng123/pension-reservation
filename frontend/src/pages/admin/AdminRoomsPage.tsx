import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { getAdminRooms } from "@/api/admin";
import FacilityEditorDrawer from "@/components/admin/FacilityEditorDrawer";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import type { RoomType } from "@/types/room";
export default function AdminRoomsPage() {
  const rooms = useQuery({ queryKey: ["adminRooms"], queryFn: getAdminRooms });
  const [type, setType] = useState<RoomType>("ROOM");
  const [editor, setEditor] = useState<{
    id: number | null;
    type: RoomType;
  } | null>(null);
  const data = rooms.data ?? [];
  const units = data
    .filter((room) => room.type === type)
    .sort((a, b) => a.name.localeCompare(b.name, "ko", { numeric: true }));
  const summary = [
    ["전체 시설", data.length],
    ["판매 중", data.filter((room) => room.saleEnabled).length],
    ["판매 중지", data.filter((room) => !room.saleEnabled).length],
    ["방", data.filter((room) => room.type === "ROOM").length],
    ["평상", data.filter((room) => room.type === "PYEONGSANG").length],
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">객실 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            객실과 평상의 기본 정보와 판매 상태를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ id: null, type })}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
        >
          <Plus size={17} />새 시설 등록
        </button>
      </div>
      {rooms.isLoading ? (
        <LoadingRows />
      ) : rooms.isError ? (
        <QueryError onRetry={() => void rooms.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {summary.map(([label, count]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-bold">{count}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {(["ROOM", "PYEONGSANG"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={type === value}
                onClick={() => setType(value)}
                className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${type === value ? "border-slate-500 bg-slate-100 text-slate-900 font-semibold" : "border-slate-300 bg-white text-slate-600"}`}
              >
                {value === "ROOM" ? "방" : "평상"} (
                {data.filter((room) => room.type === value).length})
              </button>
            ))}
          </div>
          <section
            aria-label="등록된 시설"
            className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
          >
            {units.map((room) => (
              <button
                key={room.roomId}
                type="button"
                aria-label={`${room.name} 수정`}
                onClick={() => setEditor({ id: room.roomId, type: room.type })}
                className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-slate-500"
              >
                <h3 className="font-semibold">{room.name}</h3>
                <p className="mt-3 font-bold">
                  {room.price.toLocaleString()}원
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    / {room.type === "ROOM" ? "박" : "일"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  최대 {room.maxGuests}명
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  재고 {room.stockCount}개
                </p>
                <p
                  className={`mt-3 text-xs font-medium ${room.saleEnabled ? "text-green-800" : "text-slate-500"}`}
                >
                  {room.saleEnabled ? "● 판매 중" : "○ 판매 중지"}
                </p>
                <span className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium">
                  <Pencil size={14} />
                  수정
                </span>
              </button>
            ))}
          </section>
          {!units.length && (
            <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              등록된 {type === "ROOM" ? "방" : "평상"}이 없습니다. 새 시설을
              등록해 주세요.
            </p>
          )}
        </>
      )}
      {editor && (
        <FacilityEditorDrawer
          key={editor.id ?? "new"}
          roomId={editor.id}
          type={editor.type}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}
