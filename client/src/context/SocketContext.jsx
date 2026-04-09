import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// 1. Create a Context for the Socket.io instance
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 2. Determine the backend URL for the socket connection
    // Why strip /api? 
    // WebSocket connections usually happen on the root server URL (e.g. localhost:5000), 
    // not on the REST API endpoint (localhost:5000/api).
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace('/api', '');

    // 3. Initialize the socket connection inside useEffect
    // Why inside? To ensure the connection only happens once when the application mounts.
    const newSocket = io(socketUrl);

    // 4. Log connection events for internal debugging
    newSocket.on("connect", () => {
        console.log("🔌 Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
    });

    // 5. Save the socket instance to state so other components can access it
    setSocket(newSocket);

    // 6. Return a cleanup function
    // Why? To gracefully close the connection when the app/component is unmounted, 
    // preventing memory leaks and duplicate connections.
    return () => newSocket.disconnect();
  }, []);

  return (
    // 7. Use Context instead of re-creating sockets in every component
    // Why? Creating multiple sockets per user is inefficient and can cause synchronization bugs.
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for easier access to the socket instance
export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
