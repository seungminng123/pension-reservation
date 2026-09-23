import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

let scrollLocks = 0;
let originalOverflow = "";

export default function Modal({
  title,
  children,
  onClose,
  busy = false,
  variant = "modal",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  variant?: "modal" | "drawer";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (scrollLocks === 0) originalOverflow = document.body.style.overflow;
    scrollLocks += 1;

    dialog?.showModal();

    document.body.style.overflow = "hidden";

    return () => {
      dialog?.close();

      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = originalOverflow;

      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, []);

  // 모달 바깥 배경 클릭 시 닫기
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (busy || event.target !== event.currentTarget) {
      return;
    }

    const dialog = event.currentTarget;

    const rect = dialog.getBoundingClientRect();

    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (clickedOutside) {
      onClose();
    }
  };

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClick={handleBackdropClick}
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onClose();
        }
      }}
      className={
        variant === "drawer"
          ? "fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none overflow-y-auto border-0 bg-white p-4 text-slate-900 backdrop:bg-black/40 sm:ml-auto sm:max-w-lg sm:border-l sm:border-slate-200 sm:p-6"
          : "fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-slate-900 backdrop:bg-black/40 sm:p-6"
      }
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>

        <button
          type="button"
          autoFocus
          disabled={busy}
          aria-label="닫기"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border disabled:opacity-30"
        >
          <X size={20} />
        </button>
      </div>

      {children}
    </dialog>
  );
}
