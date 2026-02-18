import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

export default function Layout({children}:any){

  return(

    <div className="flex min-h-screen relative overflow-hidden">

      {/* floating glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500 blur-[200px] opacity-20 -top-40 -left-40"/>

      <Sidebar/>

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:.4}}
        className="flex-1 p-10 relative z-10"
      >
        {children}
      </motion.div>

    </div>
  );
}
