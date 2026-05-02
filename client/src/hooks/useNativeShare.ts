export function useNativeShare() {
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const share = async (data: { title?: string; text?: string; url?: string }) => {
    if (canShare) {
      try {
        await navigator.share(data);
        return true;
      } catch (e: any) {
        if (e?.name !== "AbortError") console.error("Share failed:", e);
        return false;
      }
    } else {
      try {
        await navigator.clipboard.writeText(data.url || data.text || "");
        return true;
      } catch {
        return false;
      }
    }
  };

  const shareLocation = async (lat: number, lng: number, name?: string) => {
    const url = `https://maps.google.com/?q=${lat},${lng}`;
    return share({
      title: "My location — Kumbh360",
      text: name ? `I'm at ${name}` : "My current location",
      url,
    });
  };

  return { canShare, share, shareLocation };
}
