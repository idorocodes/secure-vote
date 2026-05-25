import homePath from "../controllers/home.js";

import express from "express"
import login from "../controllers/login.js";

import createUser from "../utils/createUser.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { createElection, getActiveElections } from "../controllers/election.js";
import { handleVoteSubmit } from "../controllers/vote.js";


const router = express.Router();

router.get("/api/v1/", homePath);
router.post("/api/v1/login",login);
router.post("/api/v1/create",createUser)
router.post("/api/v1/elections/vote/submit",authenticateUser,handleVoteSubmit)
router.post("/api/v1/elections/create",authenticateUser,createElection);
router.get("/api/v1/elections/active", authenticateUser,getActiveElections);


export default router;
