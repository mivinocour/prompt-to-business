"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    {/* Matches live AI Studio mat-slider: 4px track (#444748), 14px knob (#ababab) */}
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full" style={{ backgroundColor: '#444748' }}>
      <SliderPrimitive.Range className="absolute h-full" style={{ backgroundColor: '#ababab' }} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-3.5 w-3.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      style={{
        backgroundColor: '#ababab',
        border: 'none',
      }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
