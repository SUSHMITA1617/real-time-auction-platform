import { login, register } from "../../src/controllers/auth.controller";

var mockPrisma: any;

jest.mock("../../src/utils/prisma", () => {
  mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("register should return 400 when email exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
    const req: any = { body: { name: "A", email: "a@test.com", password: "pass123" } };
    const res = makeRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already registered" });
  });

  it("register should create user and return 201", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    mockPrisma.user.create.mockResolvedValue({ id: "u2" });
    const req: any = { body: { name: "New", email: "new@test.com", password: "pass123" } };
    const res = makeRes();

    await register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("pass123", 10);
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully" });
  });

  it("login should return 400 for invalid user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req: any = { body: { email: "x@test.com", password: "pass123" } };
    const res = makeRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("login should return 400 for wrong password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u3",
      email: "ok@test.com",
      password: "hashed",
      role: "USER",
      name: "tester",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req: any = { body: { email: "ok@test.com", password: "wrong-pass" } };
    const res = makeRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("login should return token for valid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u3",
      email: "ok@test.com",
      password: "hashed",
      role: "USER",
      name: "tester",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

    const req: any = { body: { email: "ok@test.com", password: "pass123" } };
    const res = makeRes();

    await login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith("pass123", "hashed");
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "jwt-token" });
  });

  it("register should return 500 on prisma error", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("db error"));
    const req: any = { body: { name: "New", email: "new@test.com", password: "pass123" } };
    const res = makeRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Registration failed" })
    );
  });

  it("login should return 500 on jwt sign error", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u3",
      email: "ok@test.com",
      password: "hashed",
      role: "USER",
      name: "tester",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw new Error("jwt error");
    });

    const req: any = { body: { email: "ok@test.com", password: "pass123" } };
    const res = makeRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Login failed" })
    );
  });
});
