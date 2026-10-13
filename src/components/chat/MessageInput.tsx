import { useState } from "react";
import { sendMessage } from "../../api/message";
import { useChatSocket } from "../../contexts/ChatSocketContext";

type MessageInputProps = {
  roomId: number;
};

const MessageInput = ({ roomId }: MessageInputProps) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const {
    isConnected,
    sendMessage: sendWSMessage,
  } = useChatSocket();


const handleSend = async () => {
  if (!text.trim() || isSending) return;

  try {
    setIsSending(true);

    if (isConnected) {
      sendWSMessage({
        roomId,
        content: text,
      });
    } else {
      await sendMessage({
        roomId,
        content: text,
      });
    }

    setText("");
  } catch (error) {
    console.error("Failed to send message", error);
  } finally {
    setIsSending(false);
  }
};



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none transition-colors"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">
        {!isConnected && <span className="text-red-500">⚠️ Connecting to real-time...</span>}
        <span className="ml-2">Press Enter to send, Shift + Enter for new line</span>
      </div>
    </div>
  );
};

export default MessageInput;
