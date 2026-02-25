import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const localToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const cookieToken =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]
      : null;
  const token = localToken || (cookieToken ? decodeURIComponent(cookieToken) : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
