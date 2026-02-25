import { Router } from "express";
import {
  createAuction,
  getOngoingAuctions,
  getUpcomingAuctions,
  getCompletedAuctions,
  getAllAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
} from "../controllers/auction.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

//for Admin create
router.post("/", authenticate, createAuction);

//for Public fetch
router.get("/", getAllAuctions); 
router.get("/ongoing", getOngoingAuctions);
router.get("/upcoming", getUpcomingAuctions);
router.get("/completed", getCompletedAuctions);

// Fetch single auction by id
router.get("/:id", getAuctionById);


router.post("/", protect, isAdmin, createAuction);
router.put("/:id", protect, isAdmin, updateAuction);
router.delete("/:id", protect, isAdmin, deleteAuction);

export default router;