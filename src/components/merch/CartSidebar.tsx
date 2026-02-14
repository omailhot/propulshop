import { CreditCard, Minus, Plus, ShoppingBasket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MerchCopy } from '@/config/merch-copy'
import type { ProductVariantGroup, StoreLocale } from '@/types/merch'

type CartLine = {
  id: string
  quantity: number
  lineTotal: number
  selectedOptions: Record<string, string>
  product: {
    name: Record<StoreLocale, string>
    variantGroups?: ProductVariantGroup[]
  }
}

type CartSidebarProps = {
  t: MerchCopy
  locale: StoreLocale
  cartLines: CartLine[]
  subtotal: number
  creditUsed: number
  creditRemaining: number
  walletToPay: number
  formatCurrency: Intl.NumberFormat
  onResetCart: () => void
  onRemoveItem: (cartItemId: string) => void
  onUpdateItemQuantity: (cartItemId: string, nextQuantity: number) => void
}

export function CartSidebar({
  t,
  locale,
  cartLines,
  subtotal,
  creditUsed,
  creditRemaining,
  walletToPay,
  formatCurrency,
  onResetCart,
  onRemoveItem,
  onUpdateItemQuantity,
}: CartSidebarProps) {
  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <Card className="border-orange-200/50 shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{t.cartBuilder}</CardTitle>
            <p className="text-xs text-muted-foreground">{t.policy}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onResetCart}>
            {t.resetCart}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="cart-scrollbar max-h-[44vh] space-y-3 overflow-auto pr-1">
            {cartLines.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <ShoppingBasket className="mx-auto mb-2 size-5 text-muted-foreground" />
                <p className="font-medium">{t.emptyCart}</p>
                <p className="text-sm text-muted-foreground">{t.addFromCatalog}</p>
              </div>
            ) : (
              cartLines.map((line) => {
                const variantLabels = (line.product.variantGroups ?? [])
                  .map((group) => {
                    const selectedOption = group.options.find(
                      (option) => option.id === line.selectedOptions[group.id],
                    )
                    if (!selectedOption) {
                      return null
                    }
                    return `${group.label[locale]}: ${selectedOption.label[locale]}`
                  })
                  .filter((value): value is string => Boolean(value))

                return (
                  <div key={line.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{line.product.name[locale]}</p>
                        {variantLabels.length > 0 ? (
                          <p className="text-xs text-muted-foreground">
                            {variantLabels.join(' | ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="font-medium">{formatCurrency.format(line.lineTotal)}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => onUpdateItemQuantity(line.id, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => onUpdateItemQuantity(line.id, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => onRemoveItem(line.id)}>
                        {t.removeItem}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span>{formatCurrency.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.creditUsed}</span>
                <span>-{formatCurrency.format(creditUsed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.walletToPay}</span>
                <span className="font-semibold">{formatCurrency.format(walletToPay)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.creditRemaining}</span>
                <span>{formatCurrency.format(creditRemaining)}</span>
              </div>
            </div>
            <Button className="mt-4 w-full">
              <CreditCard className="size-4" />
              {t.checkout}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">{t.checkoutHint}</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
