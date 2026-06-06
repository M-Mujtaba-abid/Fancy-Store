export const setAuthSession = (role = "user") => {
  if (typeof window === "undefined") return;
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userRole", role);
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isLoggedIn") === "true";
};

export const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userRole");
};
