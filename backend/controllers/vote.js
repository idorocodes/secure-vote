import { identityDb, ballotDb } from '../config/db.js';
import crypto from 'crypto';

export const handleVoteSubmit = async (req, res) => {
  const { studentId, electionId, positionId, candidateId } = req.body;

  try {
     
    const { error: ledgerError } = await identityDb
      .from('participation_ledger')
      .insert({ student_id: studentId, election_id: electionId });

    if (ledgerError) {
      if (ledgerError.code === '23505') {
        return res.status(403).json({ error: 'ALREADY_VOTED' });
      }
      throw ledgerError;
    }
 
    
    const voterToken = crypto.randomBytes(16).toString('hex');
 
    const { data: rpcResult, error: ballotError } = await ballotDb.rpc('append_ballot_block', {
      p_election_id: electionId,
      p_position_id: positionId,
      p_candidate_id: candidateId,
      p_voter_token: voterToken
    });

    if (ballotError) throw ballotError;
 
    const currentHash = rpcResult[0]?.v_receipt_hash;

    return res.status(200).json({
      success: true,
      receipt_token: voterToken,
      verification_hash: currentHash
    });

  } catch (err) {
    console.error('Processing Fault:', err);

    
    await identityDb
      .from('participation_ledger')
      .delete()
      .match({ student_id: studentId, election_id: electionId });

    return res.status(500).json({ error: 'Database pipeline transaction failed.' });
  }
};