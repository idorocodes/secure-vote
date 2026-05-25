import { useState, useEffect, useRef } from "react";

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

const AnimatedCounter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const HashAnimation = () => {
  const chars = "0123456789abcdef";
  const [hash, setHash] = useState("a3f9bc12e847d056c1f2a89b3d7e4c60");
  useEffect(() => {
    const iv = setInterval(() => {
      setHash(Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * 16)]).join(""));
    }, 80);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="font-mono text-xs text-emerald-400 tracking-widest opacity-60 select-none">
      {hash}
    </span>
  );
};

const FlowStep = ({ step, label, sub, icon, delay, color }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="flex flex-col items-center gap-2" style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms` }}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color} shadow-lg`}>{icon}</div>
      <div className="text-center">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Step {step}</div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5 max-w-[110px]">{sub}</div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all duration-300 group"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ${delay}ms, transform 0.7s ${delay}ms` }}>
      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mb-4 group-hover:bg-emerald-500/20 transition-colors">{icon}</div>
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

const CompareRow = ({ flaw, solution, delay }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="grid grid-cols-2 gap-4"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-20px)", transition: `opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms` }}>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex gap-3">
        <span className="text-red-400 text-base mt-0.5 flex-shrink-0">✕</span>
        <p className="text-slate-300 text-sm leading-relaxed">{flaw}</p>
      </div>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3">
        <span className="text-emerald-400 text-base mt-0.5 flex-shrink-0">✓</span>
        <p className="text-slate-300 text-sm leading-relaxed">{solution}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroRef, heroIn] = useInView(0.05);
  const [archRef, archIn] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Features", "Architecture", "Security", "Compare"];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(1.6);opacity:0} }
        @keyframes slide-in { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .float { animation: float 5s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #34d399, #10b981, #059669, #34d399);
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .scan-line::after {
          content:''; position:absolute; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent);
          animation: scan 3s linear infinite;
        }
        .cursor::after { content:'|'; animation: blink 1s step-end infinite; }
        .glow-emerald { box-shadow: 0 0 40px rgba(52,211,153,0.15); }
        .chain-line { background: linear-gradient(to bottom, rgba(52,211,153,0.5), rgba(52,211,153,0.1)); }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 40 ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">SV</div>
            <span className="font-semibold text-white tracking-tight text-lg">Secure<span className="text-emerald-400">Vote</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <a  href="/login" className="hidden md:inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20">
            Get Started 
          </a>
          
          <button className="md:hidden text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col gap-4">
            {navLinks.map(l => <a key={l} href={`#${l.toLowerCase()}`} className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>{l}</a>)}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background grid */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)" }} />

        {/* Floating hash blocks */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-emerald-400/40 font-mono text-xs select-none"
            style={{ top: `${15 + i * 12}%`, left: i % 2 === 0 ? `${5 + i * 2}%` : "auto", right: i % 2 !== 0 ? `${5 + i * 2}%` : "auto", animation: `float ${4 + i * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}>
            {Math.random().toString(16).slice(2, 10)}
          </div>
        ))}

        <div ref={heroRef} className="relative z-10 max-w-4xl mx-auto mt-10 px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8"
            style={{ opacity: heroIn ? 1 : 0, transition: "opacity 0.8s 100ms" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-emerald-400 text-xs font-medium tracking-wide uppercase">Cryptographically Verifiable Elections</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.8s 200ms, transform 0.8s 200ms" }}>
            University Voting<br />
            <span className="gradient-text">Built to be Unhackable</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s 350ms, transform 0.8s 350ms" }}>
            Secure-Vote replaces blind trust with mathematical proof. Dual-database isolation, cryptographic hash chains, and public auditable ledgers — so every vote counts and every tally is verifiable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ opacity: heroIn ? 1 : 0, transition: "opacity 0.8s 500ms" }}>
            <a href="#features" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/25 text-base">
              Explore the Platform →
            </a>
            <a href="#architecture" className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-2xl transition-all duration-200 text-base">
              See Architecture
            </a>
          </div>

          {/* Live hash ticker */}
          <div className="mt-16 inline-flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl px-5 py-3"
            style={{ opacity: heroIn ? 1 : 0, transition: "opacity 1s 700ms" }}>
            <span className="text-slate-500 text-xs font-medium">Latest block hash</span>
            <HashAnimation />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Votes Secured", value: 24800, suffix: "+" },
            { label: "Hash Verifications", value: 99, suffix: ".9%" },
            { label: "Tamper Attempts Blocked", value: 100, suffix: "%" },
            { label: "Universities Supported", value: 12, suffix: "" },
          ].map(({ label, value, suffix }, i) => {
            const [r, iv] = useInView();
            return (
              <div key={label} ref={r} style={{ opacity: iv ? 1 : 0, transform: iv ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ${i * 100}ms, transform 0.6s ${i * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-bold text-emerald-400">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div className="text-slate-500 text-sm mt-1">{label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Core Features</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Security without compromise</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Every architectural decision prioritizes both privacy and verifiability — something no traditional campus portal achieves.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard delay={0} icon="🔗" title="Cryptographic Hash Chain" desc="Every ballot is linked to the previous one via SHA-256. Altering a single vote invalidates every block that follows — mathematically impossible to tamper undetected." />
          <FeatureCard delay={100} icon="🏛️" title="Dual-Database Isolation" desc="Your identity and your ballot live in completely separate databases with zero shared identifiers. No SQL JOIN can ever link your student ID to your vote." />
          <FeatureCard delay={200} icon="🧾" title="Anonymous Receipt Token" desc="After voting, you receive a hashed receipt token. Post-election, look up your token in the public ledger to confirm your ballot was counted, anonymously." />
          <FeatureCard delay={300} icon="🛡️" title="Zero Trust Architecture" desc="The backend acts as a blind broker. It verifies your eligibility, drops your identity from memory, then processes only your candidate choice — never both together." />
          <FeatureCard delay={400} icon="🔍" title="Public Auditable Ledger" desc="After every election, the full cryptographic chain is published. Any voter, auditor, or third party can independently verify the integrity of every ballot." />
          <FeatureCard delay={500} icon="⚡" title="Standard Infrastructure" desc="No blockchain nodes or exotic tech required. Decentralized-grade integrity using standard relational databases — deployable on existing university infrastructure." />
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 bg-slate-900/40 border-y border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Data Flow</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How a vote travels through the system</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A strict separation of concerns enforced at the architectural level — not just policy.</p>
          </div>

          {/* Flow diagram */}
          <div ref={archRef} className="relative">
            {/* Student entry */}
            <div className="flex justify-center mb-8" style={{ opacity: archIn ? 1 : 0, transition: "opacity 0.6s 100ms" }}>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl px-8 py-4 text-center glow-emerald">
                <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1">Entry Point</div>
                <div className="text-white font-semibold text-lg">🎓 Student Login</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-6" style={{ opacity: archIn ? 1 : 0, transition: "opacity 0.6s 200ms" }}>
              <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-400 to-emerald-400/30" />
            </div>

            {/* DB 1 */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 mb-2" style={{ opacity: archIn ? 1 : 0, transform: archIn ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.7s 300ms, transform 0.7s 300ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">🗄️</div>
                <div>
                  <div className="text-blue-300 font-bold text-sm uppercase tracking-wider">Database 1</div>
                  <div className="text-white font-semibold">Identity & Participation Ledger</div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {["Verify student registration & eligibility", "Check if already voted — block if true", "Mark student as 'Voted'"].map((s, i) => (
                  <div key={i} className="bg-slate-900/60 rounded-xl px-4 py-3 flex gap-2.5">
                    <span className="text-blue-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                    <span className="text-slate-300 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory drop banner */}
            <div className="flex items-center gap-4 my-4 px-4" style={{ opacity: archIn ? 1 : 0, transition: "opacity 0.7s 450ms" }}>
              <div className="flex-1 h-px bg-slate-700" />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-xs font-semibold flex items-center gap-2 whitespace-nowrap">
                <span>⚠</span> Backend drops Student ID from memory — passes only candidate choice
              </div>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* DB 2 */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-8" style={{ opacity: archIn ? 1 : 0, transform: archIn ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.7s 550ms, transform 0.7s 550ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg">🔐</div>
                <div>
                  <div className="text-emerald-300 font-bold text-sm uppercase tracking-wider">Database 2</div>
                  <div className="text-white font-semibold">Cryptographic Ballot Box</div>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  "Lock table tail & fetch latest hash",
                  "Generate random voter receipt token",
                  "Compute SHA-256(Choice + Token + Prev Hash)",
                  "Commit new block to the hash chain",
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900/60 rounded-xl px-4 py-3 flex gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                    <span className="text-slate-300 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center mb-6" style={{ opacity: archIn ? 1 : 0, transition: "opacity 0.6s 700ms" }}>
              <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-400/40 to-emerald-400" />
            </div>

            {/* Receipt */}
            <div className="flex justify-center" style={{ opacity: archIn ? 1 : 0, transition: "opacity 0.7s 800ms" }}>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-8 py-4 text-center max-w-sm">
                <div className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-1">Output</div>
                <div className="text-white font-semibold text-base mb-1">🧾 Hashed Receipt Issued</div>
                <div className="text-slate-400 text-xs">Voter can verify their ballot anonymously in the public ledger</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compare */}
      <section id="compare" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Side by Side</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Old systems vs. Secure-Vote</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Every flaw in traditional campus voting has a direct, architectural solution.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-center">
            <span className="text-red-400 font-semibold text-sm">❌ Traditional Systems</span>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-center">
            <span className="text-emerald-400 font-semibold text-sm">✓ Secure-Vote</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <CompareRow delay={0}
            flaw="Admins or hackers can alter database tallies mid-election without any trace."
            solution="Tamper-evident hash chain: altering any past vote breaks the entire cryptographic chain." />
          <CompareRow delay={100}
            flaw="Students have no way to verify if their specific vote was actually counted."
            solution="Anonymous receipt token lets every voter locate their ballot in the public post-election ledger." />
          <CompareRow delay={200}
            flaw="SQL JOIN queries can map student IDs to candidate choices, exposing voter privacy."
            solution="Dual-database isolation: zero shared identifiers between identity and ballot databases." />
        </div>
      </section>

      {/* Security section */}
      <section id="security" className="py-24 bg-slate-900/40 border-y border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">The Math Behind It</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">SHA-256 hash chains make tampering detectable — always</h2>
              <p className="text-slate-400 leading-relaxed mb-6">When a new ballot is cast, the system computes a new hash by combining the voter's candidate choice, a unique random token, and the previous block's hash. Any modification to any historical record produces a completely different hash — instantly invalidating every subsequent block.</p>
              <p className="text-slate-400 leading-relaxed">This is mathematically equivalent to blockchain integrity — without the overhead of distributed nodes or smart contracts.</p>
            </div>
            {/* Hash chain visual */}
            <div className="relative scan-line overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 p-6">
              <div className="text-slate-500 text-xs font-mono mb-4">// Hash Chain Visualization</div>
              {[
                { block: "001", hash: "a3f9bc12", prev: "0000000", vote: "Candidate A" },
                { block: "002", hash: "d7e2f841", prev: "a3f9bc12", vote: "Candidate B" },
                { block: "003", hash: "9c4b1a37", prev: "d7e2f841", vote: "Candidate A" },
              ].map(({ block, hash, prev, vote }, i) => (
                <div key={block} className="relative">
                  <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 mb-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs font-mono">Block #{block}</span>
                      <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono">{hash}…</span>
                    </div>
                    <div className="text-slate-300 text-xs font-mono">vote: <span className="text-white">{vote}</span></div>
                    <div className="text-slate-500 text-xs font-mono">prev: {prev}…</div>
                  </div>
                  {i < 2 && <div className="w-px h-3 bg-emerald-400/30 ml-4 mb-1" />}
                </div>
              ))}
              <div className="mt-3 text-center text-emerald-400/60 text-xs font-mono">← chain continues →</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(52,211,153,0.06) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div className="float">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl mx-auto mb-8">🗳️</div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">Ready to run a verifiable election?</h2>
          <p className="text-slate-400 text-lg mb-10">Deploy Secure-Vote on your university's existing infrastructure and give every student the power to verify their own vote.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">SV</div>
            <span className="font-semibold text-slate-400 text-sm">Secure<span className="text-emerald-400">Vote</span></span>
          </div>
          <p className="text-slate-600 text-sm">Built for trust. Verified by math. Designed for universities.</p>
          <div className="flex gap-6">
            {["Privacy", "Docs", "GitHub"].map(l => (
              <a key={l} href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}