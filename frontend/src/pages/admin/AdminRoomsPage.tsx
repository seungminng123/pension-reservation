import type { RoomType } from "@/types/room";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  createAdminRoom,
  deleteAdminRoom,
  deleteAdminRoomImage,
  getAdminRooms,
  updateAdminRoom,
  updateAdminRoomImageOrder,
  uploadAdminRoomImages,
} from "@/api/admin";
import {
  getRoom,
  getRoomImageDetailUrl,
  getRoomImageUrl,
  getRoomImages,
} from "@/api/room";

const initialForm = {
  type: "ROOM" as RoomType,
  name: "",
  description: "",
  price: "",
  maxGuests: "",
  guestCount: "",
  stockCount: "1",
  saleEnabled: true,
};

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);

  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [fileInputKey, setFileInputKey] = useState(0);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: getAdminRooms,
  });

  const { data: existingImages = [] } = useQuery({
    queryKey: ["roomImages", editingRoomId],
    queryFn: () => getRoomImages(editingRoomId!),
    enabled: editingRoomId !== null,
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingRoomId(null);
    setImageFiles([]);
    setFileInputKey((current) => current + 1);
  };

  const refreshRoomQueries = async (roomId?: number) => {
    await queryClient.invalidateQueries({
      queryKey: ["adminRooms"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["rooms"],
    });

    if (roomId) {
      await queryClient.invalidateQueries({
        queryKey: ["room", roomId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["roomImages", roomId],
      });
    }
  };

  // 객실 등록
  const createMutation = useMutation({
    mutationFn: async () => {
      const room = await createAdminRoom({
        type: form.type,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        maxGuests: Number(form.maxGuests),
        guestCount: Number(form.guestCount),
        stockCount: Number(form.stockCount),
        saleEnabled: form.saleEnabled,
      });

      if (imageFiles.length > 0) {
        await uploadAdminRoomImages(room.roomId, imageFiles);
      }

      return room;
    },

    onSuccess: async (room) => {
      await refreshRoomQueries(room.roomId);

      resetForm();
    },
  });

  // 객실 수정
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (editingRoomId === null) {
        throw new Error("수정할 객실이 없습니다.");
      }

      const room = await updateAdminRoom(editingRoomId, {
        type: form.type,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        maxGuests: Number(form.maxGuests),
        guestCount: Number(form.guestCount),
        stockCount: Number(form.stockCount),
        saleEnabled: form.saleEnabled,
      });

      if (imageFiles.length > 0) {
        await uploadAdminRoomImages(editingRoomId, imageFiles);
      }

      return room;
    },

    onSuccess: async (room) => {
      await refreshRoomQueries(room.roomId);

      resetForm();
    },
  });

  // 객실 삭제
  const deleteRoomMutation = useMutation({
    mutationFn: deleteAdminRoom,

    onSuccess: async () => {
      resetForm();

      await refreshRoomQueries();
    },
  });

  // 이미지 삭제
  const deleteImageMutation = useMutation({
    mutationFn: ({ roomId, imageId }: { roomId: number; imageId: number }) =>
      deleteAdminRoomImage(roomId, imageId),

    onSuccess: async (_, variables) => {
      await refreshRoomQueries(variables.roomId);
    },
  });

  // 이미지 순서 변경
  const imageOrderMutation = useMutation({
    mutationFn: ({
      roomId,
      imageIds,
    }: {
      roomId: number;
      imageIds: number[];
    }) => updateAdminRoomImageOrder(roomId, imageIds),

    onSuccess: async (_, variables) => {
      await refreshRoomQueries(variables.roomId);
    },
  });

  // 객실 상세 조회
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
        stockCount: String(room.stockCount),
        saleEnabled: room.saleEnabled,
      });

      setImageFiles([]);

      setFileInputKey((current) => current + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  });

  const handleEdit = (roomId: number) => {
    roomDetailMutation.mutate(roomId);
  };

  const handleDeleteRoom = (roomId: number, roomName: string) => {
    const confirmed = window.confirm(
      `'${roomName}' 객실을 삭제하시겠습니까?\n삭제 후 사용자 화면에서는 표시되지 않습니다.`,
    );

    if (!confirmed) {
      return;
    }

    deleteRoomMutation.mutate(roomId);
  };

  const handleDeleteImage = (imageId: number) => {
    if (editingRoomId === null) {
      return;
    }

    const confirmed = window.confirm("이 사진을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    deleteImageMutation.mutate({
      roomId: editingRoomId,
      imageId,
    });
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    if (editingRoomId === null) {
      return;
    }

    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= existingImages.length) {
      return;
    }

    const imageIds = existingImages.map((image) => image.imageId);

    [imageIds[index], imageIds[nextIndex]] = [
      imageIds[nextIndex],
      imageIds[index],
    ];

    imageOrderMutation.mutate({
      roomId: editingRoomId,
      imageIds,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.type ||
      !form.name ||
      !form.price ||
      !form.guestCount ||
      !form.maxGuests ||
      !form.stockCount
    ) {
      alert("필수 정보를 입력해 주세요.");

      return;
    }

    if (Number(form.guestCount) > Number(form.maxGuests)) {
      alert("기준 인원은 최대 인원보다 클 수 없습니다.");

      return;
    }

    if (Number(form.stockCount) < 1) {
      alert("재고는 1개 이상이어야 합니다.");

      return;
    }

    if (imageFiles.some((file) => file.size > 10 * 1024 * 1024)) {
      alert("이미지는 한 장당 10MB 이하만 업로드할 수 있습니다.");

      return;
    }

    if (existingImages.length + imageFiles.length > 10) {
      alert("객실 이미지는 최대 10장까지 등록할 수 있습니다.");

      return;
    }

    if (editingRoomId !== null) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <h2 className="text-2xl font-bold">객실 관리</h2>

      <p className="mt-2 text-sm text-gray-500">
        객실, 재고, 판매 상태와 사진을 관리할 수 있습니다.
      </p>

      <section className="mt-8 rounded-2xl border bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <select
            aria-label="상품 종류"
            value={form.type}
            onChange={(event) =>
              setForm({
                ...form,
                type: event.target.value as RoomType,
              })
            }
            className="min-w-0 w-full rounded-lg border p-3"
          >
            <option value="ROOM">방</option>
            <option value="PYEONGSANG">평상</option>
          </select>

          <input
            placeholder="객실명"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
            className="min-w-0 w-full rounded-lg border p-3"
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
            className="min-w-0 w-full rounded-lg border p-3"
          />

          <input
            type="number"
            min={1}
            placeholder="재고 수량"
            value={form.stockCount}
            onChange={(event) =>
              setForm({
                ...form,
                stockCount: event.target.value,
              })
            }
            className="min-w-0 w-full rounded-lg border p-3"
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
            className="min-w-0 w-full rounded-lg border p-3"
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
            className="min-w-0 w-full rounded-lg border p-3"
          />

          <label className="flex min-h-12 items-center justify-between rounded-lg border px-4 sm:col-span-2">
            <div>
              <p className="font-medium">판매 상태</p>

              <p className="text-xs text-gray-500">
                판매 중지 시 사용자 목록에 표시되지 않습니다.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.saleEnabled}
              onChange={(event) =>
                setForm({
                  ...form,
                  saleEnabled: event.target.checked,
                })
              }
              className="h-5 w-5"
            />
          </label>

          <textarea
            placeholder="객실 설명"
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            className="min-h-28 min-w-0 w-full rounded-lg border p-3 sm:col-span-2"
          />

          <div className="min-w-0 sm:col-span-2">
            <label
              htmlFor="room-images"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <ImagePlus size={20} aria-hidden="true" />
              객실 사진
            </label>

            <input
              id="room-images"
              key={fileInputKey}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);

                setImageFiles(files);
              }}
              className="min-w-0 w-full rounded-lg border p-3 text-sm"
            />

            <p className="mt-2 text-xs text-gray-400">
              여러 장을 한 번에 선택할 수 있으며 최대 10장까지 등록할 수
              있습니다.
            </p>

            {imageFiles.length > 0 && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                <p className="font-medium">새 사진 {imageFiles.length}장</p>

                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {imageFiles.map((file) => (
                    <p
                      key={`${file.name}-${file.lastModified}`}
                      className="truncate"
                    >
                      {file.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {editingRoomId !== null && existingImages.length > 0 && (
            <div className="sm:col-span-2">
              <p className="mb-3 text-sm font-medium">등록된 사진</p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {existingImages.map((image, index) => (
                  <div
                    key={image.imageId}
                    className="overflow-hidden rounded-xl border"
                  >
                    <div className="relative">
                      <img
                        src={getRoomImageDetailUrl(
                          editingRoomId,
                          image.imageId,
                        )}
                        alt={`객실 이미지 ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-1 text-[11px] font-medium text-white">
                          대표
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 border-t">
                      <button
                        type="button"
                        aria-label="사진 앞으로 이동"
                        disabled={index === 0 || imageOrderMutation.isPending}
                        onClick={() => handleMoveImage(index, -1)}
                        className="flex min-h-10 items-center justify-center border-r disabled:opacity-30"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        aria-label="사진 뒤로 이동"
                        disabled={
                          index === existingImages.length - 1 ||
                          imageOrderMutation.isPending
                        }
                        onClick={() => handleMoveImage(index, 1)}
                        className="flex min-h-10 items-center justify-center border-r disabled:opacity-30"
                      >
                        <ChevronRight size={18} />
                      </button>

                      <button
                        type="button"
                        aria-label="사진 삭제"
                        disabled={deleteImageMutation.isPending}
                        onClick={() => handleDeleteImage(image.imageId)}
                        className="flex min-h-10 items-center justify-center text-red-500 disabled:opacity-30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      <section className="mt-8">
        <h3 className="text-lg font-bold">등록된 객실</h3>

        {isLoading ? (
          <p className="mt-5">객실을 불러오는 중입니다.</p>
        ) : !rooms?.length ? (
          <div className="mt-5 rounded-2xl border bg-white p-10 text-center text-gray-500">
            등록된 객실이 없습니다.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {rooms.map((room) => (
              <article
                key={room.roomId}
                className="min-w-0 overflow-hidden rounded-2xl border bg-white"
              >
                {room.hasImage ? (
                  <img
                    src={getRoomImageUrl(room.roomId)}
                    alt={room.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                    이미지 없음
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                      {room.type === "ROOM" ? "방" : "평상"}
                    </p>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        room.saleEnabled
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {room.saleEnabled ? "판매 중" : "판매 중지"}
                    </span>
                  </div>

                  <h4 className="mt-1 text-lg font-bold">{room.name}</h4>

                  <p className="mt-3 font-semibold">
                    {room.price.toLocaleString()}원 / 박
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    기준 {room.guestCount}명 · 최대 {room.maxGuests}명
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    총 재고 {room.stockCount}개
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(room.roomId)}
                      disabled={roomDetailMutation.isPending}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium"
                    >
                      <Pencil size={18} />
                      객실 정보 수정
                    </button>

                    <Link
                      to={`/admin/rooms/${room.roomId}/pricing`}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-sm font-medium text-white"
                    >
                      <WalletCards size={18} />
                      요금 관리
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.roomId, room.name)}
                      disabled={deleteRoomMutation.isPending}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-500 sm:col-span-2"
                    >
                      <Trash2 size={18} />
                      객실 삭제
                    </button>
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
