import { useIsMobile } from "@/hooks/use-mobile";

export function useDevice() {
  const isMobile = useIsMobile();

  return {
    isMobile,
    isDesktop: !isMobile,
  };
}
