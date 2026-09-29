import {
  CookingPot,
  Flame,
  PawPrint,
  Trees,
  Waves,
  Mountain,
} from "lucide-react";

// 사용자 제공 운영 정보를 반영했습니다. 문구·운영 정보·이미지 URL은 여기에서 수정하세요.
// 아래 사진은 실제 시설 사진이 아닌 임시 분위기 이미지입니다.
export const homeContent = {
  name: "거림내캠핑하우스",
  englishName: "GEORIMNAE CAMPING HOUSE",
  heroLabel: "계곡 · 평상 · 객실",
  headline: "계곡 바로 앞에서\n보내는 시원한 하루",
  heroDescription:
    "머물러도 좋고, 하루 쉬어가도 좋은 곳. 가평 거림내캠핑하우스에서 만나요.",
  imageNotice:
    "사진은 자연 분위기를 보여주는 임시 이미지이며, 실제 장소 사진으로 교체 예정입니다.",
  aboutTitle: "물놀이부터 휴식까지,\n계곡 곁에서 함께",
  aboutNote: "용소폭포 인근 · 반려동물 동반 가능",
  pyeongsangTitle: "계곡 앞 평상에서\n즐기는 여유로운 하루",
  pyeongsangDescription:
    "물놀이를 즐기고, 평상에서 쉬어가고, 함께 음식을 준비하는 하루. 계곡 앞 평상에서 가족, 친구와 느긋한 시간을 보내세요.",
  pyeongsangGuide:
    "1~30번 평상 운영 · 평상 취사 가능\n이용 인원과 요금은 날짜 선택 후 확인해 주세요.",
  facilityDescription:
    "물놀이와 평상 취사, 객실 숙박까지. 상세 이용 시간과 준비물, 반려동물 동반 조건은 추후 안내됩니다.",
  introduction:
    "경기도 가평, 계곡 바로 옆에 자리한 거림내캠핑하우스입니다. 시원한 물놀이와 계곡 앞 평상, 취사와 바비큐를 즐겨보세요. 하루 쉬어가는 나들이도, 객실에서 머무는 여행도 자연 속에서 편안하게 함께합니다.",
  heroImage:
    "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=2400&q=85",
  aboutImage:
    "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1200&q=80",
  pyeongsangImage:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
  address: "경기도 가평군 북면 가화로 2631",
  phone: "연락처 안내 준비 중",
  checkIn: "체크인 시간 안내 준비 중",
  checkOut: "체크아웃 시간 안내 준비 중",
  business: "대표자 · 사업자등록번호 안내 준비 중",
};

export const homeSections = [
  { id: "about", label: "계곡과 쉼" },
  { id: "pyeongsang", label: "평상 안내" },
  { id: "rooms", label: "객실 안내" },
  { id: "facilities", label: "시설 안내" },
  { id: "location", label: "오시는 길" },
];

export const facilities = [
  {
    name: "계곡 물놀이",
    icon: Waves,
    description: "계곡 바로 옆에서 즐기는 시원한 하루",
  },
  {
    name: "평상 취사",
    icon: CookingPot,
    description: "계곡 앞 평상에서 함께 준비하는 한 끼",
  },
  {
    name: "바비큐",
    icon: Flame,
    description: "자연 속에서 함께 즐기는 바비큐 · 상세 이용 안내 준비 중",
  },
  {
    name: "반려동물 동반",
    icon: PawPrint,
    description: "반려동물과 함께하는 휴식 · 동반 조건 안내 준비 중",
  },
  {
    name: "용소폭포 인근",
    icon: Mountain,
    description: "가평의 자연을 가까이 만나는 여행",
  },
  {
    name: "자연환경",
    icon: Trees,
    description: "물소리와 초록빛 풍경 속에서 쉬어가는 시간",
  },
];
