import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [votedReceipt, setVotedReceipt] = useState(null);
  const [userVotedTrack, setUserVotedTrack] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [voterId, setVoterId] = useState("Loading...");


  const [activeElection, setActiveElection] = useState(null); 
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedBallotChoices, setSelectedBallotChoices] = useState({}); 

  const token = localStorage.getItem("voter_session_token");
  const baseUrl = "https://secure-vote-2mtn.onrender.com";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoterId(payload.mat_no || "Unknown");
    } catch (e) {
      console.error("Failed parsing voter session layout:", e);
      setVoterId("Error");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchElectionEcosystem = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/v1/elections/active`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const payload = await response.json();
        if (payload.success) {
          setElections(payload.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard sync tree:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchElectionEcosystem();
    }
  }, [token]);

  // Initiate Multi-Step Ballot Wizard Flow
  const startVotingFlow = (election) => {
    setActiveElection(election);
    setCurrentStepIndex(0);
    setSelectedBallotChoices({}); // Wipe clean any old workspace states
  };

  // Close Multi-Step Flow safely
  const cancelVotingFlow = () => {
    setActiveElection(null);
    setCurrentStepIndex(0);
    setSelectedBallotChoices({});
  };

  // Update selection map when user selects a candidate card
  const handleSelectCandidate = (positionId, candidateId) => {
    setSelectedBallotChoices((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  // Final Action Trigger: Transmit Consolidated Payload Array
  const handleSubmitAggregateBallot = async () => {
    if (!activeElection) return;
    
    // Format package into the expected backend format: { electionId, votes: [{position_id, candidate_id}] }
    const formattedVotes = Object.entries(selectedBallotChoices).map(([posId, candId]) => ({
      position_id: parseInt(posId),
      candidate_id: candId
    }));

    setSubmittingVote(true);
    try {
      const response = await fetch(`${baseUrl}/api/v1/elections/vote/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          electionId: activeElection.election_id, 
          votes: formattedVotes 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "ALREADY_VOTED" || response.status === 403) {
          alert("Security Error: You have already participated in this election ballot tracking pool.");
          setUserVotedTrack(prev => ({ ...prev, [activeElection.election_id]: true }));
          cancelVotingFlow();
          return;
        }
        throw new Error(data.message || data.error || "Submission rejected.");
      }

      setVotedReceipt({
        token: data.receipt_token || "GEN_REC_UNAVAILABLE",
        hash: data.verification_hash || "GEN_HASH_UNAVAILABLE"
      });

      // Mark entire election layout as completed locally
      setUserVotedTrack(prev => ({ ...prev, [activeElection.election_id]: true }));
      cancelVotingFlow();

    } catch (err) {
      alert(`Transaction failure: ${err.message}`);
    } finally {
      setSubmittingVote(false);
    }
  };

  const filteredElections = elections.filter(e =>
    (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-sm">
        <div className="w-8 h-8 rounded-lg border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
        Synchronizing with Ledger clusters...
      </div>
    );
  }

  // Pre-calculate variables if wizard overlay is opened
  const positionsArray = activeElection?.positions || [];
  const currentPosition = positionsArray[currentStepIndex];
  const choiceForCurrentPosition = currentPosition ? selectedBallotChoices[currentPosition.position_id] : null;
  const isLastStep = currentStepIndex === positionsArray.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .glow-emerald-card:hover { box-shadow: 0 0 30px rgba(52,211,153,0.04); }
      `}</style>

      {/* Mini Top Bar Nav */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">SV</div>
            <span className="font-semibold text-white tracking-tight text-lg">Secure<span className="text-emerald-400">Vote</span> <span className="text-xs bg-slate-800 text-slate-400 font-normal px-2 py-0.5 rounded-md ml-2">Student Console</span></span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400 font-mono bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Voter ID: <span className="text-white font-bold">{voterId}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Active Election Ecosystems</h1>
            <p className="text-slate-400 text-sm">Select an election below to open the secure multi-step ballot form. All required positions must be populated before signing submission tokens.</p>
          </div>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search running ballots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
            />
          </div>
        </div>

        {filteredElections.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
            <span className="text-3xl block mb-3">🔍</span>
            <p className="text-slate-400 font-mono text-xs">No active elections match your query filters.</p>
          </div>
        )}

        {/* Elections Grid Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredElections.map((election) => {
            const alreadyVoted = userVotedTrack[election.election_id];
            return (
              <div key={election.election_id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between transition-all glow-emerald-card">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${
                      alreadyVoted 
                        ? "bg-slate-800 text-slate-500 border-slate-700" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {alreadyVoted ? "SUBMITTED" : "LIVE RUNNING"}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {election.positions?.length || 0} Open Positions
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight mb-2">{election.title}</h2>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3">{election.description}</p>
                </div>

                <button
                  disabled={alreadyVoted}
                  onClick={() => startVotingFlow(election)}
                  className={`w-full font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                    alreadyVoted
                      ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/5"
                  }`}
                >
                  {alreadyVoted ? "✓ Participation Recorded" : "Open Guided Voting Form"}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* 📑 GUIDED MULTI-STEP WIZARD OVERLAY MODAL */}
      {activeElection && currentPosition && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Track Panel */}
            <div className="bg-slate-950 border-b border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  Step {currentStepIndex + 1} of {positionsArray.length}
                </span>
                <h3 className="text-lg font-bold text-white truncate max-w-md">{activeElection.title}</h3>
              </div>
              <button 
                onClick={cancelVotingFlow}
                className="text-xs font-mono text-slate-500 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/50 px-3 py-1.5 rounded-lg transition-all"
              >
                Exit Ballot
              </button>
            </div>

            {/* Position Information Header */}
            <div className="p-6 bg-slate-900/50 border-b border-slate-800/50 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Active Office Voting For:</span>
              <h4 className="text-xl font-bold text-white flex items-center gap-2">👔 {currentPosition.title}</h4>
            </div>

            {/* Candidates Card Options Pool - Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 grid sm:grid-cols-2 gap-4 bg-slate-950/20">
              {currentPosition.candidates?.map((candidate) => {
                const isSelected = choiceForCurrentPosition === candidate.candidate_id;
                return (
                  <div
                    key={candidate.candidate_id}
                    onClick={() => handleSelectCandidate(currentPosition.position_id, candidate.candidate_id)}
                    className={`rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 group relative ${
                      isSelected 
                        ? "border-emerald-500 bg-emerald-500/[0.02] shadow-xl shadow-emerald-500/[0.02]" 
                        : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                    <div>
                      <div className="pr-6 mb-3">
                        <h5 className="text-white font-bold text-base tracking-tight">{candidate.full_name}</h5>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded inline-block mt-1">
                          Faculty: {candidate.faculty}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed italic">
                        "{candidate.manifesto || "No manifesto uploaded by candidate."}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Navigation Cluster */}
            <div className="bg-slate-950 border-t border-slate-800 p-6 flex items-center justify-between gap-4">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex(prev => prev - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-semibold font-mono text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Back
              </button>

              {!isLastStep ? (
                <button
                  disabled={!choiceForCurrentPosition}
                  onClick={() => setCurrentStepIndex(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 text-xs font-bold font-mono tracking-wide flex items-center gap-1 transition-all"
                >
                  Next Office →
                </button>
              ) : (
                <button
                  disabled={!choiceForCurrentPosition || submittingVote}
                  onClick={handleSubmitAggregateBallot}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 text-xs font-bold font-mono tracking-wide flex items-center gap-2 transition-all"
                >
                  {submittingVote ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      Signing Hash Ledger...
                    </>
                  ) : (
                    "🔒 Submit Aggregate Ballot"
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🔐 CRYPTOGRAPHIC RECEIPT BLOCK DIALOG MODAL POPUP */}
      {votedReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">
              🛡️
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Ballot Cryptographically Sealed</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Your identity has been dropped from memory context. The parameters below represent your untamperable proof receipt generated on the multi-cluster relational blockchain. Store these values somewhere safe to verify your vote status on the public board post-closing.
            </p>

            <div className="space-y-4 font-mono text-xs mb-6">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 block mb-1 uppercase tracking-widest text-[9px]">ANONYMOUS RECEIPT TOKEN</span>
                <span className="text-emerald-400 select-all break-all">{votedReceipt.token}</span>
              </div>
              
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 block mb-1 uppercase tracking-widest text-[9px]">BLOCK DEFI CHAIN HASH (SHA-256)</span>
                <span className="text-white select-all break-all">{votedReceipt.hash}</span>
              </div>
            </div>

            <button
              onClick={() => setVotedReceipt(null)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all duration-200 text-sm"
            >
              Clear Workspace Memory & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}