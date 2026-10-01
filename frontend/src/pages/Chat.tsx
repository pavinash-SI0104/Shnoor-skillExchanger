import { useState } from "react";

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  online: boolean;
}

function Chat() {
  const [selectedUser, setSelectedUser] = useState(1);
  const [message, setMessage] = useState("");

  const conversations: Conversation[] = [
    {
      id: 1,
      name: "Avinash",
      role: "Full Stack Developer",
      lastMessage: "Let's discuss React tomorrow.",
      online: true,
    },
    {
      id: 2,
      name: "Rahul",
      role: "Frontend Developer",
      lastMessage: "Thanks for the Python resources!",
      online: false,
    },
    {
      id: 3,
      name: "Anjali",
      role: "UI/UX Designer",
      lastMessage: "I'll share the Figma file.",
      online: true,
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "other",
      text: "Hi Supriya! Are you available for a React session?",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Yes! I would love to learn React from you.",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "Great. Let's discuss React tomorrow.",
      time: "10:35 AM",
    },
  ]);

  const currentUser = conversations.find(
    (user) => user.id === selectedUser
  );

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: "me",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="chat-page">

      {/* Page Header */}
      <div className="page-heading">
        <div>
          <h1>Chat</h1>
          <p>Communicate with your skill exchange partners.</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">

        {/* Conversations */}
        <div className="conversation-panel">

          <div className="conversation-header">
            <h2>Messages</h2>
          </div>

          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${
                  selectedUser === conversation.id ? "active" : ""
                }`}
                onClick={() => setSelectedUser(conversation.id)}
              >
                <div className="chat-avatar">
                  {conversation.name.charAt(0)}

                  {conversation.online && (
                    <span className="online-dot"></span>
                  )}
                </div>

                <div className="conversation-info">
                  <strong>{conversation.name}</strong>
                  <small>{conversation.lastMessage}</small>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Chat Area */}
        <div className="chat-panel">

          {/* Chat Header */}
          <div className="chat-header">

            <div className="chat-avatar large">
              {currentUser?.name.charAt(0)}
              {currentUser?.online && (
                <span className="online-dot"></span>
              )}
            </div>

            <div>
              <h2>{currentUser?.name}</h2>
              <p>
                {currentUser?.online ? "Online" : currentUser?.role}
              </p>
            </div>

          </div>

          {/* Messages */}
          <div className="messages-area">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${
                  msg.sender === "me" ? "my-message" : "their-message"
                }`}
              >
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span>{msg.time}</span>
                </div>
              </div>
            ))}

          </div>

          {/* Message Input */}
          <form
            className="message-input-area"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <button type="submit">
              Send
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

export default Chat;