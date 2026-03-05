"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addStackToCart } from "@/actions/stacks"
import { cn } from "@/lib/utils"

interface AddStackToCartButtonProps {
  stackId: string
  inStock: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  stackName?: string
  stackImage?: string | null
  stackPrice?: string
}

export function AddStackToCartButton({ stackId, inStock, size = "md", className, stackName, stackImage, stackPrice }: AddStackToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast, cartToast } = useToast()

  function handleClick() {
    startTransition(async () => {
      const result = await addStackToCart(stackId)
      if (result.error) {
        toast(result.error, "error")
      } else if (stackName && stackPrice) {
        cartToast({
          name: stackName,
          image: stackImage,
          price: stackPrice,
        })
      } else {
        toast("Stack added to cart!")
      }
    })
  }

  return (
    <Button
      size={size}
      className={cn(
        "border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]",
        className
      )}
      disabled={!inStock || isPending}
      onClick={handleClick}
    >
      {isPending ? "Adding..." : inStock ? "Add Stack to Cart" : "Out of Stock"}
    </Button>
  )
}
