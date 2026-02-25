"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import socket from "@/lib/socket";

export default function AuctionPage() {
  const { id } = useParams();

  const [auction, setAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [highlight, setHighlight] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    fetchAuction();
    socket.emit("joinAuction", id);

    socket.on("bidUpdate", (data: any) => {
      if (data.auctionId === id) {
        setAuction((prev: any) => ({
          ...prev,
          currentHighestBid: data.amount,
        }));
        setHighestBidder(data.username);
        setActivityLog((prev) => [
          {
            username: data.username,
            amount: data.amount,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        setHighlight(true);
        setTimeout(() => setHighlight(false), 800);
      }
    });

    // Countdown timer
    let timer: NodeJS.Timeout;
    if (auction && auction.endsAt) {
      timer = setInterval(() => {
        const end = new Date(auction.endsAt).getTime();
        const now = Date.now();
        const diff = end - now;
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        } else {
          setTimeLeft("00:00:00");
        }
      }, 1000);
    }

    return () => {
      socket.off("bidUpdate");
      if (timer) clearInterval(timer);
    };
  }, [id, auction]);

  const fetchAuction = async () => {
    const res = await api.get(`/auctions/${id}`);
    setAuction(res.data);
    setHighestBidder(res.data.highestBidder?.username || null);
  };

  const placeBid = async () => {
    try {
      await api.post(`/bids/${id}`, {
        amount: Number(bidAmount),
      });
      setBidAmount("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Bid failed");
    }
  };

  if (!auction) return <div>Loading...</div>;
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 bg-white rounded shadow-md">
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="md:w-1/2 mb-4 md:mb-0">
          <img src={auction.image || "/images/default.jpg"} alt={auction.title} className="w-full h-64 object-cover rounded" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{auction.title}</h1>
            <p className="text-gray-700 mb-2">{auction.description}</p>
            <div className="mb-2">
              <span className="font-semibold">Starting Price:</span> ${auction.startingPrice}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-green-600">Current Highest Bid:</span> <span className={highlight ? "text-lime-500" : "text-green-600"}>${auction.currentHighestBid}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-blue-600">Time Remaining:</span> {timeLeft || "--:--:--"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Highest Bidder:</span> <strong>{highestBidder || "No bids yet"}</strong>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter bid"
              className="border rounded p-2 mr-2"
            />
            <button onClick={placeBid} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Place Bid</button>
          </div>
        </div>
      </div>
      <hr className="my-8" />
      <section>
        <h3 className="text-lg font-semibold mb-2">Live Activity</h3>
        <div className="bg-gray-100 rounded p-2">
          {activityLog.length === 0 && <p className="text-gray-500">No activity yet</p>}
          {activityLog.map((log, index) => (
            <div key={index} className="mb-1 text-sm">
              <strong>{log.username}</strong> bid ${log.amount} <span className="text-gray-500">at {log.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}