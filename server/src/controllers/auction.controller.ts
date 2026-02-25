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


  // Fetch single auction by id
  export const getAuctionById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const auction = await prisma.auction.findUnique({
         where: { id: req.params.id }
        // include: {
        //   highestBidder: true,
        //   bids: true,
        // },
      });
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      res.json(auction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auction", error });
    }
}

  export const updateAuction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const auction = await prisma.auction.update({
      where: { id },
      data: {
        title: req.body.title,
        description: req.body.description,
        startingPrice: Number(req.body.startingPrice),
        currentHighestBid: Number(req.body.currentHighestBid),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      },
    });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Failed to update auction" });
  }
};

  export const deleteAuction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.auction.delete({
      where: { id },
    });

    res.json({ message: "Auction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete auction" });
  }
};

export const getAllAuctions = async (req: Request, res: Response) => {
  try {
    const auctions = await prisma.auction.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch auctions" });
  }
};