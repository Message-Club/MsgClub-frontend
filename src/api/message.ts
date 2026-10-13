import { request } from "./auth";

const BASE_URL = "/messages";

const normalizeMessage = (
  message: any
) => {
  if (!message) {
    return message;
  }

  const sender =
    message.sender || {};

  return {
    ...message,
    id: String(
      message.id
    ),
    roomId: String(
      message.roomId ??
        message.room_id ??
        ""
    ),
    senderId: String(
      message.senderId ??
        message.sender_id ??
        sender.id ??
        ""
    ),
    sender_email:
      sender.email ??
      message.sender_email,
    sender_name:
      sender.username ??
      message.sender_name,
    timestamp:
      message.timestamp,
  };
};

// GET MESSAGES
export const getMessages = async (roomId: number) => {
  const response =
    await request(
      `${BASE_URL}/${roomId}`,
      {
        method: "GET",
      }
    );

  return (
    response?.results || []
  )
    .slice()
    .reverse()
    .map(normalizeMessage);
};

// SEND MESSAGE
export const sendMessage = async (data: {
  roomId: number;
  content: string;
  file?: string;
}) => {
  const response =
    await request(
      `${BASE_URL}/`,
      {
        method: "POST",
        body: JSON.stringify(
          data
        ),
      }
    );

  return normalizeMessage(
    response?.data
  );
};

// MARK AS READ
export const markAsRead = async (messageId: number) => {
  return request(`${BASE_URL}/read/${messageId}/`, {
    method: "POST",
  });
};
