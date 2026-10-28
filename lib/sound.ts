// Status suara (nyala/mati), disimpan di localStorage.
const KEY = "7kaih-muted";
let muted: boolean | null = null;

export function isMuted(): boolean {
  if (muted === null) {
    try {
      muted = localStorage.getItem(KEY) === "1";
    } catch {
      muted = false;
    }
  }
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {}
}
