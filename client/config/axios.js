import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/";

const axiosInstance = axios.create({
  baseURL,
});

export default axiosInstance;
