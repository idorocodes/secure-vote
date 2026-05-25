import { identityDb, ballotDb } from "../config/db.js";

  
export const createElection = async (req, res) => {
  const { title, description, positions } = req.body;
  
  if (!title || !positions || positions.length === 0) {
    return res.status(400).json({ success: false, message: "Missing required election parameters." });
  }

  try {
 
    const { data: idElection, error: idElecErr } = await identityDb
      .from("elections")
      .insert({ title, description, is_active: true })
      .select()
      .single();

    if (idElecErr) throw idElecErr;
 
    const { error: balElecErr } = await ballotDb
      .from("elections")
      .insert({ election_id: idElection.election_id, title, description, is_active: true });

    if (balElecErr) throw balElecErr;

 
    for (const pos of positions) {
   
      const { data: idPos, error: idPosErr } = await identityDb
        .from("positions")
        .insert({ election_id: idElection.election_id, title: pos.title })
        .select()
        .single();

      if (idPosErr) throw idPosErr;

 
      const { data: balPos, error: balPosErr } = await ballotDb
        .from("positions")
        .insert({ position_id: idPos.position_id, election_id: idElection.election_id, title: pos.title })
        .select()
        .single();

      if (balPosErr) throw balPosErr;

 
      if (pos.candidates && pos.candidates.length > 0) {
        for (const cand of pos.candidates) {
          const { data: idCand, error: idCandErr } = await identityDb
            .from("candidates")
            .insert({ position_id: idPos.position_id, full_name: cand.full_name, faculty: cand.faculty, manifesto: cand.manifesto })
            .select()
            .single();

          if (idCandErr) throw idCandErr;

          const { error: balCandErr } = await ballotDb
            .from("candidates")
            .insert({ candidate_id: idCand.candidate_id, position_id: idPos.position_id, full_name: cand.full_name, faculty: cand.faculty, manifesto: cand.manifesto });

          if (balCandErr) throw balCandErr;
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Election ecosystem completely provisioned across both clusters.",
      electionId: idElection.election_id
    });

  } catch (error) {
    console.error("Sync Error during creation:", error);
    return res.status(500).json({ success: false, error: "Critical multi-cluster sync fault." });
  }
};

 
export const getActiveElections = async (req, res) => {
  try {
    const { data: elections, error } = await identityDb
      .from("elections")
      .select(`
        election_id,
        title,
        description,
        positions (
          position_id,
          title,
          candidates (
            candidate_id,
            full_name,
            faculty,
            manifesto
          )
        )
      `)
      .eq("is_active", true);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: elections
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve election layouts." });
  }
};