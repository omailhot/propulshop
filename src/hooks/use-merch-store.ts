import { useEffect, useMemo, useState } from 'react'

import { COMPANY_CREDIT, SESSION_KEY } from '@/config/merch-store'
import type {
  AppTab,
  CartItem,
  Category,
  LoginErrorKey,
  Product,
} from '@/types/merch'

type ToastMessage = {
  id: string
  message: string
}

const buildCartItemId = (
  productId: string,
  selectedOptions: Record<string, string>,
) => {
  const entries = Object.entries(selectedOptions).sort(([a], [b]) =>
    a.localeCompare(b),
  )
  const optionKey = entries.map(([key, value]) => `${key}:${value}`).join('|')
  return `${productId}::${optionKey}`
}

export function useMerchStore(products: Product[]) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState<LoginErrorKey>(null)
  const [activeTab, setActiveTab] = useState<AppTab>('catalog')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | Category>('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [dropUpdates, setDropUpdates] = useState(false)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [toastQueue, setToastQueue] = useState<ToastMessage[]>([])

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(SESSION_KEY)
    if (savedEmail) {
      setSessionEmail(savedEmail)
    }
  }, [])

  useEffect(() => {
    if (sessionEmail) {
      window.localStorage.setItem(SESSION_KEY, sessionEmail)
      return
    }
    window.localStorage.removeItem(SESSION_KEY)
  }, [sessionEmail])

  useEffect(() => {
    if (!cartOpen && !activeProductId) {
      return
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setActiveProductId(null)
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [activeProductId, cartOpen])

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const cartLines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = productById.get(item.productId)
          if (!product) {
            return null
          }

          return {
            ...item,
            product,
            lineTotal: item.quantity * product.price,
          }
        })
        .filter((line): line is NonNullable<typeof line> => line !== null),
    [cartItems, productById],
  )

  const itemCount = cartLines.reduce((total, line) => total + line.quantity, 0)
  const subtotal = cartLines.reduce((total, line) => total + line.lineTotal, 0)
  const creditUsed = Math.min(COMPANY_CREDIT, subtotal)
  const creditRemaining = Math.max(COMPANY_CREDIT - creditUsed, 0)
  const walletToPay = Math.max(subtotal - COMPANY_CREDIT, 0)

  const activeProduct = activeProductId ? productById.get(activeProductId) : null

  const addToCart = (
    productId: string,
    selectedOptions: Record<string, string>,
    quantity = 1,
  ) => {
    const normalizedQuantity = Math.max(1, Math.min(quantity, 25))
    const cartItemId = buildCartItemId(productId, selectedOptions)

    setCartItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.id === cartItemId)
      if (existingIndex === -1) {
        return [
          ...previous,
          {
            id: cartItemId,
            productId,
            quantity: normalizedQuantity,
            selectedOptions,
          },
        ]
      }

      const next = [...previous]
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: Math.min(25, next[existingIndex].quantity + normalizedQuantity),
      }
      return next
    })
  }

  const removeCartItem = (cartItemId: string) => {
    setCartItems((previous) => previous.filter((item) => item.id !== cartItemId))
  }

  const updateCartItemQuantity = (cartItemId: string, nextQuantity: number) => {
    const quantity = Math.max(0, Math.min(nextQuantity, 25))
    if (quantity === 0) {
      removeCartItem(cartItemId)
      return
    }

    setCartItems((previous) =>
      previous.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    )
  }

  const quickAdd = (productId: string) => {
    const product = productById.get(productId)
    if (!product) {
      return
    }

    const defaultOptions = Object.fromEntries(
      (product.variantGroups ?? []).map((group) => [group.id, group.options[0]?.id ?? '']),
    )

    addToCart(productId, defaultOptions, 1)
  }

  const resetCart = () => {
    setCartItems([])
  }

  const enqueueToast = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToastQueue((previous) => [...previous, { id, message }])

    window.setTimeout(() => {
      setToastQueue((previous) => previous.filter((toast) => toast.id !== id))
    }, 2300)
  }

  const login = (email: string) => {
    setSessionEmail(email)
    setLoginEmail('')
    setLoginError(null)
    setActiveTab('catalog')
  }

  const logout = () => {
    setSessionEmail(null)
    setActiveTab('catalog')
    setCartOpen(false)
    setActiveProductId(null)
    resetCart()
  }

  return {
    state: {
      sessionEmail,
      loginEmail,
      loginError,
      activeTab,
      search,
      activeCategory,
      cartOpen,
      orderUpdates,
      dropUpdates,
      activeProductId,
      toastQueue,
    },
    derived: {
      cartLines,
      itemCount,
      subtotal,
      creditUsed,
      creditRemaining,
      walletToPay,
      activeProduct,
    },
    actions: {
      setSessionEmail,
      setLoginEmail,
      setLoginError,
      setActiveTab,
      setSearch,
      setActiveCategory,
      setCartOpen,
      setOrderUpdates,
      setDropUpdates,
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
  }
}
