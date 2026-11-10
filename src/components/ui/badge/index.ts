import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

/*
 * Les pastilles sont l'exception au rayon unique: ce sont des pilules.
 * Aucune variante n'utilise l'orange, qui ne porte jamais de texte.
 */
export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-ring/40 focus-visible:ring-[3px] transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary-hover",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "border-border bg-card text-foreground",
        success:
          "border-transparent bg-vert-pale text-vert",
        warning:
          "border-transparent bg-ocre-pale text-encre",
        danger:
          "border-transparent bg-bordeaux-pale text-bordeaux",
        brand:
          "border-transparent bg-braise-pale text-braise",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
