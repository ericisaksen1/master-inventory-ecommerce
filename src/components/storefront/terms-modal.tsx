"use client"

import { useState, type ReactNode } from "react"
import { Modal } from "@/components/ui/modal"

interface TermsModalProps {
  content: string
  children: ReactNode
}

export function TermsModal({ content, children }: TermsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={(e) => { e.preventDefault(); setOpen(true) }} className="inline cursor-pointer">
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <h2 className="mb-4 pr-8 text-lg font-semibold text-foreground">Terms of Service</h2>
        <div className="max-h-[60vh] overflow-y-auto">
          <div
            className="prose prose-gray prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </Modal>
    </>
  )
}
