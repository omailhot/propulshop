import { createFileRoute } from '@tanstack/react-router'
import { type FormEvent, useMemo } from 'react'

import { AppTopPanel } from '@/components/merch/AppTopPanel'
import { CartSidebar } from '@/components/merch/CartSidebar'
import { CatalogSection } from '@/components/merch/CatalogSection'
import { LoginPanel } from '@/components/merch/LoginPanel'
import { ProductDetailsModal } from '@/components/merch/ProductDetailsModal'
import { ProfileSection } from '@/components/merch/ProfileSection'
import { ToastStack } from '@/components/merch/ToastStack'
import Header from '@/components/Header'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { merchCopy } from '@/config/merch-copy'
import { LOGIN_DOMAIN, products } from '@/config/merch-store'
import { useMerchStore } from '@/hooks/use-merch-store'
import { getLocale } from '@/paraglide/runtime'
import type { StoreLocale } from '@/types/merch'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const locale: StoreLocale = getLocale() === 'fr' ? 'fr' : 'en'
  const t = merchCopy[locale]

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
        style: 'currency',
        currency: 'CAD',
      }),
    [locale],
  )

  const {
    state: {
      sessionEmail,
      loginEmail,
      loginError,
      activeTab,
      search,
      activeProductId,
      toastQueue,
    },
    derived: {
      cartLines,
      subtotal,
      creditUsed,
      creditRemaining,
      walletToPay,
      activeProduct,
    },
    actions: {
      setLoginEmail,
      setLoginError,
      setActiveTab,
      setSearch,
      setActiveProductId,
      addToCart,
      quickAdd,
      removeCartItem,
      updateCartItemQuantity,
      resetCart,
      enqueueToast,
      login,
      logout,
    },
  } = useMerchStore(products)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const searchableText =
        `${product.name[locale]} ${product.description[locale]}`.toLowerCase()
      const matchesSearch =
        query.length === 0 || searchableText.includes(query.toLowerCase())
      return matchesSearch
    })
  }, [locale, search])

  const loginErrorMessage = useMemo(() => {
    if (loginError === 'invalid_email') {
      return t.invalidEmail
    }
    if (loginError === 'invalid_domain') {
      return t.invalidDomain
    }
    return null
  }, [loginError, t.invalidDomain, t.invalidEmail])

  const onLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = loginEmail.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      setLoginError('invalid_email')
      return
    }
    if (!email.endsWith(LOGIN_DOMAIN)) {
      setLoginError('invalid_domain')
      return
    }
    login(email)
  }

  const onLoginEmailChange = (value: string) => {
    setLoginEmail(value)
    setLoginError(null)
  }

  const onQuickAdd = (productId: string) => {
    const product = products.find((item) => item.id === productId)
    if (!product) {
      return
    }

    if ((product.variantGroups ?? []).length > 0) {
      setActiveProductId(productId)
      return
    }

    quickAdd(productId)
    enqueueToast(t.addedToCart)
  }

  if (!sessionEmail) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,160,0,0.25),transparent_45%),radial-gradient(circle_at_80%_12%,rgba(255,0,53,0.2),transparent_40%)]">
        <div className="mx-auto flex max-w-[96rem] justify-end px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[96rem] items-center justify-center px-4 pb-16 sm:px-6">
          <LoginPanel
            t={t}
            email={loginEmail}
            error={loginErrorMessage}
            onEmailChange={onLoginEmailChange}
            onSubmit={onLoginSubmit}
          />
        </div>
      </main>
    )
  }

  return (
    <>
      <Header title={t.appTitle} subtitle={t.appSubtitle} />

      <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_14%_6%,rgba(255,160,0,0.23),transparent_34%),radial-gradient(circle_at_75%_0%,rgba(255,0,53,0.16),transparent_35%)] pb-6">
        <div className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
          <AppTopPanel t={t} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'catalog' ? (
            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <CatalogSection
                t={t}
                locale={locale}
                search={search}
                filteredProducts={filteredProducts}
                formatCurrency={formatCurrency}
                onSearchChange={setSearch}
                onOpenProduct={setActiveProductId}
                onQuickAdd={onQuickAdd}
              />
              <CartSidebar
                t={t}
                locale={locale}
                cartLines={cartLines}
                subtotal={subtotal}
                creditUsed={creditUsed}
                creditRemaining={creditRemaining}
                walletToPay={walletToPay}
                formatCurrency={formatCurrency}
                onResetCart={resetCart}
                onRemoveItem={removeCartItem}
                onUpdateItemQuantity={updateCartItemQuantity}
              />
            </div>
          ) : (
            <ProfileSection
              t={t}
              sessionEmail={sessionEmail}
              formatCurrency={formatCurrency}
              creditUsed={creditUsed}
              creditRemaining={creditRemaining}
              walletToPay={walletToPay}
              onLogout={logout}
            />
          )}
        </div>
      </main>

      <ProductDetailsModal
        t={t}
        locale={locale}
        product={activeProduct}
        open={Boolean(activeProductId)}
        formatCurrency={formatCurrency}
        onClose={() => setActiveProductId(null)}
        onAddToCart={({ productId, selectedOptions, quantity }) => {
          addToCart(productId, selectedOptions, quantity)
          enqueueToast(t.addedToCart)
        }}
      />

      <ToastStack toasts={toastQueue} />
    </>
  )
}
