import { create } from "zustand";

// 사이드바(네비게이션 서랍)랑 선택된 기업을 전역으로 관리하는 스토어

export type DataStatus = "idle" | "loading" | "error" | "connected";

interface UiState {
  // 상태
  selectedCompanyId: string | null;
  sidebarOpen: boolean;
  dataStatus: DataStatus;

  // 액션
  setSelectedCompanyId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDataStatus: (status: DataStatus) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedCompanyId: null,
  sidebarOpen: false,
  dataStatus: "idle",
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDataStatus: (status) => set({ dataStatus: status }),
}));
