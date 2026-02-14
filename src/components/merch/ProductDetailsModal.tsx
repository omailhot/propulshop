import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ProductImageCarousel } from '@/components/merch/ProductImageCarousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import type { MerchCopy } from '@/config/merch-copy'
import { cn } from '@/lib/utils'
import type { Product, StoreLocale } from '@/types/merch'

type ProductDetailsModalProps = {
  t: MerchCopy
  locale: StoreLocale
  product: Product | null
  open: boolean
  formatCurrency: Intl.NumberFormat
  onClose: () => void
  onAddToCart: (input: {
    productId: string
    selectedOptions: Record<string, string>
    quantity: number
  }) => void
}

const getDefaultSelections = (product: Product | null) =>
  Object.fromEntries(
    (product?.variantGroups ?? []).map((group) => [group.id, group.options[0]?.id ?? '']),
  )

export function ProductDetailsModal({
  t,
  locale,
  product,
  open,
  formatCurrency,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setSelections(getDefaultSelections(product))
    setQuantity(1)
  }, [product?.id])

  const canRender = Boolean(product)
  const variantGroups = product?.variantGroups ?? []

  const selectedVariantLabels = useMemo(
    () =>
      variantGroups
        .map((group) => {
          const selected = group.options.find(
            (option) => option.id === selections[group.id],
          )
          if (!selected) {
            return null
          }
          return `${group.label[locale]}: ${selected.label[locale]}`
        })
        .filter((value): value is string => Boolean(value)),
    [locale, selections, variantGroups],
  )

  const addSelectionToCart = () => {
    if (!product) {
      return
    }

    onAddToCart({
      productId: product.id,
      selectedOptions: selections,
      quantity,
    })
    onClose()
  }

  return (
    <Drawer open={open} onClose={onClose} title={t.productDetails}>
      {canRender ? (
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{product.name[locale]}</h2>
              <p className="text-sm text-muted-foreground">{product.description[locale]}</p>
              <p className="mt-2 text-base font-semibold">
                {formatCurrency.format(product.price)}
              </p>
              {selectedVariantLabels.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVariantLabels.map((label) => (
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <ProductImageCarousel
              id={product.id}
              alt={product.name[locale]}
              imageGallery={product.imageGallery}
              gradientClass={product.gradientClass}
              className="h-64 border"
            />

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              {variantGroups.length > 0 ? (
                variantGroups.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 text-sm font-medium">{group.label[locale]}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const selected = selections[group.id] === option.id
                        return (
                          <Button
                            key={option.id}
                            size="sm"
                            variant={selected ? 'default' : 'outline'}
                            className={cn(
                              'gap-2',
                              selected ? '' : 'text-foreground',
                            )}
                            onClick={() =>
                              setSelections((previous) => ({
                                ...previous,
                                [group.id]: option.id,
                              }))
                            }
                          >
                            {group.type === 'color' && option.swatchHex ? (
                              <span
                                className="inline-block h-3 w-3 rounded-full border"
                                style={{ backgroundColor: option.swatchHex }}
                              />
                            ) : null}
                            {option.label[locale]}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.quantity}</span>
                <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-7 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setQuantity((value) => Math.min(25, value + 1))}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={addSelectionToCart}>
                {t.addSelection}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  )
}
