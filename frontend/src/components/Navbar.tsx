import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{
      padding:20,
      background:"#111",
      color:"white",
      display:"flex",
      gap:20
    }}>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/upload">Upload Resume</Link>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
