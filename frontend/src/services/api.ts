import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-interview-assistant-1-atvh.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;