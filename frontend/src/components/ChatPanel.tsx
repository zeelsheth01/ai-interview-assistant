import { motion } from "framer-motion";

export default function ChatPanel(){

  return(

    <motion.div
      initial={{opacity:0}}
      animate={{opacity:1}}
      className="glass p-6 rounded-xl"
    >

      <h2 className="mb-4 text-lg font-semibold">
        🤖 AI Interview Assistant
      </h2>

      <div className="h-72 overflow-y-auto space-y-4">

        <div className="bg-white/10 p-3 rounded-lg w-fit">
          AI question appears here...
        </div>

      </div>

    </motion.div>
  );
}
