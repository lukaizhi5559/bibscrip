export function AiTypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-4 justify-center">
      <span className="sr-only">AI is typing</span>
      <div className="h-2 w-2 bg-primary rounded-full animate-typing-dot-bounce [animation-delay:-0.32s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-typing-dot-bounce [animation-delay:-0.16s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-typing-dot-bounce"></div>
    </div>
  )
}
