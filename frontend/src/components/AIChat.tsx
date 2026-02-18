import { useState } from "react";
import api from "../api/api";

export default function AIChat() {

  const [messages,setMessages]=useState<any[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);

  const sendMessage = async () => {

    if(!input) return;

    const userMessage = { role:"user", content:input };

    setMessages(prev => [...prev,userMessage]);
    setInput("");
    setLoading(true);

    try{

      const res = await api.post("/ai/chat",{
        message: input
      });

      const aiMessage = {
        role:"assistant",
        content: res.data.reply
      };

      setMessages(prev => [...prev, aiMessage]);

    }catch{

      setMessages(prev => [...prev,{
        role:"assistant",
        content:"AI error"
      }]);

    }

    setLoading(false);
  };

  return(

    <div className="flex flex-col h-full">

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto space-y-4 p-6">

        {messages.map((m,i)=>(
          <div key={i}
            className={`p-3 rounded-xl max-w-[70%] ${
              m.role==="user"
                ? "bg-blue-500 ml-auto"
                : "bg-white/10"
            }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="animate-pulse bg-white/10 p-3 rounded-xl w-32">
            AI thinking...
          </div>
        )}

      </div>

      {/* INPUT */}

      <div className="p-4 border-t border-white/10 flex gap-2">

        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Ask AI about your resume..."
          className="flex-1 p-3 rounded-xl bg-white/10 outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 px-6 rounded-xl"
        >
          Send
        </button>

      </div>

    </div>
  );
}
