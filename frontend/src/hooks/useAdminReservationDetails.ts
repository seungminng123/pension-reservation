import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminReservation } from "@/api/admin";
import type { AdminReservationDetail } from "@/types/admin";
// The list endpoint omits phone, guest count and deposit data. Reuse detail
// queries with a bounded worker pool rather than sending all requests at once.
export default function useAdminReservationDetails(ids: number[]) {
  const client = useQueryClient();
  return useQuery({
    queryKey: ["adminReservationDetails", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const details: Record<number, AdminReservationDetail> = {};
      const failed: number[] = [];
      let next = 0;
      await Promise.all(
        Array.from({ length: Math.min(6, ids.length) }, async () => {
          while (next < ids.length) {
            const id = ids[next++];
            try {
              details[id] = await client.fetchQuery({
                queryKey: ["adminReservation", id],
                queryFn: () => getAdminReservation(id),
                staleTime: 30_000,
              });
            } catch {
              failed.push(id);
            }
          }
        }),
      );
      return { details, failed };
    },
  });
}
