import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const initSocket = () => {
  return io(SOCKET_URL, {
    // CRITICAL: Tells Socket.IO to include HTTP-only cookies in the handshake
    withCredentials: true,
    autoConnect: false, // We connect manually when entering a room
  });
};
