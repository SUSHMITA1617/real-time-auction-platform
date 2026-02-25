"use client";
import React, { useEffect, useState } from 'react';

const AuctionCard = ({ auction, type }) => (
  <div className="border rounded-2xl p-5 bg-gray-100 shadow-xl mb-6 transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200 flex flex-col w-full max-w-sm">
    <img src="/image.png" alt={auction.title} className="w-full h-48 object-cover rounded-xl mb-4" />
    <h3 className="text-xl font-bold mb-2 text-blue-700">{auction.title}</h3>
    <p className="text-gray-600 mb-2">{auction.description}</p>
    {type === 'ongoing' && (
      <>
        <div className="mt-2 text-green-700 font-semibold text-lg">Current Bid: ${auction.currentBid}</div>
        <div className="mt-1 text-blue-600 font-medium">Time Remaining: {auction.timeRemaining}</div>
        <a
          href={`/auction/${auction.id}`}
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
        >
          View Auction
        </a>
      </>
    )}
    {type === 'upcoming' && (
      <>
        <div className="mt-2 text-yellow-600 font-semibold">Starting Price: ${auction.startingPrice}</div>
        <div className="mt-1 text-gray-500">Starts At: {auction.startsAt}</div>
      </>
    )}
    {type === 'completed' && (
      <>
        <div className="mt-2 text-gray-700 font-semibold">Final Bid: ${auction.finalBid}</div>
        <div className="mt-1 text-gray-400">Ended At: {auction.endedAt}</div>
      </>
    )}
  </div>
);

const Dashboard = () => {
  const [ongoing, setOngoing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const ongoingRes = await fetch('http://localhost:5000/api/auctions/ongoing');
        const upcomingRes = await fetch('http://localhost:5000/api/auctions/upcoming');
        const completedRes = await fetch('http://localhost:5000/api/auctions/completed');
        const ongoingData = await ongoingRes.json();
        const upcomingData = await upcomingRes.json();
        const completedData = await completedRes.json();
        setOngoing(Array.isArray(ongoingData) ? ongoingData : []);
        setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
        setCompleted(Array.isArray(completedData) ? completedData : []);
      } catch (err) {
        setOngoing([]);
        setUpcoming([]);
        setCompleted([]);
      }
      setLoading(false);
    };
    fetchAuctions();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="max-w-6xl w-full mx-auto py-12 px-4 bg-white bg-opacity-90 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-800 tracking-tight">Auction Dashboard</h1>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Ongoing Auctions</h2>
          {loading ? (
            <div className="text-gray-500 text-center">Loading...</div>
          ) : ongoing.length ? (
            <div className="flex flex-wrap justify-center gap-8">
              {ongoing.map(a => (
                <AuctionCard key={a.id} auction={{
                  ...a,
                  image: a.imageUrl ? a.imageUrl : '/assets/image.png',
                  currentBid: a.currentHighestBid,
                  timeRemaining: a.endTime ? new Date(a.endTime).toLocaleString() : '',
                  startingPrice: a.startingPrice,
                }} type="ongoing" />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No auctions</div>
          )}
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-yellow-700 text-center">Upcoming Auctions</h2>
          {loading ? (
            <div className="text-gray-500 text-center">Loading...</div>
          ) : upcoming.length ? (
            <div className="flex flex-wrap justify-center gap-8">
              {upcoming.map(a => (
                <AuctionCard key={a.id} auction={{
                  ...a,
                  image: a.imageUrl ? a.imageUrl : '/assets/image.png',
                  startingPrice: a.startingPrice,
                  timeRemaining: a.startTime ? new Date(a.startTime).toLocaleString() : '',
                }} type="upcoming" />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No auctions</div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Completed Auctions</h2>
          {loading ? (
            <div className="text-gray-500 text-center">Loading...</div>
          ) : completed.length ? (
            <div className="flex flex-wrap justify-center gap-8">
              {completed.map(a => (
                <AuctionCard key={a.id} auction={{
                  ...a,
                  image: a.imageUrl ? a.imageUrl : '/assets/image.png',
                  finalBid: a.currentHighestBid,
                  endedAt: a.endTime ? new Date(a.endTime).toLocaleString() : '',
                }} type="completed" />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No auctions</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
