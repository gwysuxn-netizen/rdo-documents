import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-9 sm:h-10 w-full rounded-lg border-2 border-gray-300/40 bg-white/50 backdrop-blur px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/30 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 font-light ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
