import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { SHOP_ITEMS, RARITY_COLORS } from "@/data/shop-items";
import { useAuth } from "@/hooks/use-auth";

interface ShopOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShopOverlay({ open, onOpenChange }: ShopOverlayProps) {
  const { user } = useAuth();

  const categorizedItems = {
    cheap: SHOP_ITEMS.filter(item => item.category === 'cheap'),
    medium: SHOP_ITEMS.filter(item => item.category === 'medium'),
    expensive: SHOP_ITEMS.filter(item => item.category === 'expensive'),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <DialogTitle className="text-2xl font-bold">Shop</DialogTitle>
            <div className="flex items-center bg-accent/20 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-accent mr-2 fill-current" />
              <span className="font-medium text-accent">{user?.totalXp || 0} XP</span>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-8">
          {/* Cheap Items */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Affordable Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categorizedItems.cheap.map((item) => (
                <div key={item.id} className="bg-muted rounded-xl p-4 text-center hover-lift cursor-pointer group">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm text-accent font-bold">{item.price} XP</p>
                  <Badge className={`mt-2 ${RARITY_COLORS[item.rarity]}`}>
                    {item.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Medium Items */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Premium Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categorizedItems.medium.map((item) => (
                <div key={item.id} className="bg-muted rounded-xl p-4 text-center hover-lift cursor-pointer group">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm text-accent font-bold">{item.price} XP</p>
                  <Badge className={`mt-2 ${RARITY_COLORS[item.rarity]}`}>
                    {item.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Expensive Items */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Legendary Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categorizedItems.expensive.map((item) => (
                <div key={item.id} className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 text-center hover-lift cursor-pointer group border border-primary/20">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm text-primary font-bold">{item.price} XP</p>
                  <Badge className={`mt-2 ${RARITY_COLORS[item.rarity]}`}>
                    {item.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
