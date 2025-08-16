import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:1410/api" : import.meta.env.VITE_API_BASE_URL;
console.log("Axios BASE_URL:", BASE_URL); // Debug log

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});