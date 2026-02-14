export type StoreLocale = 'en' | 'fr'

export type Category = 'wearables' | 'desk' | 'travel' | 'lifestyle'

export type AppTab = 'catalog' | 'profile'

export type LoginErrorKey = 'invalid_email' | 'invalid_domain' | null

export type ProductVariantOption = {
  id: string
  label: Record<StoreLocale, string>
  swatchHex?: string
}

export type ProductVariantGroup = {
  id: string
  label: Record<StoreLocale, string>
  type: 'size' | 'color' | 'select'
  options: ProductVariantOption[]
}

export type Product = {
  id: string
  category: Category
  price: number
  gradientClass: string
  imageGallery?: string[]
  imageSrc?: string
  variantGroups?: ProductVariantGroup[]
  name: Record<StoreLocale, string>
  description: Record<StoreLocale, string>
}

export type CartItem = {
  id: string
  productId: string
  quantity: number
  selectedOptions: Record<string, string>
}
