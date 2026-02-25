"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();

  const [auctions, setAuctions] = useState<any[]>([]);
  const [editingAuction, setEditingAuction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (!localToken && !cookieToken) {
      router.push("/login");
      return;
    }

    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    const res = await api.get("/auctions");
    setAuctions(res.data);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAuction = async () => {
    setLoading(true);

    try {
      if (
        !form.title ||
        !form.description ||
        !form.startingPrice ||
        !form.startTime ||
        !form.endTime
      ) {
        alert("Fill all fields (title, description, price, start time, end time)");
        return;
      }

      await api.post("/auctions", {
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        startingPrice: Number(form.startingPrice),
        currentHighestBid: Number(form.startingPrice),
        startTime: form.startTime,
        endTime: form.endTime,
      });

      setSuccessMessage("Auction created");
      setTimeout(() => setSuccessMessage(""), 3000);

      setForm({
        title: "",
        description: "",
        startingPrice: "",
        imageUrl: "",
        startTime: "",
        endTime: "",
      });

      await fetchAuctions();
    } finally {
      setLoading(false);
    }
  };

  const updateAuction = async () => {
    setLoading(true);

    try {
      await api.put(`/auctions/${editingAuction.id}`, {
        ...form,
        startingPrice: Number(form.startingPrice),
        currentHighestBid: Number(form.startingPrice),
      });

      setEditingAuction(null);
      await fetchAuctions();
    } finally {
      setLoading(false);
    }
  };

  const deleteAuction = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    await api.delete(`/auctions/${id}`);
    await fetchAuctions();
  };

  const isOngoingAuction = (auction: any) => {
    if (auction?.startTime && auction?.endTime) {
      const now = Date.now();
      const start = new Date(auction.startTime).getTime();
      const end = new Date(auction.endTime).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        return now >= start && now <= end;
      }
    }

    const status = String(auction?.status || "").toUpperCase();
    if (status) return status === "ONGOING";

    const now = Date.now();
    const start = new Date(auction?.startTime).getTime();
    const end = new Date(auction?.endTime).getTime();
    return !Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end;
  };

  const isCompletedAuction = (auction: any) => {
    if (auction?.endTime) {
      const end = new Date(auction.endTime).getTime();
      if (!Number.isNaN(end)) return Date.now() > end;
    }

    const status = String(auction?.status || "").toUpperCase();
    return status === "COMPLETED";
  };

  const getAuctionStatus = (auction: any) => {
    if (isCompletedAuction(auction)) return "COMPLETED";
    if (isOngoingAuction(auction)) return "ONGOING";
    return "UPCOMING";
  };

  const getStatusPillClass = (status: string) => {
    if (status === "COMPLETED") {
      return "bg-slate-100 text-slate-700 border border-slate-200";
    }
    if (status === "ONGOING") {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
    return "bg-amber-100 text-amber-700 border border-amber-200";
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto text-slate-800">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Admin Dashboard</h1>

      <div className="bg-white/85 backdrop-blur border border-blue-100 p-6 rounded-2xl mb-10 shadow-sm">
        <h2 className="text-xl mb-4 text-slate-900">
          {editingAuction ? "Edit Auction" : "Create Auction"}
        </h2>

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
            {successMessage}
          </div>
        )}

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <input
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <input
          name="startingPrice"
          type="number"
          placeholder="Starting Price"
          value={form.startingPrice}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <input
          name="startTime"
          type="datetime-local"
          value={form.startTime}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <input
          name="endTime"
          type="datetime-local"
          value={form.endTime}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <button
          onClick={editingAuction ? updateAuction : createAuction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          {loading ? "Processing..." : editingAuction ? "Update" : "Create"}
        </button>
      </div>

      {auctions.map((auction) => (
        (() => {
          const ongoing = isOngoingAuction(auction);
          const completed = isCompletedAuction(auction);
          const auctionStatus = getAuctionStatus(auction);
          return (
        <div
          key={auction.id}
          className="bg-white/85 backdrop-blur border border-blue-100 p-6 mb-4 rounded-2xl shadow-sm flex justify-between items-center"
        >
          <div>
            <p className="font-bold text-lg text-slate-900">{auction.title}</p>
            <p className="text-blue-700 font-semibold">INR {auction.currentHighestBid}</p>
            <span
              className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusPillClass(auctionStatus)}`}
            >
              {auctionStatus}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (completed) return;
                setEditingAuction(auction);
                setForm({
                  title: auction.title,
                  description: auction.description,
                  imageUrl: auction.imageUrl || "",
                  startingPrice: String(auction.startingPrice ?? ""),
                  startTime: auction.startTime.slice(0, 16),
                  endTime: auction.endTime.slice(0, 16),
                });
              }}
              disabled={completed}
              title={completed ? "Completed auctions cannot be edited" : "Edit auction"}
              className={`px-4 py-2 rounded-lg transition text-white ${
                completed
                  ? "bg-amber-300 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              Edit
            </button>

            <button
              onClick={() => {
                if (!ongoing && !completed) deleteAuction(auction.id);
              }}
              disabled={ongoing || completed}
              title={
                completed
                  ? "Completed auctions cannot be deleted"
                  : ongoing
                  ? "Ongoing auctions cannot be deleted"
                  : "Delete auction"
              }
              className={`px-4 py-2 rounded-lg transition text-white ${
                ongoing || completed
                  ? "bg-rose-300 cursor-not-allowed"
                  : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              Delete
            </button>
          </div>
        </div>
          );
        })()
      ))}
    </div>
  );
}
