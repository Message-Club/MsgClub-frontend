import { useState } from "react";
import RoomList from "../components/rooms/RoomList";
import ChatWindow from "../components/chat/ChatWindow";
import { ChatSocketProvider } from "../contexts/ChatSocketContext";

const ChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRoomUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRoomDeleted = () => {
    setSelectedRoom(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ChatSocketProvider
      roomId={selectedRoom}
    >
      <div className="flex h-screen overflow-hidden">
        <RoomList
          key={refreshKey}
          onSelectRoom={setSelectedRoom}
        />
        <ChatWindow
          roomId={selectedRoom}
          onRoomUpdated={handleRoomUpdated}
          onRoomDeleted={handleRoomDeleted}
        />
      </div>
    </ChatSocketProvider>
  );
};

export default ChatPage;
