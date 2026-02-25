import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middlewares/auth.middleware";
import auctionRoutes from "./routes/auction.routes";
import bidRoutes from "./routes/bid.routes";
import { initSocket } from "./socket";

dotenv.config();

const app = express();

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



const server = http.createServer(app);

const io = initSocket(server);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinAuction", (auctionId: string) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});