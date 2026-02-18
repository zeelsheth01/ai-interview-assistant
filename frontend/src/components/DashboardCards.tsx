import { motion } from "framer-motion";

export default function DashboardCards(){

  const Card=({title}:any)=>(

    <motion.div
      whileHover={{scale:1.04}}
      className="glass p-6 rounded-xl premium-hover"
    >
      <h3 className="text-sm text-gray-400">{title}</h3>
      <p className="text-3xl font-bold mt-2">0</p>
    </motion.div>

  );

  return(

    <div className="grid grid-cols-3 gap-6">

      <Card title="Total Resumes"/>
      <Card title="AI Interviews"/>
      <Card title="Skill Score"/>

    </div>
  );
}
