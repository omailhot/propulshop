import { LogOut, User2, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { COMPANY_CREDIT } from '@/config/merch-store'
import type { MerchCopy } from '@/config/merch-copy'

type ProfileSectionProps = {
  t: MerchCopy
  sessionEmail: string
  formatCurrency: Intl.NumberFormat
  creditUsed: number
  creditRemaining: number
  walletToPay: number
  onLogout: () => void
}

export function ProfileSection({
  t,
  sessionEmail,
  formatCurrency,
  creditUsed,
  creditRemaining,
  walletToPay,
  onLogout,
}: ProfileSectionProps) {
  return (
    <section className="mt-5 grid gap-5 lg:grid-cols-2">
      <Card className="border-orange-200/50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User2 className="size-4" />
            {t.profileTitle}
          </CardTitle>
          <CardDescription>{t.profileSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">{t.loggedInAs}</p>
            <p className="font-medium">{sessionEmail}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="size-4" />
            {t.logout}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-orange-200/50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-4" />
            {t.walletTitle}
          </CardTitle>
          <CardDescription>{t.walletSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.creditAvailable}</span>
            <span>{formatCurrency.format(COMPANY_CREDIT)}</span>
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
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">{t.policy}</p>
        </CardContent>
      </Card>
    </section>
  )
}
