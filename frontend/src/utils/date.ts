export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
};
export const monthDates = (month: Date) =>
  Array.from(
    {
      length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    },
    (_, index) =>
      formatDate(new Date(month.getFullYear(), month.getMonth(), index + 1)),
  );
export const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00`);

  date.setDate(date.getDate() + days);

  return formatDate(date);
};
