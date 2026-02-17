const API_URL = "http://127.0.0.1:8000";

export const registerUser = async (email: string, password: string) => {
  const res = await fetch(
    `${API_URL}/auth/register?email=${email}&password=${password}`,
    { method: "POST" }
  );
  return res.json();
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(
    `${API_URL}/auth/login?email=${email}&password=${password}`,
    { method: "POST" }
  );
  return res.json();
};

export const uploadResume = async (file: File) => {

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/resume/upload`, {
    method: "POST",
    body: formData
  });

  return res.json();
};
