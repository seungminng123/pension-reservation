export function QueryError({
  onRetry,
  message = "정보를 불러오지 못했습니다.",
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <div
      role="alert"
      className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-10 rounded border border-red-300 bg-white px-3 font-medium"
      >
        다시 시도
      </button>
    </div>
  );
}
export function LoadingRows() {
  return (
    <div role="status" className="space-y-3 py-4">
      <span className="sr-only">불러오는 중입니다.</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-16 rounded-lg bg-slate-100 motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}
