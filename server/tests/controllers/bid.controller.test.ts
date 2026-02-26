import { placeBid } from "../../src/controllers/bid.controller";

var emitMock: jest.Mock;
var toMock: jest.Mock;
var mockPrisma: any;

jest.mock("../../src/utils/prisma", () => {
  mockPrisma = {
    $transaction: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

jest.mock("../../src/socket", () => {
  emitMock = jest.fn();
  toMock = jest.fn(() => ({ emit: emitMock }));
  return {
    getIO: () => ({
      to: toMock,
    }),
  };
});

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("bid controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when amount is missing", async () => {
    const req: any = {
      body: { auctionId: "auction-1234567890" },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing amount" });
  });

  it("should return 400 for invalid auctionId", async () => {
    const req: any = {
      body: { auctionId: "bad", amount: 200 },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid auctionId" });
  });

  it("should return 400 for invalid userId", async () => {
    const req: any = {
      body: { auctionId: "auction-1234567890", amount: 200 },
      user: { id: "bad", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid userId" });
  });

  it("should reject lower bid", async () => {
    const now = new Date();
    const tx = {
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: "a1",
          startTime: new Date(now.getTime() - 10000),
          endTime: new Date(now.getTime() + 10000),
          currentHighestBid: 500,
        }),
        update: jest.fn(),
      },
      bid: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const req: any = {
      body: { auctionId: "auction-1234567890", amount: 400 },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Bid must be higher than current highest bid",
    });
  });

  it("should return 400 when auction is not found", async () => {
    const tx = {
      auction: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      bid: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const req: any = {
      body: { auctionId: "auction-1234567890", amount: 700 },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Auction not found" });
  });

  it("should return 400 when auction has not started", async () => {
    const now = new Date();
    const tx = {
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: "a1",
          startTime: new Date(now.getTime() + 60000),
          endTime: new Date(now.getTime() + 120000),
          currentHighestBid: 500,
        }),
        update: jest.fn(),
      },
      bid: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const req: any = {
      body: { auctionId: "auction-1234567890", amount: 700 },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Auction has not started yet" });
  });

  it("should return 400 when auction has ended", async () => {
    const now = new Date();
    const tx = {
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: "a1",
          startTime: new Date(now.getTime() - 120000),
          endTime: new Date(now.getTime() - 60000),
          currentHighestBid: 500,
        }),
        update: jest.fn(),
      },
      bid: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const req: any = {
      body: { auctionId: "auction-1234567890", amount: 700 },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Auction has ended" });
  });

  it("should place bid and emit socket event", async () => {
    const now = new Date();
    const tx = {
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: "a1",
          startTime: new Date(now.getTime() - 10000),
          endTime: new Date(now.getTime() + 10000),
          currentHighestBid: 500,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      bid: { create: jest.fn().mockResolvedValue({ id: "bid1", amount: 700 }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const req: any = {
      body: { auctionId: "auction-1234567890", amount: 700 },
      user: { id: "user-1234567890", name: "Demo" },
    };
    const res = makeRes();

    await placeBid(req, res);

    expect(tx.bid.create).toHaveBeenCalled();
    expect(tx.auction.update).toHaveBeenCalledWith({
      where: { id: "auction-1234567890" },
      data: { currentHighestBid: 700 },
    });
    expect(toMock).toHaveBeenCalledWith("auction-1234567890");
    expect(emitMock).toHaveBeenCalledWith(
      "bidUpdate",
      expect.objectContaining({
        auctionId: "auction-1234567890",
        amount: 700,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
