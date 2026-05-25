import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Fixed: Added missing router hook for redirection



const FloatingBlock = ({ style, value }) => (
  <div className="absolute rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 font-mono text-xs text-emerald-400/30 select-none pointer-events-none" style={style}>
    #{value}
  </div>
);

export default function Login() {
  const navigate = useNavigate(); // Initialize the navigator
  const [matric, setMatric] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearInterval(t);
  }, []);


  const baseUrl = "https://secure-vote-2mtn.onrender.com";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!matric.trim()) { setError("Please enter your matric number."); return; }
    if (!password) { setError("Please enter your password."); return; }
    
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          matric_number: matric.trim(), 
          password: password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid matric number or password.");
      }

      // Check all common payload shapes to find where the token string lives
      const extractedToken = data.token || data.accessToken || (data.data && data.data.token);

      if (extractedToken) {
        localStorage.setItem("voter_session_token", extractedToken);
        navigate("/dashboard");
      } else {
        // Log the complete keys back to help narrow down what keys the backend object sent
        console.log("Unexpected Backend Payload Structure:", data);
        throw new Error(`Token key missing. Received object keys: [${Object.keys(data).join(", ")}]`);
      }

    } catch (err) {
      console.error("Login verification barrier crash:", err);
      setError(err.message || "Connection refused by auth node cluster.");
    } finally {
      setLoading(false);
    }
  };

  const floaters = [
    { top: "8%", left: "3%", val: "a3f9bc12", delay: "0s" },
    { top: "18%", right: "4%", val: "d7e2f841", delay: "0.7s" },
    { top: "35%", left: "1%", val: "9c4b1a37", delay: "1.2s" },
    { top: "60%", right: "2%", val: "f2e81c09", delay: "0.4s" },
    { top: "75%", left: "4%", val: "3b7d4e92", delay: "1.8s" },
    { top: "88%", right: "5%", val: "c51a8f3d", delay: "0.9s" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .float { animation: float 5s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #34d399, #10b981, #059669, #34d399);
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .fade-up { animation: fade-up 0.7s ease forwards; }
        .shake { animation: shake 0.4s ease; }
        .card-glow { box-shadow: 0 0 60px rgba(52,211,153,0.07), 0 0 0 0.5px rgba(52,211,153,0.12); }
        .input-focus { transition: border-color 0.2s, box-shadow 0.2s; }
        .input-focus:focus { outline: none; border-color: rgba(52,211,153,0.5); box-shadow: 0 0 0 3px rgba(52,211,153,0.08); }
        .ring-spin { animation: spin-slow 12s linear infinite; }
      `}</style>

      {/* Grid background */}
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 65%)" }} />

      {/* Floating ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/5 ring-spin pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-emerald-500/5 pointer-events-none" style={{ animation: "spin-slow 20s linear infinite reverse" }} />

      {/* Floating hash blocks */}
      {floaters.map((f, i) => (
        <FloatingBlock key={i} value={f.val}
          style={{ top: f.top, left: f.left, right: f.right, animation: `float ${4.5 + i * 0.4}s ease-in-out infinite`, animationDelay: f.delay }} />
      ))}

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-4"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/60 p-8 card-glow">

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-center text-white mb-1">Login</h2>
            <p className="text-slate-400 text-center text-sm leading-relaxed">Enter your credentials to access the secure ballot. Your identity is verified then permanently separated from your vote.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Matric Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Matric Number
              </label>
              <div className={`relative rounded-xl border transition-all duration-200 ${focused === "matric" ? "border-emerald-500/50 shadow-[0_0_0_3px_rgba(52,211,153,0.08)]" : "border-slate-700/80"} bg-slate-800/60`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={matric}
                  onChange={e => setMatric(e.target.value)}
                  onFocus={() => setFocused("matric")}
                  onBlur={() => setFocused("")}
                  placeholder="e.g. CSC/2021/001"
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-white placeholder-slate-600 text-sm rounded-xl focus:outline-none"
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot password?</a>
              </div>
              <div className={`relative rounded-xl border transition-all duration-200 ${focused === "password" ? "border-emerald-500/50 shadow-[0_0_0_3px_rgba(52,211,153,0.08)]" : "border-slate-700/80"} bg-slate-800/60`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="Enter your password"
                  className="w-full bg-transparent pl-11 pr-12 py-3.5 text-white placeholder-slate-600 text-sm rounded-xl focus:outline-none"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5">
                  {showPass ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 shake">
                <span className="text-red-400 text-base flex-shrink-0 mt-0.5">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={loading}
              className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2.5 text-sm mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying identity...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Authenticate & Access Ballot
                </>
              )}
            </button>
          </form>

        
          
        </div>

      

        {/* Help link */}
        <p className="text-center text-slate-600 text-xs mt-4">
          Having trouble? Contact{" "}
          <a href="#" className="text-emerald-500 hover:text-emerald-400 transition-colors">Student Affairs</a>
        </p>
      </div>
    </div>
  );
}