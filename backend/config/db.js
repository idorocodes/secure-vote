import { createClient } from "@supabase/supabase-js/dist/index.cjs";
import dotenv from 'dotenv';


dotenv.config();

const identityUrl = process.env.SUPABASE_IDENTITY_URL;
const identityKey = process.env.SUPABASE_IDENTITY_SERVICE_ROLE;

const ballotUrl = process.env.SUPABASE_BALLOT_URL;
const ballotKey = process.env.SUPABASE_BALLOT_SERVICE_ROLE;


if (!identityUrl || !identityKey || !ballotUrl || !ballotKey) {
  throw new Error(
    'CRITICAL CONFIG ERROR: Missing Supabase environment variables. ' +
    'Check your .env file for both IDENTITY and BALLOT project credentials.'
  );
}


 
export const identityDb = createClient(identityUrl, identityKey);
 
export const ballotDb = createClient(ballotUrl, ballotKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});