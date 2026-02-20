export const DEFAULT_MAX_ITEM_QUANTITY = 25;
export const GIFT_CARD_MAX_ITEM_QUANTITY = 1;

export const isGiftCardProductId = (productId: string) =>
  productId.startsWith("giftcard-");

export const getMaxQuantityForProductId = (productId: string) =>
  isGiftCardProductId(productId)
    ? GIFT_CARD_MAX_ITEM_QUANTITY
    : DEFAULT_MAX_ITEM_QUANTITY;
