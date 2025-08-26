import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = "http://localhost:3000/chat";

export const initSocket = async () => {
  const token = await AsyncStorage.getItem("authToken");

  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: {
      Authorization: `Bearer ${token}`,
    },
  });

  return socket;
};
