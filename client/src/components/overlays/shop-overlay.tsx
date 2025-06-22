import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, ShoppingCart, Coins, Star, Crown, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { soundManager } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface ShopOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHOP_CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Drinks',
    icon: <Gift className="h-4 w-4" />,
    color: 'bg-orange-500'
  },
  {
    id: 'items',
    name: 'Collectibles',
    icon: <Star className="h-4 w-4" />,
    color: 'bg-purple-500'
  },
  {
    id: 'premium',
    name: 'Premium Items',
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-yellow-500'
  }
];

const SHOP_ITEMS = [
  // Cheap items (75-500 XP)
  { id: 1, name: 'Taco', price: 75, category: 'food', rarity: 'common', emoji: '🌮', description: 'Delicious Mexican taco' },
  { id: 2, name: 'Baguette', price: 130, category: 'food', rarity: 'common', emoji: '🥖', description: 'Fresh French bread' },
  { id: 3, name: 'Pasta', price: 280, category: 'food', rarity: 'common', emoji: '🍝', description: 'Italian pasta dish' },
  { id: 4, name: 'Cute Chibi Plushie', price: 500, category: 'items', rarity: 'uncommon', emoji: '🧸', description: 'Adorable plushie companion' },
  { id: 5, name: 'Game Console', price: 800, category: 'items', rarity: 'uncommon', emoji: '🎮', description: 'Retro gaming console' },
  
  // Medium items (1000-3700 XP)
  { id: 6, name: 'German Cap', price: 1000, category: 'items', rarity: 'uncommon', emoji: '🎩', description: 'Traditional German hat' },
  { id: 7, name: 'Chocolate Bigfoot', price: 1800, category: 'food', rarity: 'rare', emoji: '🍫', description: 'Legendary chocolate creature' },
  { id: 8, name: 'Hinamatsuri Doll', price: 2500, category: 'items', rarity: 'rare', emoji: '🎎', description: 'Traditional Japanese doll' },
  { id: 9, name: 'Matryoshka Dolls', price: 3700, category: 'items', rarity: 'rare', emoji: '🪆', description: 'Russian nesting dolls' },
  
  // Expensive items (4000+ XP)
  { id: 10, name: 'Flying Potion', price: 4000, category: 'premium', rarity: 'epic', emoji: '🧪', description: 'Magical levitation potion' },
  { id: 11, name: 'Chinese Dragon', price: 10000, category: 'premium', rarity: 'epic', emoji: '🐉', description: 'Majestic oriental dragon' },
  { id: 12, name: 'Eiffel Tower', price: 36000, category: 'premium', rarity: 'legendary', emoji: '🗼', description: 'Iconic French landmark' },
  { id: 13, name: 'Enchanted Book', price: 50000, category: 'premium', rarity: 'legendary', emoji: '📚', description: 'Book of ancient wisdom' },
  { id: 14, name: 'Private Island', price: 80000, category: 'premium', rarity: 'legendary', emoji: '🏝️', description: 'Your own tropical paradise' },
  { id: 15, name: 'Golden Retriever', price: 100000, category: 'premium', rarity: 'legendary', emoji: '🐕', description: 'Literal golden retriever' }
];

const RARITY_COLORS = {
  common: 'bg-gray-100 border-gray-300 text-gray-700',
  uncommon: 'bg-green-100 border-green-300 text-green-700',
  rare: 'bg-blue-100 border-blue-300 text-blue-700',
  epic: 'bg-purple-100 border-purple-300 text-purple-700',
  legendary: 'bg-yellow-100 border-yellow-300 text-yellow-700'
};

export function ShopOverlay({ isOpen, onClose }: ShopOverlayProps) {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userItems = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'items'],
    enabled: !!user?.id,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      soundManager.play('correct');
      toast({
        title: "Purchase Successful!",
        description: `You bought ${data.item.name} for ${data.item.price} XP`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'items'] });
    },
    onError: (error: Error) => {
      soundManager.play('incorrect');
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (item: any) => {
    if (!user) return;
    
    if (user.totalXp < item.price) {
      soundManager.play('incorrect');
      toast({
        title: "Insufficient XP",
        description: `You need ${item.price - user.totalXp} more XP to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    const alreadyOwned = userItems.some((userItem: any) => userItem.itemId === item.id);
    if (alreadyOwned) {
      soundManager.play('incorrect');
      toast({
        title: "Already Owned",
        description: "You already own this item!",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate(item.id);
  };

  const filteredItems = SHOP_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lingora Shop
              </DialogTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-yellow-700">
                  {user?.totalXp?.toLocaleString() || 0} XP
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 h-[70vh] overflow-y-auto">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {SHOP_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  <div className={`p-1 rounded text-white ${category.color}`}>
                    {category.icon}
                  </div>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {SHOP_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    const isOwned = userItems.some((userItem: any) => userItem.itemId === item.id);
                    const canAfford = (user?.totalXp || 0) >= item.price;

                    return (
                      <Card
                        key={item.id}
                        className={cn(
                          "hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer relative overflow-hidden",
                          RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS],
                          isOwned && "opacity-60"
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="text-4xl mb-2">{item.emoji}</div>
                            <Badge
                              variant={item.rarity === 'legendary' ? 'default' : 'secondary'}
                              className={cn(
                                "text-xs",
                                item.rarity === 'legendary' && "bg-yellow-500 text-white",
                                item.rarity === 'epic' && "bg-purple-500 text-white",
                                item.rarity === 'rare' && "bg-blue-500 text-white"
                              )}
                            >
                              {item.rarity}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-yellow-600" />
                              <span className="font-bold text-yellow-700">
                                {item.price.toLocaleString()}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePurchase(item)}
                              disabled={isOwned || !canAfford || purchaseMutation.isPending}
                              className={cn(
                                "transition-all duration-200",
                                isOwned
                                  ? "bg-green-500 hover:bg-green-500"
                                  : !canAfford
                                  ? "bg-gray-400 hover:bg-gray-400"
                                  : "bg-blue-600 hover:bg-blue-700"
                              )}
                            >
                              {isOwned ? "Owned" : !canAfford ? "Can't Afford" : "Buy"}
                            </Button>
                          </div>
                        </CardContent>
                        {isOwned && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-green-500 text-white">
                              ✓ Owned
                            </Badge>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-800">Shop Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Earn XP by completing lessons and maintaining streaks</li>
            <li>• Items can be traded with friends for other items</li>
            <li>• Legendary items are extremely rare and valuable</li>
            <li>• Check back regularly for seasonal limited items</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}