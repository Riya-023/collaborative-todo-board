"use client"

import { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000")

      newSocket.on("connect", () => {
        setConnected(true)
        newSocket.emit("user-login", user)
        newSocket.emit("join-board", "main-board")
      })

      newSocket.on("disconnect", () => {
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const value = {
    socket,
    connected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
