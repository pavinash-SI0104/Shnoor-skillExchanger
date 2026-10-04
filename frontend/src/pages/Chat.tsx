import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import {
  connectChatSocket,
  disconnectChatSocket,
} from "../api/chatSocket";
import { Socket } from "socket.io-client";

interface Conversation {
  id: string;
  requestId: string;
  participants: string[];
  participantNames: Record<string, string>;
  skillId: string;
  skillName: string;
  lastMessage: string;
  unreadCounts?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

function Chat() {
  const { currentUser } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const selectedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ),
    [conversations, selectedConversationId]
  );

  const getOtherUserId = (conversation: Conversation) =>
    conversation.participants.find(
      (participantId) => participantId !== currentUser?.uid
    );

  const getOtherUserName = (conversation: Conversation) => {
    const otherUserId = getOtherUserId(conversation);

    if (!otherUserId) return "Unknown user";

    return conversation.participantNames?.[otherUserId] || "Unknown user";
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);
  // Load conversations
  useEffect(() => {
    if (!currentUser) return;

    let active = true;

    const loadConversations = async () => {
      try {
        setLoadingConversations(true);
        setError("");

        const response = await api.get("/users/conversations");

        if (!active) return;

        const fetchedConversations: Conversation[] =
          response.data.conversations || [];

        setConversations(fetchedConversations);

        setSelectedConversationId((current) => {
          if (
            current &&
            fetchedConversations.some(
              (conversation) => conversation.id === current
            )
          ) {
            return current;
          }

          return fetchedConversations[0]?.id || null;
        });
      } catch (err) {
        console.error("Failed to load conversations:", err);

        if (active) {
          setError("Unable to load conversations.");
        }
      } finally {
        if (active) {
          setLoadingConversations(false);
        }
      }
    };

    loadConversations();

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Connect Socket.IO once per authenticated user
  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    let attachedSocket: Socket | null = null;

    const handleUserOnline = ({ uid }: { uid: string }) => {
      setOnlineUsers((previous) => {
        const updated = new Set(previous);
        updated.add(uid);
        return updated;
      });
    };

    const handleUserOffline = ({ uid }: { uid: string }) => {
      setOnlineUsers((previous) => {
        const updated = new Set(previous);
        updated.delete(uid);
        return updated;
      });
    };
    const handleChatError = ({ message }: { message: string }) => {
  setError(message);
};

    const handleOnlineUsers = ({ uids }: { uids: string[] }) => {
      setOnlineUsers(new Set(uids));
    };
    const handleNewMessage = (newMessage: Message) => {
  const currentConversationId =
    selectedConversationIdRef.current;

  const isCurrentConversation =
    newMessage.conversationId === currentConversationId;

  // Add message to the currently open conversation
  if (isCurrentConversation) {
    setMessages((previousMessages) => {
      if (
        previousMessages.some(
          (item) => item.id === newMessage.id
        )
      ) {
        return previousMessages;
      }

      return [...previousMessages, newMessage];
    });
  }

  // Update conversation preview and unread count
  setConversations((previousConversations) =>
    previousConversations
      .map((conversation) => {
        if (
          conversation.id !== newMessage.conversationId
        ) {
          return conversation;
        }

        const currentUnread =
          conversation.unreadCounts?.[
            currentUser.uid
          ] || 0;

        return {
          ...conversation,
          lastMessage: newMessage.text,
          updatedAt: newMessage.createdAt,

          unreadCounts: {
            ...conversation.unreadCounts,

            // Don't increase unread count while
            // the conversation is currently open.
            [currentUser.uid]: isCurrentConversation
              ? 0
              : currentUnread + 1,
          },
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      )
  );

  // If the conversation is currently open,
  // mark the incoming message as read.
  if (isCurrentConversation) {
    api
      .patch(
        `/users/conversations/${newMessage.conversationId}/read`
      )
      .catch((err) => {
        console.error(
          "Failed to mark message as read:",
          err
        );
      });
  }
};

    const handleConversationUpdated = ({
      conversationId,
      lastMessage,
      updatedAt,
      unreadCount,
    }: {
      conversationId: string;
      lastMessage: string;
      updatedAt: string;
      unreadCount: number;
    }) => {
      setConversations((previousConversations) =>
        previousConversations
          .map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }

            return {
              ...conversation,
              lastMessage,
              updatedAt,
              unreadCounts: {
                ...conversation.unreadCounts,
                [currentUser.uid]: unreadCount,
              },
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime()
          )
      );
    };

    /*
     * Rejoin the currently selected conversation whenever
     * Socket.IO connects or reconnects.
     *
     * Socket.IO rooms are lost when the connection is recreated,
     * so we must join the room again.
     */
    const handleSocketConnect = () => {
      const conversationId =
        selectedConversationIdRef.current;

      if (conversationId) {
        socketRef.current?.emit("joinConversation", {
          conversationId,
        });
      }
    };

    const setupSocket = async () => {
      try {
        const socket = await connectChatSocket();

        if (!active) {
          return;
        }

        attachedSocket = socket;
        socketRef.current = socket;

        socket.on("userOnline", handleUserOnline);
        socket.on("userOffline", handleUserOffline);
        socket.on("onlineUsers", handleOnlineUsers);
        socket.on("newMessage", handleNewMessage);
        socket.on(
          "conversationUpdated",
          handleConversationUpdated
        );
        socket.on("chatError", handleChatError);

        // Rejoin selected conversation after reconnect.
        socket.on("connect", handleSocketConnect);

        /*
         * If the socket is already connected when the listener
         * is attached, join the current conversation immediately.
         */
        if (socket.connected) {
          handleSocketConnect();
        }
      } catch (err) {
        console.error("Socket connection failed:", err);

        if (active) {
          setError("Unable to connect to chat.");
        }
      }
    };

    setupSocket();

    return () => {
      active = false;

      if (attachedSocket) {
        attachedSocket.off(
          "userOnline",
          handleUserOnline
        );

        attachedSocket.off(
          "userOffline",
          handleUserOffline
        );

        attachedSocket.off(
          "onlineUsers",
          handleOnlineUsers
        );

        attachedSocket.off(
          "newMessage",
          handleNewMessage
        );

        attachedSocket.off(
          "conversationUpdated",
          handleConversationUpdated
        );

        attachedSocket.off(
          "connect",
          handleSocketConnect
        );

        attachedSocket.off(
          "chatError",
          handleChatError
        );

        socketRef.current = null;
      }

      disconnectChatSocket();
      setOnlineUsers(new Set());
    };
  }, [currentUser]);

  // Load messages and mark conversation as read
  useEffect(() => {
    if (!currentUser || !selectedConversationId) {
      setMessages([]);
      return;
    }

    let active = true;
    const conversationId = selectedConversationId;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");
        setMessages([]);

        const response = await api.get(
          `/users/conversations/${conversationId}/messages`
        );

        if (!active) return;

        setMessages(response.data.messages || []);

        await api.patch(
          `/users/conversations/${conversationId}/read`
        );

        if (!active) return;

        setConversations((previousConversations) =>
          previousConversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unreadCounts: {
                    ...conversation.unreadCounts,
                    [currentUser.uid]: 0,
                  },
                }
              : conversation
          )
        );
      } catch (err) {
        console.error("Failed to load messages:", err);

        if (active) {
          setError("Unable to load messages.");
        }
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [selectedConversationId, currentUser]);

  // Join the selected conversation without reconnecting the socket
  useEffect(() => {
    if (!selectedConversationId) return;

    let active = true;

    const joinConversation = async () => {
      try {
        const socket = await connectChatSocket();

        if (!active) return;

        socketRef.current = socket;

        /*
         * If socket is connected, join immediately.
         *
         * If it is reconnecting, handleSocketConnect in the
         * socket setup effect will join it once connected.
         */
        if (socket.connected) {
          socket.emit("joinConversation", {
            conversationId: selectedConversationId,
          });
        }
      } catch (err) {
        console.error("Failed to join conversation:", err);

        if (active) {
          setError("Unable to join this conversation.");
        }
      }
    };

    joinConversation();

    return () => {
      active = false;
    };
  }, [selectedConversationId]);

  const handleSendMessage = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || !selectedConversationId) {
      return;
    }

    try {
      setError("");

      const socket = await connectChatSocket();

      socketRef.current = socket;

      if (!socket.connected) {
        setError("Chat is reconnecting. Please try again.");
        return;
      }

      socket.emit(
        "sendMessage",
        {
          conversationId: selectedConversationId,
          text: cleanMessage,
        },
        (response: {
          success: boolean;
          message?: string;
          messageId?: string;
        }) => {
          if (!response.success) {
            setError(
              response.message ||
                "Message could not be sent."
            );
            return;
          }

          setMessage("");
        }
      );
    } catch (err) {
      console.error("Failed to send message:", err);

      setError(
        "Unable to send message. Please try again."
      );
    }
  };

  if (!currentUser) return null;

  const selectedUserId = selectedConversation
    ? getOtherUserId(selectedConversation)
    : null;

  const selectedUserOnline = selectedUserId
    ? onlineUsers.has(selectedUserId)
    : false;

  return (
    <div className="chat-page">
      <div className="page-heading">
        <div>
          <h1>Chat</h1>
          <p>
            Communicate with your skill exchange partners.
          </p>
        </div>
      </div>

      <div className="chat-container">
        <div className="conversation-panel">
          <div className="conversation-header">
            <h2>Messages</h2>
          </div>

          <div className="conversation-list">
            {loadingConversations ? (
              <div className="chat-empty-state">
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="chat-empty-state">
                <p>No conversations yet.</p>

                <small>
                  Conversations become available after an
                  exchange request is accepted.
                </small>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUserName =
                  getOtherUserName(conversation);

                const otherUserId =
                  getOtherUserId(conversation);

                const unreadCount =
                  conversation.unreadCounts?.[
                    currentUser.uid
                  ] || 0;

                const isOnline = otherUserId
                  ? onlineUsers.has(otherUserId)
                  : false;

                return (
                  <button
                    key={conversation.id}
                    className={`conversation-item ${
                      selectedConversationId ===
                      conversation.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedConversationId(
                        conversation.id
                      )
                    }
                  >
                    <div className="chat-avatar">
                      {otherUserName
                        .charAt(0)
                        .toUpperCase()}

                      {isOnline && (
                        <span className="online-dot" />
                      )}
                    </div>

                    <div className="conversation-info">
                      <strong>{otherUserName}</strong>

                      <small>
                        {conversation.lastMessage ||
                          conversation.skillName}
                      </small>
                    </div>

                    {unreadCount > 0 && (
                      <span className="unread-badge">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="chat-panel">
          {!selectedConversation ? (
            <div className="chat-empty-state large">
              <h2>Select a conversation</h2>

              <p>
                Choose an exchange partner from the messages
                list to start chatting.
              </p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-avatar large">
                  {getOtherUserName(selectedConversation)
                    .charAt(0)
                    .toUpperCase()}

                  {selectedUserOnline && (
                    <span className="online-dot" />
                  )}
                </div>

                <div>
                  <h2>
                    {getOtherUserName(
                      selectedConversation
                    )}
                  </h2>

                  <p>
                    {selectedUserOnline
                      ? "Online"
                      : selectedConversation.skillName}
                  </p>
                </div>
              </div>

              {error && (
                <div className="chat-error">
                  {error}
                </div>
              )}

              <div className="messages-area">
                {loadingMessages ? (
                  <div className="chat-empty-state">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-state">
                    <p>No messages yet.</p>

                    <small>
                      Send a message to start the
                      conversation.
                    </small>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      msg.senderId === currentUser.uid;

                    return (
                      <div
                        key={msg.id}
                        className={`message-row ${
                          isMine
                            ? "my-message"
                            : "their-message"
                        }`}
                      >
                        <div className="message-bubble">
                          <p>{msg.text}</p>

                          <span>
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                className="message-input-area"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  maxLength={2000}
                />

                <button
                  type="submit"
                  disabled={!message.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;