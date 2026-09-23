import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  createAdminRoom,
  updateAdminRoom,
  deleteAdminRoom,
  uploadAdminRoomImages,
  deleteAdminRoomImage,
  updateAdminRoomImageOrder,
} from "@/api/admin";
import { getRoom, getRoomImages, getRoomImageDetailUrl } from "@/api/room";
import Modal from "@/components/common/Modal";
import { LoadingRows, QueryError } from "@/components/admin/QueryFeedback";
import type { RoomDetail, RoomType } from "@/types/room";
export default function FacilityEditorDrawer({
  roomId,
  type,
  onClose,
}: {
  roomId: number | null;
  type: RoomType;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId!),
    enabled: roomId !== null,
  });
  if (roomId !== null && (detail.isLoading || detail.isError))
    return (
      <Modal title="시설 수정" variant="drawer" onClose={onClose}>
        {detail.isError ? (
          <QueryError onRetry={() => void detail.refetch()} />
        ) : (
          <LoadingRows />
        )}
      </Modal>
    );
  return (
    <FacilityForm
      key={roomId ?? "new"}
      initial={detail.data}
      type={type}
      onClose={onClose}
    />
  );
}
function FacilityForm({
  initial,
  type,
  onClose,
}: {
  initial?: RoomDetail;
  type: RoomType;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [savedId, setSavedId] = useState<number | null>(
    initial?.roomId ?? null,
  );
  const [form, setForm] = useState({
    type: initial?.type ?? type,
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    guestCount: initial ? String(initial.guestCount) : "",
    maxGuests: initial ? String(initial.maxGuests) : "",
    stockCount: initial ? String(initial.stockCount) : "1",
    saleEnabled: initial?.saleEnabled ?? true,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState("");
  const [imageSaveError, setImageSaveError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"facility" | number | null>(
    null,
  );
  const images = useQuery({
    queryKey: ["roomImages", savedId],
    queryFn: () => getRoomImages(savedId!),
    enabled: savedId !== null,
  });
  const refresh = async () => {
    await Promise.all(
      [
        "adminRooms",
        "rooms",
        "room",
        "roomImages",
        "adminRoomPrices",
        "availableRooms",
        "roomAvailability",
        "roomAvailabilityCheck",
      ].map((key) => client.invalidateQueries({ queryKey: [key] })),
    );
  };
  const save = useMutation({
    mutationFn: async () => {
      const request = {
        ...form,
        name: form.name.trim(),
        price: Number(form.price),
        guestCount: Number(form.guestCount),
        maxGuests: Number(form.maxGuests),
        stockCount: Number(form.stockCount),
      };
      const room =
        savedId === null
          ? await createAdminRoom(request)
          : await updateAdminRoom(savedId, request);
      // Persist the ID before uploading: retrying an upload must never create a duplicate facility.
      setSavedId(room.roomId);
      if (files.length) {
        try {
          await uploadAdminRoomImages(room.roomId, files);
        } catch {
          return { room, imageFailed: true };
        }
      }
      return { room, imageFailed: false };
    },
    onSuccess: async (result) => {
      await refresh();
      if (result.imageFailed) {
        setImageSaveError(true);
      } else {
        setFiles([]);
        setFileKey((key) => key + 1);
        onClose();
      }
    },
  });
  const imageAction = useMutation({
    mutationFn: async (
      action: { kind: "delete"; id: number } | { kind: "order"; ids: number[] },
    ) => {
      if (savedId === null) return;
      if (action.kind === "delete")
        await deleteAdminRoomImage(savedId, action.id);
      else await updateAdminRoomImageOrder(savedId, action.ids);
    },
    onSuccess: async () => {
      await refresh();
      setDeleteTarget(null);
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteAdminRoom(savedId!),
    onSuccess: async () => {
      await refresh();
      onClose();
    },
  });
  const busy = save.isPending || imageAction.isPending || remove.isPending;
  const move = (index: number, offset: number) => {
    const ids = (images.data ?? []).map((image) => image.imageId);
    const target = index + offset;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    imageAction.mutate({ kind: "order", ids });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setImageSaveError(false);
    if (!form.name.trim()) {
      setError("시설명을 입력해 주세요.");
      return;
    }
    if (
      [form.price, form.guestCount, form.maxGuests, form.stockCount].some(
        (value) =>
          !value || !Number.isSafeInteger(Number(value)) || Number(value) < 1,
      )
    ) {
      setError("가격, 인원, 재고는 1 이상의 정수로 입력해 주세요.");
      return;
    }
    if (Number(form.guestCount) > Number(form.maxGuests)) {
      setError("기준 인원은 최대 인원보다 클 수 없습니다.");
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("사진은 한 장당 10MB 이하로 선택해 주세요.");
      return;
    }
    if ((images.data?.length ?? 0) + files.length > 10) {
      setError("사진은 최대 10장까지 등록할 수 있습니다.");
      return;
    }
    save.mutate();
  };
  const fields = [
    ["name", "시설명", "text"],
    ["price", "기본 가격 (원)", "number"],
    ["guestCount", "기준 인원", "number"],
    ["maxGuests", "최대 인원", "number"],
    ["stockCount", "재고 수량", "number"],
  ] as const;
  return (
    <Modal
      title={savedId === null ? "새 시설 등록" : `${form.name} 수정`}
      variant="drawer"
      busy={busy}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-70">
          <label className="block text-sm font-medium">
            시설 유형 *
            <select
              aria-label="시설 유형"
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value as RoomType })
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3"
            >
              <option value="ROOM">방</option>
              <option value="PYEONGSANG">평상</option>
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label, inputType]) => (
              <label
                key={key}
                className={`block text-sm font-medium ${key === "name" ? "sm:col-span-2" : ""}`}
              >
                {label} *
                <input
                  aria-label={label}
                  required
                  type={inputType}
                  min={inputType === "number" ? 1 : undefined}
                  step={inputType === "number" ? 1 : undefined}
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            기본 가격만 수정합니다. 날짜별 특별 가격은{" "}
            <Link
              to={
                savedId ? `/admin/rooms/${savedId}/pricing` : "/admin/pricing"
              }
              className="underline"
            >
              가격 관리
            </Link>
            에서 설정하세요.
          </p>
          <label className="block text-sm font-medium">
            시설 설명
            <textarea
              aria-label="시설 설명"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            />
          </label>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold">판매 상태</p>
            <button
              type="button"
              role="switch"
              aria-label="판매 상태"
              aria-checked={form.saleEnabled}
              onClick={() =>
                setForm({ ...form, saleEnabled: !form.saleEnabled })
              }
              className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 text-left"
            >
              <span className="text-sm font-medium">
                {form.saleEnabled ? "● 판매 중" : "○ 판매 중지"}
              </span>
              <span
                className={`flex h-6 w-11 rounded-full p-1 ${form.saleEnabled ? "justify-end bg-green-700" : "justify-start bg-slate-300"}`}
              >
                <span className="h-4 w-4 rounded-full bg-white" />
              </span>
            </button>
            <p className="text-xs text-slate-500">
              {form.saleEnabled
                ? "사용자 예약 화면에 표시됩니다."
                : "사용자 예약 화면에 표시되지 않습니다."}
            </p>
          </div>
          <label className="block text-sm font-medium">
            시설 사진
            <input
              key={fileKey}
              aria-label="시설 사진"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
                setImageSaveError(false);
              }}
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </label>
          <p className="text-xs text-slate-500">
            최대 10장 · 한 장당 10MB 이하. 저장 시 선택한 사진을 업로드합니다.
          </p>
          {files.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs">
              <p className="font-medium">추가할 사진 {files.length}장</p>
              {files.map((file, index) => (
                <p key={index} className="mt-1 break-all">
                  {file.name}
                </p>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  setFileKey((key) => key + 1);
                }}
                className="mt-2 min-h-9 underline"
              >
                선택 사진 비우기
              </button>
            </div>
          )}
          {savedId !== null &&
            (images.isLoading ? (
              <LoadingRows />
            ) : images.isError ? (
              <QueryError
                message="사진 목록을 불러오지 못했습니다."
                onRetry={() => void images.refetch()}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {images.data?.map((image, index) => (
                  <div
                    key={image.imageId}
                    className="overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={getRoomImageDetailUrl(savedId, image.imageId)}
                      alt={`시설 사진 ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="px-2 pt-2 text-xs text-slate-500">
                      {index === 0 ? "대표 사진" : `사진 ${index + 1}`}
                    </p>
                    <div className="grid grid-cols-3">
                      <button
                        type="button"
                        aria-label="사진 앞으로 이동"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="flex min-h-11 items-center justify-center disabled:opacity-30"
                      >
                        <ChevronLeft size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="사진 뒤로 이동"
                        disabled={index === images.data!.length - 1}
                        onClick={() => move(index, 1)}
                        className="flex min-h-11 items-center justify-center disabled:opacity-30"
                      >
                        <ChevronRight size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="사진 삭제"
                        onClick={() => {
                          imageAction.reset();
                          setDeleteTarget(image.imageId);
                        }}
                        className="flex min-h-11 items-center justify-center text-red-700"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          {save.isError && (
            <p role="alert" className="text-sm text-red-700">
              시설 저장에 실패했습니다. 입력값을 확인한 후 다시 저장해 주세요.
            </p>
          )}
          {imageSaveError && (
            <p role="alert" className="text-sm text-red-700">
              시설 정보는 저장했지만 사진 업로드에 실패했습니다. 다시 저장하면
              같은 시설에 사진 업로드를 재시도합니다.
            </p>
          )}
          {imageAction.isError && deleteTarget === null && (
            <QueryError
              message="사진 순서 변경에 실패했습니다."
              onRetry={() =>
                imageAction.variables &&
                imageAction.mutate(imageAction.variables)
              }
            />
          )}
          <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white py-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 flex-1 rounded-lg border border-slate-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                savedId !== null && (images.isLoading || images.isError)
              }
              className="min-h-11 flex-1 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {save.isPending
                ? "저장 중..."
                : savedId === null
                  ? "시설 등록"
                  : "변경사항 저장"}
            </button>
          </div>
          {savedId !== null && (
            <details className="border-t border-slate-200 pt-3">
              <summary className="cursor-pointer text-sm text-slate-500">
                시설 삭제
              </summary>
              <p className="mt-3 text-xs text-slate-500">
                일시적으로 예약을 받지 않을 때는 판매 중지를 사용하세요. 삭제가
                필요한 경우에만 진행하세요.
              </p>
              <button
                type="button"
                onClick={() => {
                  remove.reset();
                  setDeleteTarget("facility");
                }}
                className="mt-3 min-h-11 rounded-lg border border-red-300 px-3 text-sm text-red-700"
              >
                시설 삭제
              </button>
            </details>
          )}
        </fieldset>
      </form>
      {deleteTarget !== null && (
        <Modal
          title={
            deleteTarget === "facility" ? "시설 삭제 확인" : "사진 삭제 확인"
          }
          busy={busy}
          onClose={() => setDeleteTarget(null)}
        >
          <p className="text-sm">
            {deleteTarget === "facility"
              ? `'${form.name}' 시설을 삭제하시겠습니까? 일시 중단은 판매 중지를 권장합니다.`
              : "선택한 사진을 삭제하시겠습니까?"}
          </p>
          {(remove.isError || imageAction.isError) && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              삭제에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setDeleteTarget(null)}
              className="min-h-11 flex-1 rounded-lg border border-slate-300"
            >
              취소
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                deleteTarget === "facility"
                  ? remove.mutate()
                  : imageAction.mutate({ kind: "delete", id: deleteTarget })
              }
              className="min-h-11 flex-1 rounded-lg bg-red-700 text-white"
            >
              {busy ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
