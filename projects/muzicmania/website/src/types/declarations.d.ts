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
  export function notFound(): never;
  export function redirect(url: string): never;
  export function permanentRedirect(url: string): never;
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