"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export function RightDrawer({ open, onOpenChange, title, eyebrow, children, footer, width = "max-w-[30rem]", }) {
    return (<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-void/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"/>
        <DialogPrimitive.Content data-tone="dark" className={cn("fixed right-0 top-0 z-50 flex h-dvh w-full flex-col border-l border-paper/10 bg-char text-paper shadow-[-30px_0_80px_-40px_rgba(0,0,0,0.8)] focus:outline-none", "data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out", width)}>
          <header className="flex items-start justify-between gap-4 border-b border-paper/10 px-6 py-5">
            <div className="min-w-0">
              {eyebrow ? (<div className="eyebrow mb-2 text-champagne">{eyebrow}</div>) : null}
              <DialogPrimitive.Title className="truncate font-display text-[1.75rem] leading-none tracking-tight">
                {title}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close aria-label="Đóng bảng chi tiết" className="-mr-1 shrink-0 p-1 text-paper/40 transition-colors hover:text-paper focus:outline-none">
              <X className="size-4"/>
            </DialogPrimitive.Close>
          </header>
          <DialogPrimitive.Description className="sr-only">Xem và chỉnh sửa thông tin tại VELA.</DialogPrimitive.Description>

          <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>

          {footer ? (<footer className="border-t border-paper/10 px-6 py-4">{footer}</footer>) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>);
}
