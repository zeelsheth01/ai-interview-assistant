import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AIChat from "../components/AIChat";
import { motion } from "framer-motion";
import api from "../api/api";

export default function Dashboard() {

  // ✅ must be inside component
  const location = useLocation();

  const resumeId = location.state?.resumeId;

  const [questions, setQuestions] = useState<string[]>([]);

  // 🔥 Fetch questions automatically after redirect
  useEffect(() => {

    if (!resumeId) return;

    const fetchQuestions = async () => {

      try {

        const res = await api.get(`/resume/${resumeId}`);

        // assuming backend returns:
        // { questions: [] }

        setQuestions(res.data.questions || []);

      } catch (err) {

        console.log("FETCH QUESTION ERROR:", err);

      }
    };

    fetchQuestions();

  }, [resumeId]);

  return (

    <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      className="grid grid-cols-3 gap-6 h-full"
    >

      {/* LEFT PANEL */}

      <div className="col-span-1 bg-white/5 backdrop-blur-xl rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-4">
          AI Interview Assistant
        </h2>

        <p className="text-sm opacity-70">
          Upload resume and chat with AI to generate interview questions.
        </p>

        {/* 🔥 Show Questions */}

        {questions.length > 0 && (
          <div className="mt-6">

            <h3 className="font-semibold mb-2">
              Generated Questions
            </h3>

            {questions.map((q, i) => (
              <p key={i} className="text-sm mb-2">
                {i + 1}. {q}
              </p>
            ))}

          </div>
        )}

      </div>

      {/* CHAT PANEL */}

      <div className="col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">

        {/* pass questions to chat if needed */}
        <AIChat questions={questions} />

      </div>

    </motion.div>

  );
}