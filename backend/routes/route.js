import homePath from "../controllers/home.js";

import express from "express"
import login from "../controllers/login.js";


const router = express.Router();

router.get("/api/v1/", homePath);
router.post("/api/v1/login",login)

export default router;
