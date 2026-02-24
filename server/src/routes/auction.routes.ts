import { Router } from "express";
import {
  createAuction,
  getOngoingAuctions,
  getUpcomingAuctions,
  getCompletedAuctions,
} from "../controllers/auction.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

//for Admin create
router.post("/", authenticate, createAuction);

//for Public fetch
router.get("/ongoing", getOngoingAuctions);
router.get("/upcoming", getUpcomingAuctions);
router.get("/completed", getCompletedAuctions);

export default router;