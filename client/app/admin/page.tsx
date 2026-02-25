"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();

  const [auctions, setAuctions] = useState<any[]>([]);
  const [editingAuction, setEditingAuction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");

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
    if (!form.title || !form.description || !form.startingPrice || !form.startTime || !form.endTime) {
  alert("Fill all fields (title, description, price, start time, end time)");
  return;
}

    await api.post("/auctions", {
      ...form,
      startingPrice: Number(form.startingPrice),
      currentHighestBid: Number(form.startingPrice),
    });

    setForm({
      title: "",
      description: "",
      startingPrice: "",
      imageUrl: "",
      startTime: "",
      endTime: "",
    });

    fetchAuctions();
    setLoading(false);
  };

  const updateAuction = async () => {
    setLoading(true);

    await api.put(`/auctions/${editingAuction.id}`, {
      ...form,
      startingPrice: Number(form.startingPrice),
      currentHighestBid: Number(form.startingPrice),
    });

    setEditingAuction(null);
    fetchAuctions();
    setLoading(false);
  };

  const deleteAuction = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    await api.delete(`/auctions/${id}`);
    fetchAuctions();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>


      {/* Form */}
      <div className="bg-zinc-900 p-6 rounded-xl mb-10">
        <h2 className="text-xl mb-4">
          {editingAuction ? "Edit Auction" : "Create Auction"}
        </h2>

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-zinc-800 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-zinc-800 rounded"
        />

        <input
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-zinc-800 rounded"
        />

        <input
          name="startingPrice"
          type="number"
          placeholder="Starting Price"
          value={form.startingPrice}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-zinc-800 rounded"
        />

        <input
          name="startTime"
          type="datetime-local"
          value={form.startTime}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-zinc-800 rounded"
        />

        <input
          name="endTime"
          type="datetime-local"
          value={form.endTime}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-zinc-800 rounded"
        />

        <button
          onClick={editingAuction ? updateAuction : createAuction}
          className="bg-green-600 px-6 py-2 rounded"
        >
          {loading ? "Processing..." : editingAuction ? "Update" : "Create"}
        </button>
      </div>

      {/* Auction List */}
      {auctions.map((auction) => (
        <div
          key={auction.id}
          className="bg-zinc-900 p-6 mb-4 rounded-xl flex justify-between items-center"
        >
          <div>
            <p className="font-bold text-lg">{auction.title}</p>
            <p className="text-zinc-400">₹{auction.currentHighestBid}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingAuction(auction);
                setForm({
                  title: auction.title,
                  description: auction.description,
                  imageUrl: auction.imageUrl || "",
                  startingPrice: auction.startingPrice,
                  startTime: auction.startTime.slice(0, 16),
                  endTime: auction.endTime.slice(0, 16),
                });
              }}
              className="bg-yellow-600 px-4 py-2 rounded"
            >
              Edit
            </button>

            <button
              onClick={() => deleteAuction(auction.id)}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}