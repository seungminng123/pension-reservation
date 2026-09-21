import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAdminRoom, getAdminRooms } from "@/api/admin";

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

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: getAdminRooms,
  });

  const createMutation = useMutation({
    mutationFn: createAdminRoom,

    onSuccess: async () => {
      setForm(initialForm);

      await queryClient.invalidateQueries({
        queryKey: ["adminRooms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createMutation.mutate({
      type: form.type,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      maxGuests: Number(form.maxGuests),
      guestCount: Number(form.guestCount),
      imageUrl: form.imageUrl,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">객실 관리</h2>

      <p className="mt-2 text-sm text-gray-500">
        객실을 등록하고 현재 등록된 객실을 확인할 수 있습니다.
      </p>

      <section className="mt-8 rounded-2xl border bg-white p-6">
        <h3 className="text-lg font-bold">새 객실 등록</h3>

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
            placeholder="1박 가격"
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

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-black py-3 text-white sm:col-span-2"
          >
            {createMutation.isPending ? "등록 중..." : "객실 등록"}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-bold">등록된 객실</h3>

        {isLoading ? (
          <p className="mt-5">객실을 불러오는 중입니다.</p>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {rooms?.map((room) => (
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
                  <p className="text-sm text-gray-500">{room.type}</p>

                  <h4 className="mt-1 text-lg font-bold">{room.name}</h4>

                  <p className="mt-3 font-semibold">
                    {room.price.toLocaleString()}원 / 박
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    기준 {room.guestCount}명 · 최대 {room.maxGuests}명
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
