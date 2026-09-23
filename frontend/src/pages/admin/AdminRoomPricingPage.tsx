import { useParams } from "react-router-dom";
import FacilityPricingEditor from "@/components/admin/FacilityPricingEditor";
export default function AdminRoomPricingPage() {
  const { roomId } = useParams();
  const id = Number(roomId);
  if (!Number.isInteger(id) || id <= 0) return <p>시설을 찾을 수 없습니다.</p>;
  return <FacilityPricingEditor key={id} initialRoomId={id} />;
}
