import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";

interface TradeOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeOverlay({ open, onOpenChange }: TradeOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");

  // Mock user collection
  const userCollection = [
    { id: 1, name: "Taco", icon: "🌮" },
    { id: 2, name: "Baguette", icon: "🥖" },
    { id: 3, name: "Plushie", icon: "🧸" },
  ];

  // Mock available items
  const availableItems = [
    { id: 4, name: "German Cap", icon: "🎩" },
    { id: 5, name: "Dragon", icon: "🐉" },
    { id: 6, name: "Eiffel Tower", icon: "🗼" },
  ];

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Trade Items</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Your Items */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Your Items (4 slots)</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                  <div 
                    key={index}
                    className="w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Your Collection</h4>
                <div className="grid grid-cols-4 gap-2">
                  {userCollection.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-muted rounded-lg p-3 text-center cursor-pointer hover:bg-muted/80 transition-colors"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <p className="text-xs text-muted-foreground">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desired Items */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Desired Items (4 slots)</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                  <div 
                    key={index}
                    className="w-full h-24 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center text-primary hover:border-primary transition-colors cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Available Items</h4>
                <div className="grid grid-cols-4 gap-2">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-muted rounded-lg p-3 text-center cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <p className="text-xs">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trade Message */}
          <div>
            <Label htmlFor="trade-message" className="text-sm font-medium text-foreground">
              Trade Message (Optional)
            </Label>
            <Textarea
              id="trade-message"
              placeholder="Add a message to your trade offer..."
              value={tradeMessage}
              onChange={(e) => setTradeMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Trade Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button>
              Send Trade Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
