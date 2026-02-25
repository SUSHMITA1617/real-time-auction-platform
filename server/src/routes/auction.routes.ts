import { Router } from "express";
import {
  createAuction,
  getOngoingAuctions,
  getUpcomingAuctions,
  getCompletedAuctions,
  getAuctionById,
} from "../controllers/auction.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

//for Admin create
router.post("/", authenticate, createAuction);

//for Public fetch
router.get("/ongoing", getOngoingAuctions);
router.get("/upcoming", getUpcomingAuctions);
router.get("/completed", getCompletedAuctions);

// Fetch single auction by id
router.get("/:id", getAuctionById);

export default router;