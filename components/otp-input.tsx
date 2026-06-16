"use client"

import { useRef, type KeyboardEvent, type ClipboardEvent } from "react"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(length, " ").slice(0, length).split("")

  const setDigit = (index: number, char: string) => {
    const next = value.split("")
    next[index] = char
    onChange(next.join("").replace(/\s/g, "").slice(0, length))
  }

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1)
    if (!char) return
    setDigit(index, char)
    if (index < length - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const arr = value.split("")
      if (arr[index]) {
        arr[index] = ""
        onChange(arr.join(""))
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
        const prev = value.split("")
        prev[index - 1] = ""
        onChange(prev.join(""))
      }
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    refs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="size-11 rounded-lg border border-input bg-background text-center text-lg font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
        />
      ))}
    </div>
  )
}
