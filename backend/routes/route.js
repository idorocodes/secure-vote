import homePath from "../controllers/home.js";

import express from "express"
import login from "../controllers/login.js";
import voteLogic from "../controllers/vote.js";
import createUser from "../utils/createUser.js";


const router = express.Router();

router.get("/api/v1/", homePath);
router.post("/api/v1/login",login);
router.post("/api/v1/create",createUser)
router.post("/api/v1/vote",voteLogic)

export default router;
