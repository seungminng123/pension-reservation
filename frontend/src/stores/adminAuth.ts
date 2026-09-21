import { create } from "zustand";

type AdminAuthState = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: sessionStorage.getItem("adminAccessToken"),

  setAccessToken: (accessToken) => {
    sessionStorage.setItem("adminAccessToken", accessToken);

    set({ accessToken });
  },

  logout: () => {
    sessionStorage.removeItem("adminAccessToken");

    set({
      accessToken: null,
    });
  },
}));
