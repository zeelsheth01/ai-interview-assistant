import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-interview-assistant-1-atvh.onrender.com",
});

export default api;