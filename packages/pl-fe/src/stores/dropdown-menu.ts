import { create } from 'zustand';

type State = {
  isOpen: boolean;
  openDropdownMenu: () => void;
  closeDropdownMenu: () => void;
};

const useDropdownMenuStore = create<State>((set) => ({
  isOpen: false,
  openDropdownMenu: () => set({ isOpen: true }),
  closeDropdownMenu: () => set({ isOpen: false }),
}));

export { useDropdownMenuStore };
