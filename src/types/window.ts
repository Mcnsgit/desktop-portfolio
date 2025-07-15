export interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  content: React.ReactNode;
  x: number;
  y: number;
  w: number;
  h: number;
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}