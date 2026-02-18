import { motion } from "framer-motion";

export default function UploadDropzone({onFile}:any){

  return(

    <motion.label
      whileHover={{scale:1.02}}
      className="glass p-16 rounded-xl text-center cursor-pointer block"
    >

      Drag & Drop Resume Here

      <input
        hidden
        type="file"
        onChange={(e)=>onFile(e.target.files?.[0])}
      />

    </motion.label>

  );
}
