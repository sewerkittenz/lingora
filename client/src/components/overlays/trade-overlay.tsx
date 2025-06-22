import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Repeat, Package, Send } from "lucide-react";

interface TradeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  friend: any;
}

export function TradeOverlay({ isOpen, onClose, friend }: TradeOverlayProps) {
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const mockItems = [
    { id: "streak_freeze", name: "Streak Freeze", description: "Protect your streak for one day", icon: "❄️" },
    { id: "xp_boost", name: "XP Boost", description: "Double XP for next lesson", icon: "⚡" },
    { id: "heart_refill", name: "Heart Refill", description: "Restore all hearts", icon: "❤️" },
    { id: "gem_pack", name: "Gem Pack", description: "50 gems bundle", icon: "💎" },
  ];

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSendTrade = () => {
    // TODO: Implement trade sending logic
    console.log("Sending trade to", friend.username, "with items:", selectedItems, "message:", message);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Trade with {friend.nickname || friend.username}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Select items to trade</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {mockItems.map((item) => (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all ${
                    selectedItems.includes(item.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleItemToggle(item.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="trade-message">Message (optional)</Label>
            <Textarea
              id="trade-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to your trade offer..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendTrade}
              disabled={selectedItems.length === 0}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Trade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}