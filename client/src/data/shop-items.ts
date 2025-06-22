export interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'cheap' | 'medium' | 'expensive';
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export const SHOP_ITEMS: ShopItem[] = [
  // Cheap Items
  { id: 1, name: 'Taco', description: 'Delicious Mexican taco', price: 75, category: 'cheap', icon: '🌮', rarity: 'common' },
  { id: 2, name: 'Baguette', description: 'Fresh French bread', price: 130, category: 'cheap', icon: '🥖', rarity: 'common' },
  { id: 3, name: 'Pasta', description: 'Italian pasta dish', price: 280, category: 'cheap', icon: '🍝', rarity: 'common' },
  { id: 4, name: 'Cute Chibi Plushie', description: 'Adorable kawaii plushie', price: 500, category: 'cheap', icon: '🧸', rarity: 'uncommon' },
  { id: 5, name: 'Game Console', description: 'Retro gaming console', price: 800, category: 'cheap', icon: '🎮', rarity: 'uncommon' },

  // Medium Items
  { id: 6, name: 'German Cap', description: 'Traditional Bavarian hat', price: 1000, category: 'medium', icon: '🎩', rarity: 'rare' },
  { id: 7, name: 'Chocolate Bigfoot', description: 'Legendary chocolate creature', price: 1800, category: 'medium', icon: '🍫', rarity: 'rare' },
  { id: 8, name: 'Hinamatsuri Doll', description: 'Japanese festival doll', price: 2500, category: 'medium', icon: '🎎', rarity: 'rare' },
  { id: 9, name: 'Matryoshka Dolls', description: 'Russian nesting dolls set', price: 3700, category: 'medium', icon: '🪆', rarity: 'epic' },

  // Expensive Items
  { id: 10, name: 'Flying Potion', description: 'Magical levitation potion', price: 4000, category: 'expensive', icon: '🧪', rarity: 'epic' },
  { id: 11, name: 'Chinese Dragon', description: 'Majestic golden dragon', price: 10000, category: 'expensive', icon: '🐉', rarity: 'legendary' },
  { id: 12, name: 'Eiffel Tower', description: 'Miniature Parisian landmark', price: 36000, category: 'expensive', icon: '🗼', rarity: 'legendary' },
  { id: 13, name: 'Enchanted Book', description: 'Ancient magical grimoire', price: 50000, category: 'expensive', icon: '📚', rarity: 'legendary' },
  { id: 14, name: 'Private Island', description: 'Your own tropical paradise', price: 80000, category: 'expensive', icon: '🏝️', rarity: 'mythic' },
  { id: 15, name: 'Golden Retriever', description: 'Literal golden retriever companion', price: 100000, category: 'expensive', icon: '🐕', rarity: 'mythic' },
];

export const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-700',
  uncommon: 'bg-green-100 text-green-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-yellow-100 text-yellow-700',
  mythic: 'bg-red-100 text-red-700',
};
