import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI状態
  isSyncing: boolean;
  lastSyncTime: Date | null;
  currentTab: string;
  
  // エラー状態
  lastError: string | null;
  
  // アクション
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  setCurrentTab: (tab: string) => void;
  setLastError: (error: string | null) => void;
  
  // 一時的なデータキャッシュ
  tempMealText: string;
  setTempMealText: (text: string) => void;
  clearTempMealText: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初期状態
      isSyncing: false,
      lastSyncTime: null,
      currentTab: 'home',
      lastError: null,
      tempMealText: '',
      
      // アクション
      setIsSyncing: (syncing) => set({ isSyncing: syncing }),
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setLastError: (error) => set({ lastError: error }),
      setTempMealText: (text) => set({ tempMealText: text }),
      clearTempMealText: () => set({ tempMealText: '' }),
    }),
    {
      name: 'diet-app-store',
      partialize: (state) => ({
        // 永続化する項目を選択
        lastSyncTime: state.lastSyncTime,
        currentTab: state.currentTab,
        tempMealText: state.tempMealText,
      }),
    }
  )
);