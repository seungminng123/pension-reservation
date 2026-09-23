import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { adminLogin } from "@/api/admin";
import { useAdminAuthStore } from "@/stores/adminAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const setAccessToken = useAdminAuthStore((state) => state.setAccessToken);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: adminLogin,

    onSuccess: (accessToken) => {
      setAccessToken(accessToken);

      navigate("/admin", {
        replace: true,
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginId || !password) {
      return;
    }

    loginMutation.mutate({
      loginId,
      password,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-5">
      <section className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">관리자 로그인</h1>

        <p className="mt-2 text-sm text-gray-500">
          관리자 계정으로 로그인해 주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">관리자 ID</label>

            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className="min-w-0 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              placeholder="관리자 ID"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">비밀번호</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-w-0 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              placeholder="비밀번호"
            />
          </div>

          {loginMutation.isError && (
            <p className="text-sm text-red-500">
              관리자 ID 또는 비밀번호를 확인해 주세요.
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-xl bg-black py-3 font-medium text-white disabled:opacity-50"
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </section>
    </main>
  );
}
