const KEY = "Selektr.recruiterPassword";

export function getRecruiterPassword(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}

export function setRecruiterPassword(password: string) {
  window.sessionStorage.setItem(KEY, password);
}

export function clearRecruiterPassword() {
  window.sessionStorage.removeItem(KEY);
}
