export function isHandheld(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const noHover = window.matchMedia?.("(hover: none)").matches ?? false;
  return coarse && noHover && navigator.maxTouchPoints > 0;
}
