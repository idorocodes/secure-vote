import { identityDb, ballotDb } from '../config/db.js';
import crypto from 'crypto';

export const handleVoteSubmit = async (req, res) => {
  const studentId = req.user.sub;
 
  const { electionId, votes } = req.body;
 
  if (!electionId || !Array.isArray(votes) || votes.length === 0) {
    return res.status(400).json({ error: 'Malformed payload structure. Votes array required.' });
  }

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
    let ultimateReceiptHash = null;

  
    for (const vote of votes) {
      const { data: rpcResult, error: ballotError } = await ballotDb.rpc('append_ballot_block', {
        p_election_id: electionId,
        p_position_id: vote.position_id,
        p_candidate_id: vote.candidate_id,
        p_voter_token: voterToken
      });

      if (ballotError) {
        throw ballotError; 
      }

      if (rpcResult && rpcResult[0]?.v_receipt_hash) {
        ultimateReceiptHash = rpcResult[0].v_receipt_hash;
      }
    }

      return res.status(200).json({
      success: true,
      receipt_token: voterToken,
      verification_hash: ultimateReceiptHash
    });

  } catch (err) {
    console.error('Processing Fault - Executing Transaction Rollback:', err);

    await identityDb
      .from('participation_ledger')
      .delete()
      .match({ student_id: studentId, election_id: electionId });

    return res.status(500).json({ error: 'Database pipeline transaction failed. Votes unrecorded.' });
  }
};