import axios from "axios";

console.log("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL)

export const api = axios.create({

  baseURL: process.env.NEXT_PUBLIC_API_URL,

  withCredentials: true,

});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Unable to connect to the server."));
    }

    return Promise.reject(error);
  }
);
