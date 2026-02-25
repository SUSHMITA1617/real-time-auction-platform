"use client";
import React, { useEffect, useState } from 'react';

const AuctionCard = ({ auction, type }) => (
  <div className="border border-blue-200 rounded-2xl p-6 bg-white bg-opacity-90 shadow-2xl mb-8 flex flex-col w-full max-w-sm transition-transform hover:-translate-y-1 hover:shadow-blue-300 duration-200">
    <img src={auction.image || "/image.png"} alt={auction.title} className="w-full h-48 object-cover rounded-xl mb-4 shadow-lg" />
    <h3 className="text-2xl font-extrabold mb-2 text-blue-800">{auction.title}</h3>
    <p className="text-gray-700 mb-3 text-base">{auction.description}</p>
    {type === 'ongoing' && (
      <>
        <div className="mb-1 text-green-700 font-bold text-lg">Current Bid: <span className="text-lime-600">${auction.currentBid}</span></div>
        <div className="mb-1 text-blue-600 font-semibold">Time Remaining: <span className="text-blue-700">{auction.timeRemaining}</span></div>
        <a
          href={`/auction/${auction.id}`}
          className="mt-4 inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg font-bold text-center shadow-md hover:from-blue-700 hover:to-blue-500 transition"
        >
          View Auction
        </a>
      </>
    )}
    {type === 'upcoming' && (
      <>
        <div className="mb-1 text-yellow-700 font-bold">Starting Price: <span className="text-yellow-800">${auction.startingPrice}</span></div>
        <div className="mb-1 text-gray-500 font-medium">Starts At: <span className="text-gray-700">{auction.startsAt}</span></div>
      </>
    )}
    {type === 'completed' && (
      <>
        <div className="mb-1 text-gray-700 font-bold">Final Bid: <span className="text-green-700">${auction.finalBid}</span></div>
        <div className="mb-1 text-gray-400 font-medium">Ended At: <span className="text-gray-600">{auction.endedAt}</span></div>
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
      <div className="max-w-6xl w-full mx-auto py-14 px-6 bg-white bg-opacity-90 rounded-2xl shadow-2xl border border-blue-200">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-blue-800 tracking-tight drop-shadow">Auction Dashboard</h1>
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-7 text-blue-700 text-center">Ongoing Auctions</h2>
          {loading ? (
            <div className="text-gray-500 text-center">Loading...</div>
          ) : ongoing.length ? (
            <div className="flex flex-wrap justify-center gap-10">
              {ongoing.map(a => (
                <AuctionCard key={a.id} auction={{
                  ...a,
                  image: a.imageUrl ? a.imageUrl : '/image.png',
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
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-7 text-yellow-700 text-center">Upcoming Auctions</h2>
          {loading ? (
            <div className="text-gray-500 text-center">Loading...</div>
          ) : upcoming.length ? (
            <div className="flex flex-wrap justify-center gap-10">
              {upcoming.map(a => (
                <AuctionCard key={a.id} auction={{
                  ...a,
                  image: a.imageUrl ? a.imageUrl : '/image.png',
                  startingPrice: a.startingPrice,
                  startsAt: a.startTime ? new Date(a.startTime).toLocaleString() : '',
                }} type="upcoming" />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No auctions</div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-7 text-gray-700 text-center">Completed Auctions</h2>
          {loading ? (
            <div className="text-gray-500 text-center">Loading...</div>
          ) : completed.length ? (
            <div className="flex flex-wrap justify-center gap-10">
              {completed.map(a => (
                <AuctionCard key={a.id} auction={{
                  ...a,
                  image: a.imageUrl ? a.imageUrl : '/image.png',
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
