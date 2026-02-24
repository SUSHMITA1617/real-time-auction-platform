import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const placeBid = async (req: AuthRequest, res: Response) => {
  try {
    const { auctionId, amount } = req.body;
    const userId = req.user.userId;

    if (!auctionId || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const now = new Date();

    //  transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction) {
        throw new Error("Auction not found");
      }

      // Reject if auction not started
      if (auction.startTime > now) {
        throw new Error("Auction has not started yet");
      }

      // Reject if auction ended
      if (auction.endTime < now) {
        throw new Error("Auction has ended");
      }

      // Reject lower or equal bids
      if (amount <= auction.currentHighestBid) {
        throw new Error("Bid must be higher than current highest bid");
      }

      // Create bid
      const bid = await tx.bid.create({
        data: {
          amount,
          userId,
          auctionId,
        },
      });

      // Update highest bid
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentHighestBid: amount,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: "BID_PLACED",
          message: `User placed bid of ${amount}`,
          userId,
          auctionId,
        },
      });

      return bid;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};