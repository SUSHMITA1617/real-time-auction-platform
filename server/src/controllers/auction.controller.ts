import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

const getAuctionStatus = (startTime: Date, endTime: Date) => {
  const now = new Date();
  if (endTime < now) return "COMPLETED";
  if (startTime > now) return "UPCOMING";
  return "ONGOING";
};

const syncAuctionStatuses = async () => {
  const now = new Date();

  await prisma.auction.updateMany({
    where: {
      status: { not: "CANCELLED" },
      startTime: { gt: now },
      OR: [{ status: "ONGOING" }, { status: "COMPLETED" }],
    },
    data: { status: "UPCOMING" },
  });

  await prisma.auction.updateMany({
    where: {
      status: { not: "CANCELLED" },
      startTime: { lte: now },
      endTime: { gte: now },
      OR: [{ status: "UPCOMING" }, { status: "COMPLETED" }],
    },
    data: { status: "ONGOING" },
  });

  await prisma.auction.updateMany({
    where: {
      status: { not: "CANCELLED" },
      endTime: { lt: now },
      OR: [{ status: "UPCOMING" }, { status: "ONGOING" }],
    },
    data: { status: "COMPLETED" },
  });
};

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
        status: getAuctionStatus(new Date(startTime), new Date(endTime)),
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
  await syncAuctionStatuses();
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
  await syncAuctionStatuses();
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
  await syncAuctionStatuses();
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
  await syncAuctionStatuses();
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const highestBid = auction.bids[0];
    const { bids, ...auctionData } = auction;

    res.json({
      ...auctionData,
      highestBidder: highestBid?.user ?? null,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch auction", error });
  }
};

  export const updateAuction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const nextStart = new Date(req.body.startTime);
    const nextEnd = new Date(req.body.endTime);

    const auction = await prisma.auction.update({
      where: { id },
      data: {
        title: req.body.title,
        description: req.body.description,
        startingPrice: Number(req.body.startingPrice),
        currentHighestBid: Number(req.body.currentHighestBid),
        startTime: nextStart,
        endTime: nextEnd,
        status: getAuctionStatus(nextStart, nextEnd),
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
    await syncAuctionStatuses();

    const auctions = await prisma.auction.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch auctions" });
  }
};
