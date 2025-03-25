import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { toast } from "react-toastify";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  // console.log(roomId);
  // console.log(currentUser);
  // console.log(connected);

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  //page init:
  //messages ko load karne honge

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        // console.log(messages);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  //scroll down

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //stompClient ko init karne honge
  //subscribe

  useEffect(() => {
    const connectWebSocket = () => {
      ///SockJS
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

          //rest of the work after success receiving the message
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    //stomp client
  }, [roomId]);

  //send message handle

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);

      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }

    //
  };

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }


  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Room: <span className="text-blue-600 dark:text-blue-400">{roomId}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connected as: <span className="font-medium">{currentUser}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center text-sm font-medium"
        >
          Leave Room
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

{/* Chat Messages */}
<main
  ref={chatBoxRef}
  className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-gray-50 dark:bg-gray-900"
>
  {messages.map((message, index) => {
    // Normalize and clean both values for comparison
    const cleanCurrentUser = currentUser?.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSender = message.sender?.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const isCurrentUser = cleanCurrentUser === cleanSender;

    return (
      <div
        key={`${message.timeStamp}-${index}`}
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[80%] md:max-w-[60%] p-3 rounded-xl ${
            isCurrentUser
              ? "bg-blue-500 text-white" // Current user - blue
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" // Others - gray
          } shadow-sm`}
        >
          <div className="flex items-start gap-3">
            {/* Other user's avatar (left side) */}
            {!isCurrentUser && (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={`https://avatar.iran.liara.run/username?username=${message.sender}`}
                alt="avatar"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm font-medium ${
                    isCurrentUser ? "text-blue-100" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {message.sender}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(message.timeStamp)}
                </span>
              </div>
              <p className="text-sm break-words">{message.content}</p>
            </div>

            {/* Current user's avatar (right side) */}
            {isCurrentUser && (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={`https://avatar.iran.liara.run/username?username=${currentUser}`}
                alt="avatar"
              />
            )}
          </div>
        </div>
      </div>
    );
  })}
</main>
      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 text-gray-500 dark:text-gray-400">
            <MdAttachFile className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="w-full px-4 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16 transition-all duration-200"
            />
            
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;