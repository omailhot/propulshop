import { Package, User2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MerchCopy } from '@/config/merch-copy'
import type { AppTab } from '@/types/merch'

type AppTopPanelProps = {
  t: MerchCopy
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function AppTopPanel({ t, activeTab, onTabChange }: AppTopPanelProps) {
  return (
    <section className="animate-fade-up">
      <Card className="border-orange-200/50 shadow-md">
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="mb-2 w-fit bg-primary text-primary-foreground">
              {t.appTitle}
            </Badge>
            <CardTitle className="text-2xl">{t.catalogTitle}</CardTitle>
            <CardDescription>{t.catalogSubtitle}</CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-background/80 p-1">
            <Button
              variant={activeTab === 'catalog' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('catalog')}
            >
              <Package className="size-3.5" />
              {t.tabCatalog}
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('profile')}
            >
              <User2 className="size-3.5" />
              {t.tabProfile}
            </Button>
          </div>
        </CardHeader>
      </Card>
    </section>
  )
}
