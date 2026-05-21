import homePath from "../controllers/home.js";

import express from "express"


const router = express.Router();

router.get("/", homePath);

export default router;
