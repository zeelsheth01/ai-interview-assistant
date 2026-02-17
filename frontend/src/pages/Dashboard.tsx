import axios from "axios";

export default function Dashboard() {

  const uploadResume = async (e:any) => {

    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://127.0.0.1:8000/resume/upload",
      formData
    );

    console.log(res.data);
    alert("Resume processed!");
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <input type="file" onChange={uploadResume} />
    </div>
  );
}
