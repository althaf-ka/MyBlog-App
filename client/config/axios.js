import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/", // the base URL of your backend API
});

export default axiosInstance;
