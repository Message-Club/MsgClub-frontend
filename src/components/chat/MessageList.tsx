import { useEffect, useState, useRef } from "react";
import { getMessages } from "../../api/message";
import { useChatSocket } from "../../contexts/ChatSocketContext";

type MessageListProps = {
  roomId: number;
};

const MessageList = ({ roomId }: MessageListProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {
    latestMessage,
    isConnected,
    socketError,
  } = useChatSocket();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const fetchMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      console.log("Fetching messages for room:", roomId);
      const data =
        await getMessages(
          roomId
        );
      console.log(
        "Messages fetched:",
        data
      );
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      !latestMessage ||
      String(
        latestMessage.roomId
      ) !== String(roomId)
    ) {
      return;
    }

    setMessages(
      (prevMessages) => {
        if (
          prevMessages.some(
            (msg) =>
              msg.id ===
              latestMessage.id
          )
        ) {
          return prevMessages;
        }

        return [
          ...prevMessages,
          latestMessage,
        ];
      }
    );
  }, [latestMessage, roomId]);

  // Fetch initial messages when room changes
  useEffect(() => {
    if (roomId) {
      fetchMessages();
      // Reset auto-scroll when room changes
      setShouldAutoScroll(true);
    }
  }, [roomId]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom)
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get initial for avatar
  const getInitial = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : "?";
  };

  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Connection status - fixed position */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {socketError && (
          <div className="mt-2 max-w-[220px] rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700">
            {socketError}
          </div>
        )}
      </div>

      {/* Scrollable message container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg: any, index: number) => {
              const showDate =
                index === 0 ||
                new Date(msg.timestamp).toDateString() !==
                new Date(messages[index - 1]?.timestamp).toDateString();
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {new Date(msg.timestamp).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex mb-4 group">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {getInitial(msg.sender_email)}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">
                          {msg.sender_name || msg.sender_email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.sender_email}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default MessageList;
