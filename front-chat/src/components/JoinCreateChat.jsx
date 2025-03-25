import React, { useState } from "react";
import chatIcon from "../assets/discord.png";
import { toast } from "react-toastify";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

export const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { roomId, userName, setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId.trim() === "" || detail.userName.trim() === "") {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Successfully joined the room!");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data || "Invalid room ID");
      } else {
        toast.error("Error joining room. Please try again.");
      }
      console.error("Join room error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createRoom() {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await createRoomApi(detail.roomId);
      toast.success("Room created successfully!");
      setCurrentUser(detail.userName);
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Room already exists!");
      } else {
        toast.error("Error creating room. Please try again.");
      }
      console.error("Create room error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img 
              src={chatIcon} 
              className="w-20 h-20 object-contain" 
              alt="Chat application logo"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
            Join or Create a Chat Room
          </h1>
          
          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label 
                htmlFor="userName" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Name
              </label>
              <input
                onChange={handleFormInputChange}
                value={detail.userName}
                type="text"
                id="userName"
                name="userName"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200"
                autoComplete="off"
                required
              />
            </div>
            
            {/* Room ID Input */}
            <div>
              <label 
                htmlFor="roomId" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Room ID
              </label>
              <input
                name="roomId"
                onChange={handleFormInputChange}
                value={detail.roomId}
                type="text"
                id="roomId"
                placeholder="Enter room ID"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200"
                autoComplete="off"
                required
              />
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col space-y-3 mt-8">
              <button
                onClick={joinChat}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Joining..." : "Join Room"}
              </button>
              <button
                onClick={createRoom}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};