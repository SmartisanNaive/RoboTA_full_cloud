"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bot, X } from "lucide-react"

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  // Initialize with default values that will be updated in useEffect
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)

  // Initialize position on client side
  useEffect(() => {
    setIsMounted(true)
    setPosition({ 
      x: window.innerWidth - 80, 
      y: window.innerHeight - 80 
    })

    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60),
      }))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Apply bounds
        const maxX = window.innerWidth - 60
        const maxY = window.innerHeight - 60

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // Close the chat when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Calculate chat position
  const getChatPosition = () => {
    if (!isMounted) return {}
    
    // Position chat to the left of the button
    const chatWidth = 450 // Increased width

    // If button is too close to the left edge, position chat to the right
    if (position.x < chatWidth + 20) {
      return {
        left: `${position.x}px`,
        bottom: `${window.innerHeight - position.y + 20}px`,
      }
    }

    // Otherwise position to the left
    return {
      right: `${window.innerWidth - position.x + 20}px`,
      bottom: `${window.innerHeight - position.y + 20}px`,
    }
  }

  // Only render the full component after mounting
  if (!isMounted) {
    return null // Return nothing during SSR
  }

  return (
    <>
      {/* Custom draggable floating button - MODIFIED */}
      <div
        ref={buttonRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 50,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <Button
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-transform hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* 可调整大小的聊天窗口 */}
      {isOpen && (
        <div 
          className="fixed z-50" 
          ref={chatRef} 
          style={getChatPosition()}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
            style={{
              resize: 'both',
              overflow: 'hidden',
              minWidth: '400px',
              minHeight: '500px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: '450px',
              height: '700px',
              position: 'relative'
            }}
          >
            <div className="flex items-center justify-between p-2 bg-blue-600 text-white">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-700 text-white"
                  onClick={() => {
                    const container = chatRef.current?.querySelector('div');
                    if (container) {
                      container.style.width = '450px';
                      container.style.height = '700px';
                    }
                  }}
                  aria-label="Reset Size"
                  title="Reset Size"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-700 text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 relative">
              <iframe
                src="https://udify.app/chat/GVxVEMYnwR4WhX5w"
                style={{ 
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: '-40px',
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                frameBorder="0"
                allow="microphone"
                title="Synbio Assistant Chatbot"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 opacity-70 hover:opacity-100 cursor-se-resize" style={{ pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 17 17 17 17 7"></polyline>
              </svg>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

