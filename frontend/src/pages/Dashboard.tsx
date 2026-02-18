import AIChat from "../components/AIChat";
import { motion } from "framer-motion";

export default function Dashboard(){

  return(

    <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      className="grid grid-cols-3 gap-6 h-full"
    >

      {/* LEFT PANEL */}

      <div className="col-span-1 bg-white/5 backdrop-blur-xl rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-4">AI Interview Assistant</h2>

        <p className="text-sm opacity-70">
          Upload resume and chat with AI to generate interview questions.
        </p>

      </div>

      {/* CHAT PANEL */}

      <div className="col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">

        <AIChat/>

      </div>

    </motion.div>

  );
}
