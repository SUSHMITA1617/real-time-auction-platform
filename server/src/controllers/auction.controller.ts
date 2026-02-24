import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createAuction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      imageUrl,
      startingPrice,
      startTime,
      endTime,
    } = req.body;

    // Only ADMIN can create
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden - Admin only" });
    }

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        imageUrl,
        startingPrice,
        currentHighestBid: startingPrice,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdById: req.user.userId,
      },
    });

    //  audit log
    await prisma.auditLog.create({
      data: {
        action: "AUCTION_CREATED",
        message: `Auction ${auction.title} created`,
        userId: req.user.userId,
        auctionId: auction.id,
      },
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: "Auction creation failed", error });
  }
};


export const getOngoingAuctions = async (req: Request, res: Response) => {
  const now = new Date();

  const auctions = await prisma.auction.findMany({
    where: {
      startTime: { lte: now },
      endTime: { gte: now },
    },
    orderBy: { endTime: "asc" },
  });

  res.json(auctions);
};


export const getUpcomingAuctions = async (req: Request, res: Response) => {
  const now = new Date();

  const auctions = await prisma.auction.findMany({
    where: {
      startTime: { gt: now },
    },
    orderBy: { startTime: "asc" },
  });

  res.json(auctions);
};


export const getCompletedAuctions = async (req: Request, res: Response) => {
  const now = new Date();

  const auctions = await prisma.auction.findMany({
    where: {
      endTime: { lt: now },
    },
    orderBy: { endTime: "desc" },
  });

  res.json(auctions);
};