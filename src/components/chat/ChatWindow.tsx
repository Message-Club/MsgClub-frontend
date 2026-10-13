import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import RoomActionsNav from "./RoomActionsNav";

type ChatWindowProps = {
  roomId: number | null;
  onRoomUpdated?: () => void;
  onRoomDeleted?: () => void;
};

const ChatWindow = ({ roomId, onRoomUpdated, onRoomDeleted }: ChatWindowProps) => {
  if (!roomId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Select a room
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white h-full">
      <RoomActionsNav 
        roomId={roomId} 
        onRoomUpdated={onRoomUpdated}
        onRoomDeleted={onRoomDeleted}
      />
      <div className="flex-1 min-h-0">
        <MessageList roomId={roomId} />
      </div>
      <MessageInput roomId={roomId} />
    </div>
  );
};

export default ChatWindow;