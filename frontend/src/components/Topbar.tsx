export default function Topbar(){

  return(

    <div className="flex justify-between items-center mb-6">

      <h2 className="text-2xl font-semibold text-white">
        Dashboard
      </h2>

      <button
        className="bg-red-500 px-4 py-2 rounded"
        onClick={()=>{
          localStorage.removeItem("loggedIn");
          window.location.href="/";
        }}
      >
        Logout
      </button>

    </div>

  );
}
