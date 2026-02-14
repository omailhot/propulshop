import { CheckCircle2, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MerchCopy } from '@/config/merch-copy'

type LandingHeroProps = {
  t: MerchCopy
  onOpenLogin: () => void
}

export function LandingHero({ t, onOpenLogin }: LandingHeroProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-up rounded-3xl border border-orange-200/50 bg-card/85 p-8 shadow-lg">
          <Badge className="border-0 bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
            {t.landingBadge}
          </Badge>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight">
            {t.landingTitle}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            {t.landingDescription}
          </p>
          <Button
            className="mt-6"
            onClick={onOpenLogin}
          >
            {t.landingCta}
          </Button>
        </div>

        <div className="animate-fade-up-delay space-y-3 rounded-3xl border border-orange-200/50 bg-card/85 p-8 shadow-md">
          {[t.landingBullet1, t.landingBullet2, t.landingBullet3].map((item) => (
            <div className="flex items-start gap-3 rounded-xl border bg-background/50 p-3" key={item}>
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
