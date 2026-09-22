import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { createAdminRoom, getAdminRooms, updateAdminRoom } from "@/api/admin";
import { getRoom } from "@/api/room";

const initialForm = {
  type: "",
  name: "",
  description: "",
  price: "",
  maxGuests: "",
  guestCount: "",
  imageUrl: "",
};

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);

  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: getAdminRooms,
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingRoomId(null);
  };

  // 객실 등록
  const createMutation = useMutation({
    mutationFn: createAdminRoom,

    onSuccess: async () => {
      resetForm();

      await queryClient.invalidateQueries({
        queryKey: ["adminRooms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
  });

  // 객실 수정
  const updateMutation = useMutation({
    mutationFn: ({
      roomId,
      request,
    }: {
      roomId: number;
      request: {
        type: string;
        name: string;
        description: string;
        price: number;
        maxGuests: number;
        guestCount: number;
        imageUrl: string;
      };
    }) => updateAdminRoom(roomId, request),

    onSuccess: async (_, variables) => {
      resetForm();

      await queryClient.invalidateQueries({
        queryKey: ["adminRooms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["room", variables.roomId],
      });
    },
  });

  // 수정할 객실 상세 조회
  const roomDetailMutation = useMutation({
    mutationFn: getRoom,

    onSuccess: (room) => {
      setEditingRoomId(room.roomId);

      setForm({
        type: room.type,
        name: room.name,
        description: room.description ?? "",
        price: String(room.price),
        maxGuests: String(room.maxGuests),
        guestCount: String(room.guestCount),
        imageUrl: room.imageUrl ?? "",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  });

  const handleEdit = (roomId: number) => {
    roomDetailMutation.mutate(roomId);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.type ||
      !form.name ||
      !form.price ||
      !form.guestCount ||
      !form.maxGuests
    ) {
      alert("필수 정보를 입력해 주세요.");
      return;
    }

    const request = {
      type: form.type,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      maxGuests: Number(form.maxGuests),
      guestCount: Number(form.guestCount),
      imageUrl: form.imageUrl,
    };

    if (editingRoomId !== null) {
      updateMutation.mutate({
        roomId: editingRoomId,
        request,
      });

      return;
    }

    createMutation.mutate(request);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <h2 className="text-2xl font-bold">객실 관리</h2>

      <p className="mt-2 text-sm text-gray-500">
        객실을 등록하고 수정할 수 있습니다.
      </p>

      {/* 객실 등록 / 수정 */}
      <section className="mt-8 rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {editingRoomId !== null ? "객실 수정" : "새 객실 등록"}
          </h3>

          {editingRoomId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500"
            >
              수정 취소
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <input
            placeholder="객실 타입"
            value={form.type}
            onChange={(event) =>
              setForm({
                ...form,
                type: event.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            placeholder="객실명"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            type="number"
            min={1}
            placeholder="1박 기본 가격"
            value={form.price}
            onChange={(event) =>
              setForm({
                ...form,
                price: event.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            type="number"
            min={1}
            placeholder="기준 인원"
            value={form.guestCount}
            onChange={(event) =>
              setForm({
                ...form,
                guestCount: event.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            type="number"
            min={1}
            placeholder="최대 인원"
            value={form.maxGuests}
            onChange={(event) =>
              setForm({
                ...form,
                maxGuests: event.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            placeholder="이미지 URL"
            value={form.imageUrl}
            onChange={(event) =>
              setForm({
                ...form,
                imageUrl: event.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <textarea
            placeholder="객실 설명"
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            className="min-h-28 rounded-lg border p-3 sm:col-span-2"
          />

          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-sm text-red-500 sm:col-span-2">
              객실 저장에 실패했습니다.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-black py-3 font-medium text-white disabled:opacity-50 sm:col-span-2"
          >
            {isSubmitting
              ? "저장 중..."
              : editingRoomId !== null
                ? "객실 수정"
                : "객실 등록"}
          </button>
        </form>
      </section>

      {/* 등록된 객실 */}
      <section className="mt-8">
        <h3 className="text-lg font-bold">등록된 객실</h3>

        {isLoading ? (
          <p className="mt-5">객실을 불러오는 중입니다.</p>
        ) : !rooms?.length ? (
          <div className="mt-5 rounded-2xl border bg-white p-10 text-center text-gray-500">
            등록된 객실이 없습니다.
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {rooms.map((room) => (
              <article
                key={room.roomId}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                    이미지 없음
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{room.type}</p>

                      <h4 className="mt-1 text-lg font-bold">{room.name}</h4>
                    </div>
                  </div>

                  <p className="mt-3 font-semibold">
                    {room.price.toLocaleString()}원 / 박
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    기준 {room.guestCount}명 · 최대 {room.maxGuests}명
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(room.roomId)}
                      disabled={roomDetailMutation.isPending}
                      className="flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      객실 정보 수정
                    </button>

                    <Link
                      to={`/admin/rooms/${room.roomId}/pricing`}
                      className="flex flex-1 items-center justify-center rounded-lg bg-black px-3 py-2.5 text-sm font-medium text-white"
                    >
                      요금 관리
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
