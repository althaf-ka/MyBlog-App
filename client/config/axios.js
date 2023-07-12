import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // the base URL of your backend API
});

export default axiosInstance;
