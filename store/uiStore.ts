import { create } from "zustand";

// 사이드바(네비게이션 서랍)랑 선택된 기업을 전역으로 관리하는 스토어

interface UiState {
  // 상태
  selectedCompanyId: string | null;
  sidebarOpen: boolean;

  // 액션
  setSelectedCompanyId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedCompanyId: null,
  sidebarOpen: false,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
