import { Route, Routes } from "react-router-dom";

function HomePage() {
  return <div>펜션 예약 서비스</div>;
}

function AdminLoginPage() {
  return <div>관리자 로그인</div>;
}

function AdminPage() {
  return <div>관리자 페이지</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
