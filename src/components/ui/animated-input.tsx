"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils/cn"

export interface OrbInputProps {
  value?: string
  onChange?: (value: string) => void
  onSend?: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  charDelay?: number
  idleDelay?: number
}

/**
 * OrbInput — animated, typing-placeholder chat input.
 *
 * Renders a pill-shaped input shell with an animated orb avatar and a
 * rotating placeholder that types itself out character-by-character, then
 * pauses and advances to the next placeholder.
 *
 * Designed to slot into the Radiance chat composer as the empty-state hero
 * input. All timing is driven by refs so StrictMode double-invokes in dev
 * never leak intervals.
 */
export function OrbInput({
  value,
  onChange,
  onSend,
  placeholder,
  className,
  inputClassName,
  charDelay = 75,
  idleDelay = 2200,
}: OrbInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? "")
  const [isFocused, setIsFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const isControlled = value !== undefined
  const current = isControlled ? value : internalValue

  const setValue = (next: string) => {
    if (isControlled) {
      onChange?.(next)
    } else {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  // Keep the placeholders stable across renders
  const placeholders = useMemo(
    () => [
      placeholder ?? "Ask anything...",
      "What's on your mind?",
      "How can I help you?",
      "What would you like to know?",
    ],
    [placeholder]
  )

  // Refs to hold active timers so they can be cleaned up
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // clear any stale timers (helps with StrictMode double-invoke in dev)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const currentPlaceholder = placeholders[placeholderIndex]
    if (!currentPlaceholder) {
      setDisplayedText("")
      setIsTyping(false)
      return
    }

    const chars = Array.from(currentPlaceholder)

    // reset state for a new round
    setDisplayedText("")
    setIsTyping(true)

    let charIndex = 0

    // type character-by-character using a derived slice to avoid any chance of appending undefined
    intervalRef.current = window.setInterval(() => {
      if (charIndex < chars.length) {
        const next = chars.slice(0, charIndex + 1).join("")
        setDisplayedText(next)
        charIndex += 1
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsTyping(false)

        // after a brief pause, advance to the next placeholder
        timeoutRef.current = window.setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        }, idleDelay)
      }
    }, charDelay)

    // Cleanup on unmount or when placeholderIndex changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [placeholderIndex, placeholders, charDelay, idleDelay])

  const handleSend = () => {
    const trimmed = current.trim()
    if (!trimmed) return
    onSend?.(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-4 p-6 bg-black shadow-lg transition-all duration-300 ease-out rounded-full border border-gray-300",
          isFocused
            ? "shadow-xl scale-[1.02] border-gray-600"
            : "shadow-lg"
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden transition-all duration-300 scale-100">
            <img
              src="/brand/radiance-orb.svg"
              alt="Radiance orb"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="w-px h-12 bg-gray-600" />

        <div className="flex-1 w-[500px]">
          <input
            data-testid="orb-input"
            type="text"
            value={current}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`${displayedText}${isTyping ? "|" : ""}`}
            aria-label="Ask a question"
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full text-xl text-white placeholder-gray-400 bg-transparent border-none outline-none font-light",
              inputClassName
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default OrbInput