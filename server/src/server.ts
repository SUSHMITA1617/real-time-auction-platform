import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middlewares/auth.middleware";
import auctionRoutes from "./routes/auction.routes";
import bidRoutes from "./routes/bid.routes";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);

app.get("/", (req, res) => {
  res.send("Auction API Running");
});

app.get("/api/protected", authenticate, (req, res) => {
  res.json({ message: "You accessed protected route" });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});