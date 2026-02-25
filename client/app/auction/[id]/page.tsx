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

    return () => {
      socket.off("bidUpdate");
    };
  }, [id]);

  // Countdown timer effect (separate, only depends on auction?.endsAt)
  useEffect(() => {
    if (!auction || !auction.endsAt) {
      setTimeLeft("--:--:--");
      return;
    }
    function updateTimer() {
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
    }
    updateTimer(); // initial call
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [auction?.endsAt]);

  const fetchAuction = async () => {
    try {
      const res = await api.get(`/auctions/${id}`);
      if (!res.data || !res.data.id) {
        setAuction(null);
        setHighestBidder(null);
        return;
      }
      // Map fields according to API format
      setAuction({
        ...res.data,
        image: res.data.imageUrl ? res.data.imageUrl : '../image.png',
        currentHighestBid: res.data.currentHighestBid,
        startingPrice: res.data.startingPrice,
        endsAt: res.data.endTime,
      });
      setHighestBidder(res.data.highestBidder?.username || null);
    } catch (err) {
      setAuction(null);
      setHighestBidder(null);
    }
  };

  const placeBid = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/bids`,
        {
          auctionId: id,
          amount: Number(bidAmount),
        },
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      );
      setBidAmount("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Bid failed");
    }
  };

  if (auction === null) return <div className="text-center text-red-600 mt-10">Auction not found or failed to load.</div>;
  if (!auction) return <div>Loading...</div>;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="max-w-4xl w-full bg-white bg-opacity-90 rounded-2xl shadow-2xl p-10">
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/2 mb-6 md:mb-0 flex justify-center items-center">
            <img src="/image.png" alt={auction.title} className="w-full max-w-md h-72 object-cover rounded-xl shadow-lg" />
          </div>
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-4 text-blue-800">{auction.title}</h1>
              <p className="text-gray-700 mb-4 text-lg">{auction.description}</p>
              <div className="mb-3">
                <span className="font-semibold text-blue-600">Starting Price:</span> <span className="text-yellow-700">${auction.startingPrice}</span>
              </div>
              <div className="mb-3">
                <span className="font-semibold text-green-600">Current Highest Bid:</span> <span className={highlight ? "text-lime-500 font-bold" : "text-green-600"}>${auction.currentHighestBid}</span>
              </div>
              <div className="mb-3">
                <span className="font-semibold text-blue-600">Time Remaining:</span> <span className="text-blue-700">{timeLeft || "--:--:--"}</span>
              </div>
              <div className="mb-3">
                <span className="font-semibold text-gray-900">Highest Bidder:</span> <strong className="text-gray-900">{highestBidder || "No bids yet"}</strong>
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid"
                className="border border-blue-300 rounded-lg p-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 bg-blue-50 mr-4"
              />
              <button onClick={placeBid} className="bg-green-500 text-white px-6 py-0 rounded-lg font-bold text-lg shadow-md hover:bg-green-600 transition">Place Bid</button>
            </div>
          </div>
        </div>
        <hr className="my-10" />
        <section>
          <h3 className="text-xl font-bold mb-4 text-blue-700">Live Activity</h3>
          <div className="bg-gray-100 rounded-xl p-4">
            {activityLog.length === 0 && <p className="text-gray-500">No activity yet</p>}
            {activityLog.map((log, index) => (
              <div key={index} className="mb-2 text-base">
                <strong className="text-blue-800">{log.username}</strong> bid <span className="text-green-700">${log.amount}</span> <span className="text-gray-500">at {log.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}