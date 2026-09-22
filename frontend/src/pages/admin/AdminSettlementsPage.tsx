import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDailySettlement, getMonthlySettlement } from "@/api/admin";
import MonthNavigation from "@/components/common/MonthNavigation";
import { formatDate, isValidDate } from "@/utils/date";
import type { DailySettlement, MonthlySettlement } from "@/types/admin";
function Summary({ data }: { data: DailySettlement | MonthlySettlement }) {
  const cards = [
    ["총 매출", `${data.totalSales.toLocaleString()}원`],
    ["카드 매출", `${data.cardSales.toLocaleString()}원`],
    ["현금 매출", `${data.cashSales.toLocaleString()}원`],
    ["확정 예약 건수", `${data.confirmedReservationCount}건`],
    ["총 수량", `${data.totalQuantity}개`],
  ];
  return (
    <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 break-words text-lg font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
export default function AdminSettlementsPage() {
  const [tab, setTab] = useState<"daily" | "monthly">("daily");
  const [date, setDate] = useState(formatDate(new Date()));
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const year = month.getFullYear();
  const monthNumber = month.getMonth() + 1;
  const daily = useQuery({
    queryKey: ["adminSettlements", "daily", date],
    queryFn: () => getDailySettlement(date),
    enabled: tab === "daily" && isValidDate(date),
  });
  const monthly = useQuery({
    queryKey: ["adminSettlements", "monthly", year, monthNumber],
    queryFn: () => getMonthlySettlement(year, monthNumber),
    enabled: tab === "monthly",
  });
  const query = tab === "daily" ? daily : monthly;
  return (
    <div>
      <h2 className="text-2xl font-bold">정산</h2>
      <div
        className="mt-6 grid grid-cols-2 gap-2"
        role="tablist"
        aria-label="정산 기간"
      >
        {(["daily", "monthly"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`min-h-11 rounded-xl border p-3 ${tab === value ? "bg-black text-white" : "bg-white"}`}
          >
            {value === "daily" ? "일일 정산" : "월별 정산"}
          </button>
        ))}
      </div>
      <section
        className="mt-6"
        aria-label={tab === "daily" ? "일일 정산" : "월별 정산"}
      >
        {tab === "daily" ? (
          <label className="block text-sm">
            정산 날짜
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-xl border bg-white p-3 sm:w-auto"
            />
          </label>
        ) : (
          <MonthNavigation month={month} onChange={setMonth} />
        )}
        {tab === "daily" && !isValidDate(date) ? (
          <p className="mt-5">정산 날짜를 선택해 주세요.</p>
        ) : query.isLoading ? (
          <p className="mt-5" role="status">
            정산 정보를 불러오는 중입니다.
          </p>
        ) : query.isError ? (
          <p className="mt-5 text-red-500" role="alert">
            정산 정보를 불러오지 못했습니다.{" "}
            <button onClick={() => void query.refetch()} className="underline">
              다시 시도
            </button>
          </p>
        ) : (
          <>
            {query.data && <Summary data={query.data} />}
            {tab === "daily" && daily.data && (
              <div className="space-y-3">
                {daily.data.items.length === 0 && (
                  <p className="rounded-xl border bg-white p-6 text-center text-gray-500">
                    확정된 예약이 없습니다.
                  </p>
                )}
                {daily.data.items.map((item) => (
                  <article
                    key={item.reservationId}
                    className="space-y-2 rounded-xl border bg-white p-4"
                  >
                    <p className="text-xs text-gray-500">
                      {item.roomType === "ROOM" ? "방" : "평상"} ·{" "}
                      {item.reservationNumber}
                    </p>
                    <h3 className="font-semibold">
                      {item.roomName} · {item.quantity}개
                    </h3>
                    <p className="font-bold">
                      {item.totalPrice.toLocaleString()}원
                    </p>
                    <p className="text-sm">
                      {item.paymentMethod === "CARD" ? "카드" : "현금"}
                    </p>
                    <p className="text-sm text-gray-500">
                      확정 시간:{" "}
                      {new Date(item.confirmedAt).toLocaleString("ko-KR")}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {tab === "monthly" && monthly.data && (
              <div className="space-y-3">
                {monthly.data.dailySettlements.length === 0 && (
                  <p className="p-6 text-center text-gray-500">
                    정산 내역이 없습니다.
                  </p>
                )}
                {monthly.data.dailySettlements.map((day) => (
                  <article
                    key={day.date}
                    className="rounded-xl border bg-white p-4"
                  >
                    <h3 className="font-semibold">{day.date}</h3>
                    <p className="mt-2 font-bold">
                      총 {day.totalSales.toLocaleString()}원
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>카드 {day.cardSales.toLocaleString()}원</span>
                      <span>현금 {day.cashSales.toLocaleString()}원</span>
                      <span>예약 {day.reservationCount}건</span>
                      <span>수량 {day.totalQuantity}개</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
