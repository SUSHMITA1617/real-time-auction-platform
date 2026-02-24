 Real-Time Auction & Bidding Platform

 Tech Stack
- Frontend: Next.js (TypeScript, Tailwind)
- Backend: Node.js + Express + Socket.IO
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT
- Real-time: WebSockets (Socket.IO)

 Architecture
Client (Next.js) → REST APIs → Express Server  
Client ↔ WebSockets ↔ Socket.IO  
Server → Prisma → PostgreSQL  

   Features
- Real-time bidding
- JWT Authentication
- Auction state management
- Audit logs
- Countdown timers synced with server time

 Setup Instructions
 Backend
cd server  
npm install  
npm run dev  

 Frontend
cd client  
npm install  
npm run dev  

