// device.ts — a random id that identifies THIS browser, kept in localStorage.
// Operators may use at most 2 devices, one at a time; the server recognises a device by this id.
// (Clearing browser data or using a private window creates a new id = a new device.)
const KEY = 'kscwc.deviceId';
let memory: string | null = null;

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // storage blocked: stable for this page load only
    memory ??= newId();
    return memory;
  }
}

// Why the user was signed out (shown once on the login page).
const NOTE_KEY = 'kscwc.signedOutNote';
export function setSignedOutNote(msg: string) {
  try { sessionStorage.setItem(NOTE_KEY, msg); } catch { /* ignore */ }
}
export function peekSignedOutNote(): string | null {
  try { return sessionStorage.getItem(NOTE_KEY); } catch { return null; }
}
export function clearSignedOutNote() {
  try { sessionStorage.removeItem(NOTE_KEY); } catch { /* ignore */ }
}
