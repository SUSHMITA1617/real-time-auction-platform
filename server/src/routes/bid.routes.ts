import { Router } from "express";
import { placeBid } from "../controllers/bid.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, placeBid);

export default router;