import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useState, type FormEvent } from "react";
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

import type { RoomType } from "@/types/room";

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

const getUnitNumber = (name: string) => {
  const match = name.match(/\d+/);

  return match ? Number(match[0]) : null;
};

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);

  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [fileInputKey, setFileInputKey] = useState(0);

  // 방 / 평상 탭
  const [roomListType, setRoomListType] = useState<RoomType>("ROOM");

  // 현재 선택한 방 / 평상
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: getAdminRooms,
  });

  const { data: existingImages = [] } = useQuery({
    queryKey: ["roomImages", editingRoomId],
    queryFn: () => getRoomImages(editingRoomId!),
    enabled: editingRoomId !== null,
  });

  /*
   * =========================
   * 등록된 방
   * =========================
   */
  const registeredRooms = [
    ...(rooms?.filter((room) => room.type === "ROOM") ?? []),
  ].sort((a, b) => {
    const aNumber = getUnitNumber(a.name);
    const bNumber = getUnitNumber(b.name);

    if (aNumber === null && bNumber === null) {
      return a.roomId - b.roomId;
    }

    if (aNumber === null) return 1;
    if (bNumber === null) return -1;

    return aNumber - bNumber;
  });

  /*
   * =========================
   * 등록된 평상
   * =========================
   */
  const registeredPyeongsangs = [
    ...(rooms?.filter((room) => room.type === "PYEONGSANG") ?? []),
  ].sort((a, b) => {
    const aNumber = getUnitNumber(a.name);
    const bNumber = getUnitNumber(b.name);

    if (aNumber === null && bNumber === null) {
      return a.roomId - b.roomId;
    }

    if (aNumber === null) return 1;
    if (bNumber === null) return -1;

    return aNumber - bNumber;
  });

  /*
   * =========================
   * 현재 탭의 목록
   * =========================
   */
  const currentUnits =
    roomListType === "ROOM" ? registeredRooms : registeredPyeongsangs;

  const selectedUnit = currentUnits.find(
    (room) => room.roomId === selectedUnitId,
  );

  const sellingCount = currentUnits.filter((room) => room.saleEnabled).length;

  const stoppedCount = currentUnits.length - sellingCount;

  /*
   * =========================
   * 폼 초기화
   * =========================
   */
  const resetForm = () => {
    setForm(initialForm);
    setEditingRoomId(null);
    setImageFiles([]);
    setFileInputKey((current) => current + 1);
  };

  /*
   * =========================
   * 객실 관련 Query 갱신
   * =========================
   */
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

  /*
   * =========================
   * 객실 등록
   * =========================
   */
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

      setRoomListType(room.type);
      setSelectedUnitId(room.roomId);
    },
  });

  /*
   * =========================
   * 객실 수정
   * =========================
   */
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

      setRoomListType(room.type);
      setSelectedUnitId(room.roomId);
    },
  });

  /*
   * =========================
   * 객실 삭제
   * =========================
   */
  const deleteRoomMutation = useMutation({
    mutationFn: deleteAdminRoom,

    onSuccess: async () => {
      resetForm();
      setSelectedUnitId(null);

      await refreshRoomQueries();
    },
  });

  /*
   * =========================
   * 이미지 삭제
   * =========================
   */
  const deleteImageMutation = useMutation({
    mutationFn: ({ roomId, imageId }: { roomId: number; imageId: number }) =>
      deleteAdminRoomImage(roomId, imageId),

    onSuccess: async (_, variables) => {
      await refreshRoomQueries(variables.roomId);
    },
  });

  /*
   * =========================
   * 이미지 순서 변경
   * =========================
   */
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

  /*
   * =========================
   * 객실 상세 조회
   * =========================
   */
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

  const handleDeleteRoom = (
    roomId: number,
    roomName: string,
    roomType: RoomType,
  ) => {
    const typeLabel = roomType === "ROOM" ? "객실" : "평상";

    const confirmed = window.confirm(
      `'${roomName}' ${typeLabel}을 삭제하시겠습니까?\n삭제 후 사용자 화면에서는 표시되지 않습니다.`,
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

  /*
   * =========================
   * 등록 / 수정
   * =========================
   */
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
      {/* =========================
          페이지 제목
      ========================= */}
      <h2 className="text-2xl font-bold">객실 관리</h2>

      <p className="mt-2 text-sm text-gray-500">
        객실, 재고, 판매 상태와 사진을 관리할 수 있습니다.
      </p>

      {/* =========================
          객실 등록 / 수정
      ========================= */}
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
          {/* 타입 */}
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

          {/* 이름 */}
          <input
            placeholder={form.type === "ROOM" ? "객실명" : "평상명"}
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
            className="min-w-0 w-full rounded-lg border p-3"
          />

          {/* 가격 */}
          <input
            type="number"
            min={1}
            placeholder={
              form.type === "PYEONGSANG" ? "1일 기본 가격" : "1박 기본 가격"
            }
            value={form.price}
            onChange={(event) =>
              setForm({
                ...form,
                price: event.target.value,
              })
            }
            className="min-w-0 w-full rounded-lg border p-3"
          />

          {/* 재고 */}
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

          {/* 기준 인원 */}
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

          {/* 최대 인원 */}
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

          {/* 판매 상태 */}
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

          {/* 설명 */}
          <textarea
            placeholder={form.type === "ROOM" ? "객실 설명" : "평상 설명"}
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            className="min-h-28 min-w-0 w-full rounded-lg border p-3 sm:col-span-2"
          />

          {/* 사진 등록 */}
          <div className="min-w-0 sm:col-span-2">
            <label
              htmlFor="room-images"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <ImagePlus size={20} aria-hidden="true" />

              {form.type === "ROOM" ? "객실 사진" : "평상 사진"}
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

          {/* 기존 사진 */}
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

      {/* =========================
          등록된 객실
      ========================= */}
      <section className="mt-8">
        <h3 className="text-lg font-bold">등록된 객실</h3>

        <p className="mt-1 text-sm text-gray-500">
          방과 평상을 선택해 관리할 수 있습니다.
        </p>

        {isLoading ? (
          <p className="mt-5 text-sm text-gray-500">
            객실을 불러오는 중입니다.
          </p>
        ) : !rooms?.length ? (
          <div className="mt-5 rounded-2xl border bg-white p-10 text-center text-gray-500">
            등록된 객실이 없습니다.
          </div>
        ) : (
          <>
            {/* 방 / 평상 탭 */}
            <div className="mt-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setRoomListType("ROOM");
                  setSelectedUnitId(null);
                }}
                className={`rounded-lg py-3 text-sm font-semibold transition ${
                  roomListType === "ROOM"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500"
                }`}
              >
                방 {registeredRooms.length}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoomListType("PYEONGSANG");
                  setSelectedUnitId(null);
                }}
                className={`rounded-lg py-3 text-sm font-semibold transition ${
                  roomListType === "PYEONGSANG"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500"
                }`}
              >
                평상 {registeredPyeongsangs.length}
              </button>
            </div>

            {currentUnits.length > 0 ? (
              <div className="mt-5">
                {/* 판매 현황 */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white">
                    판매 중 {sellingCount}개
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500">
                    판매 중지 {stoppedCount}개
                  </span>

                  <span className="ml-auto whitespace-nowrap text-[11px] text-gray-400">
                    전체 {currentUnits.length}개
                  </span>
                </div>

                {/* 숫자 카드 */}
                <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                  {currentUnits.map((room) => {
                    const number = getUnitNumber(room.name);

                    return (
                      <button
                        key={room.roomId}
                        type="button"
                        onClick={() =>
                          setSelectedUnitId(
                            selectedUnitId === room.roomId ? null : room.roomId,
                          )
                        }
                        aria-label={`${room.name} ${
                          room.saleEnabled ? "판매 중" : "판매 중지"
                        }`}
                        className={`flex h-8 min-w-0 items-center justify-center rounded-md border text-[11px] font-bold transition sm:h-10 sm:rounded-lg sm:text-xs ${
                          room.saleEnabled
                            ? "border-black bg-black text-white hover:bg-gray-800"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                        }`}
                      >
                        {number ?? room.name}
                      </button>
                    );
                  })}
                </div>

                {/* 범례 */}
                <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-black" />
                    판매 중
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm border border-gray-200 bg-gray-100" />
                    판매 중지
                  </div>
                </div>

                {/* 선택한 객실 */}
                {selectedUnit ? (
                  <article className="mt-5 overflow-hidden rounded-2xl border bg-white">
                    {/* 이미지 */}
                    {selectedUnit.hasImage ? (
                      <img
                        src={getRoomImageUrl(selectedUnit.roomId)}
                        alt={selectedUnit.name}
                        className="h-44 w-full object-cover sm:h-56"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-gray-50 text-xs text-gray-400">
                        등록된 이미지가 없습니다.
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      {/* 제목 */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-400">
                            {selectedUnit.type === "ROOM"
                              ? "선택한 방"
                              : "선택한 평상"}
                          </p>

                          <h4 className="mt-1 text-lg font-bold">
                            {selectedUnit.name}
                          </h4>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            selectedUnit.saleEnabled
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {selectedUnit.saleEnabled ? "판매 중" : "판매 중지"}
                        </span>
                      </div>

                      {/* 정보 */}
                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-4">
                        <div>
                          <p className="text-[11px] text-gray-400">기본 가격</p>

                          <p className="mt-1 text-sm font-semibold">
                            {selectedUnit.price.toLocaleString()}원
                            {selectedUnit.type === "ROOM" ? " / 박" : " / 일"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">기준 인원</p>

                          <p className="mt-1 text-sm font-semibold">
                            {selectedUnit.guestCount}명
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">최대 인원</p>

                          <p className="mt-1 text-sm font-semibold">
                            {selectedUnit.maxGuests}명
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">재고</p>

                          <p className="mt-1 text-sm font-semibold">
                            {selectedUnit.stockCount}개
                          </p>
                        </div>
                      </div>

                      {/* 관리 버튼 */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(selectedUnit.roomId)}
                          disabled={roomDetailMutation.isPending}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium"
                        >
                          <Pencil size={17} />
                          정보 수정
                        </button>

                        <Link
                          to={`/admin/rooms/${selectedUnit.roomId}/pricing`}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-black px-3 text-sm font-medium text-white"
                        >
                          <WalletCards size={17} />
                          요금 관리
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRoom(
                              selectedUnit.roomId,
                              selectedUnit.name,
                              selectedUnit.type,
                            )
                          }
                          disabled={deleteRoomMutation.isPending}
                          className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-500"
                        >
                          <Trash2 size={17} />

                          {selectedUnit.type === "ROOM"
                            ? "객실 삭제"
                            : "평상 삭제"}
                        </button>
                      </div>
                    </div>
                  </article>
                ) : (
                  <p className="mt-4 text-center text-[11px] text-gray-400">
                    관리할 {roomListType === "ROOM" ? "방" : "평상"} 번호를
                    선택해 주세요.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border bg-white p-10 text-center text-sm text-gray-500">
                등록된 {roomListType === "ROOM" ? "방" : "평상"}이 없습니다.
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
