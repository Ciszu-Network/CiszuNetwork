declare module 'react' {
  export type ReactNode = any;
  export type FC<P = Record<string, unknown>> = (props: P) => any;
  export type ReactElement = any;
  export type CSSProperties = any;
  export type RefObject<T> = any;
  export type ButtonHTMLAttributes<T> = any;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useContext<T>(context: any): T;
  const React: any;
  export default React;
}

declare module 'react-dom' {
  const ReactDom: any;
  export default ReactDom;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}

declare module 'next' {
  export type Metadata = any;
  export type NextConfig = any;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): any;
  export function useParams(): any;
  export function useSearchParams(): any;
}

declare module 'lucide-react' {
  export const Play: any;
  export const Square: any;
  export const Menu: any;
  export const User: any;
  export const ChevronDown: any;
  export const Info: any;
  export const Trophy: any;
  export const BarChart3: any;
  export const History: any;
  export const Users: any;
  export const HelpCircle: any;
  export const FileText: any;
  export const Mail: any;
  export const Headphones: any;
  export const Zap: any;
  export const ChevronUp: any;
  export const ArrowRight: any;
  export const WaveSquare: any;
  export const Keyboard: any;
  export const Earth: any;
  export const Bullseye: any;
  export const MessageSquare: any;
  export const Twitter: any;
  export const Github: any;
  export const Youtube: any;
  export const Instagram: any;
  export const Facebook: any;
  export const ArrowUp: any;
  export const ArrowDown: any;
  export const Phone: any;
  export const Bolt: any;
  export const Medal: any;
  export const Music: any;
  export const Target: any;
  export const LifeBuoy: any;
  export const MousePointer2: any;
  export const Monitor: any;
  export const Wifi: any;
  export const LogOut: any;
  export const Star: any;
  export const Calendar: any;
  export const Gamepad2: any;
  export const Fire: any;
  export const Flame: any;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'zustand' {
  export function create<T>(initializer: any): any;
}

declare module '@supabase/supabase-js' {
  export function createClient(url: string, key: string): any;
  export type Session = any;
  export type AuthChangeEvent = any;
}

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
