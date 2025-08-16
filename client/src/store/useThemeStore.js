import { create } from "zustand" 

export const useThemeStore = create((set) => ({
    theme : localStorage.getItem("VMeetU-theme") || "winter",
    setTheme: (theme) => {
        localStorage.setItem("VMeetU-theme", theme);
        set({ theme });
    }
}))