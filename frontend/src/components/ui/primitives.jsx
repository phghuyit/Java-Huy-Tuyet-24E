"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (<DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-void/55 backdrop-blur-[2px]", "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out", className)} {...props}/>));
DialogOverlay.displayName = "DialogOverlay";
export const DialogContent = React.forwardRef(({ className, children, hideClose, ...props }, ref) => (<DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-ink/10 bg-paper shadow-[0_30px_80px_-40px_rgba(17,17,15,0.5)] focus:outline-none", "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out", className)} {...props}>
      {children}
      {hideClose ? null : (<DialogPrimitive.Close aria-label="Close" className="absolute right-4 top-4 text-ink/40 transition-colors hover:text-ink focus:outline-none">
          <X className="size-4"/>
        </DialogPrimitive.Close>)}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>));
DialogContent.displayName = "DialogContent";
export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef(({ className, ...props }, ref) => (<TabsPrimitive.List ref={ref} className={cn("flex items-center gap-6 border-b", className)} {...props}/>));
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (<TabsPrimitive.Trigger ref={ref} className={cn("eyebrow relative -mb-px border-b border-transparent py-3.5 text-ink/40 transition-colors duration-200 hover:text-ink/70 focus-visible:outline-none", "data-[state=active]:border-ink data-[state=active]:text-ink", "[[data-tone=dark]_&]:text-paper/35 [[data-tone=dark]_&]:hover:text-paper/70", "[[data-tone=dark]_&]:data-[state=active]:border-champagne [[data-tone=dark]_&]:data-[state=active]:text-paper", className)} {...props}/>));
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = TabsPrimitive.Content;
export const Switch = React.forwardRef(({ className, ...props }, ref) => (<SwitchPrimitive.Root ref={ref} className={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border transition-colors duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40", "border-ink/20 data-[state=checked]:border-champagne data-[state=checked]:bg-champagne", "[[data-tone=dark]_&]:border-paper/20", className)} {...props}>
    <SwitchPrimitive.Thumb className={cn("pointer-events-none block size-3.5 bg-ink transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]", "translate-x-[3px] data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-void", "[[data-tone=dark]_&]:bg-paper/60 [[data-tone=dark]_&]:data-[state=checked]:bg-void")}/>
  </SwitchPrimitive.Root>));
Switch.displayName = "Switch";
export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export function Tooltip({ content, children, side = "top", }) {
    return (<TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content side={side} sideOffset={8} className="z-[60] border border-paper/10 bg-void px-2.5 py-1.5 text-[0.6875rem] tracking-wide text-paper/90 shadow-lg data-[state=delayed-open]:animate-fade-in">
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>);
}
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (<SelectPrimitive.Trigger ref={ref} className={cn("inline-flex h-9 items-center justify-between gap-2 border px-3 text-[0.75rem] tracking-wide transition-colors focus:outline-none disabled:opacity-40", "border-ink/15 text-ink hover:border-ink/35", "[[data-tone=dark]_&]:border-paper/12 [[data-tone=dark]_&]:text-paper/80 [[data-tone=dark]_&]:hover:border-paper/30", className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-3.5 opacity-50"/>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>));
SelectTrigger.displayName = "SelectTrigger";
export const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (<SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} position={position} sideOffset={4} className={cn("z-[70] min-w-[9rem] overflow-hidden border border-ink/10 bg-paper shadow-[0_20px_50px_-30px_rgba(17,17,15,0.6)]", className)} {...props}>
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>));
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (<SelectPrimitive.Item ref={ref} className={cn("relative flex cursor-pointer select-none items-center justify-between gap-3 px-3 py-2 text-[0.8125rem] text-ink/75 outline-none data-[highlighted]:bg-ink data-[highlighted]:text-ivory", className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator>
      <Check className="size-3.5"/>
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>));
SelectItem.displayName = "SelectItem";
