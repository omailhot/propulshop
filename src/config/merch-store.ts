import type { Category, Product } from '@/types/merch'

export const COMPANY_CREDIT = 150

export const categoryOrder: Array<'all' | Category> = [
  'all',
  'wearables',
  'desk',
  'travel',
  'lifestyle',
]

export const products: Product[] = [
  {
    id: 'team-tee',
    category: 'wearables',
    price: 28,
    gradientClass: 'from-amber-300/35 via-orange-400/25 to-red-500/20',
    imageGallery: ['/merch/shirt_1.png'],
    variantGroups: [
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 's', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
        ],
      },
    ],
    name: {
      en: 'Team Tee',
      fr: 'T-shirt équipe',
    },
    description: {
      en: 'Soft cotton tee with minimal chest signature.',
      fr: 'T-shirt en coton doux avec signature minimaliste sur la poitrine.',
    },
  },
  {
    id: 'zip',
    category: 'wearables',
    price: 66,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-red-600/20',
    imageGallery: ['/merch/vest_1.png', '/merch/vest_2.png'],
    variantGroups: [
      {
        id: 'fit',
        label: { en: 'Model', fr: 'Modèle' },
        type: 'select',
        options: [
          { id: 'men', label: { en: 'Men', fr: 'Homme' } },
          { id: 'women', label: { en: 'Women', fr: 'Femme' } },
        ],
      },
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 'xs', label: { en: 'XS', fr: 'XS' } },
          { id: 's', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
          { id: 'xl', label: { en: 'XL', fr: 'XL' } },
        ],
      },
    ],
    name: {
      en: 'Quarter Zip',
      fr: 'Chandail quarter zip',
    },
    description: {
      en: 'Layer-ready top for hybrid work and travel.',
      fr: 'Haut idéal pour le travail hybride et les déplacements.',
    },
  },
  {
    id: 'bottle',
    category: 'travel',
    price: 32,
    gradientClass: 'from-orange-300/35 via-rose-500/25 to-red-700/20',
    imageGallery: [
      '/merch/yeti_black_1.png',
      '/merch/yeti_black_2.png',
      '/merch/yeti_red_1.png',
      '/merch/yeti_red_2.png',
    ],
    variantGroups: [
      {
        id: 'color',
        label: { en: 'Color', fr: 'Couleur' },
        type: 'color',
        options: [
          {
            id: 'black',
            label: { en: 'Black', fr: 'Noir' },
            swatchHex: '#1f1f1f',
          },
          {
            id: 'red',
            label: { en: 'Red', fr: 'Rouge' },
            swatchHex: '#d90b2f',
          },
        ],
      },
    ],
    name: {
      en: 'Insulated Bottle',
      fr: 'Bouteille isotherme',
    },
    description: {
      en: '750ml insulated bottle for office or commute.',
      fr: 'Bouteille isotherme 750 ml pour le bureau ou les trajets.',
    },
  },
  {
    id: 'backpack',
    category: 'travel',
    price: 92,
    gradientClass: 'from-amber-300/35 via-red-500/25 to-red-700/20',
    imageGallery: ['/merch/bag_1.png', '/merch/bag_2.png'],
    name: {
      en: 'Travel Backpack',
      fr: 'Sac à dos voyage',
    },
    description: {
      en: 'Team backpack with laptop compartment and cable pockets.',
      fr: 'Sac équipe avec compartiment ordinateur et poches pour câbles.',
    },
  },
  {
    id: 'notebooks',
    category: 'lifestyle',
    price: 18,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-pink-600/20',
    imageGallery: ['/merch/beanie_1.png'],
    name: {
      en: 'Knit Beanie',
      fr: 'Tuque tricotée',
    },
    description: {
      en: 'Warm beanie for colder days.',
      fr: 'Tuque chaude pour les journées froides.',
    },
  },
  {
    id: 'mug',
    category: 'lifestyle',
    price: 16,
    gradientClass: 'from-orange-300/35 via-red-400/25 to-pink-600/20',
    imageGallery: ['/merch/cap_1.png'],
    name: {
      en: 'Athletic Cap',
      fr: 'Casquette athlétique',
    },
    description: {
      en: 'Breathable cap with athletic fit.',
      fr: 'Casquette respirante avec coupe sportive.',
    },
  },
]
