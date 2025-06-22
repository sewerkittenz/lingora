import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, UserMinus, Ban, Repeat, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TradeOverlay } from "./trade-overlay";
import { RemoveFriendOverlay } from "./remove-friend-overlay";
import { BlockUserOverlay } from "./block-user-overlay";

interface FriendsOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsOverlay({ open, onOpenChange }: FriendsOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTradeOverlay, setShowTradeOverlay] = useState(false);
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);
  const [showBlockOverlay, setShowBlockOverlay] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const { user } = useAuth();

  // Load friends from API
  const { data: friends = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "friends"],
    enabled: !!user?.id,
  });

  const filteredFriends = (friends as any[]).filter(friend =>
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Friends</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="px-6">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
          </div>

          {/* Friends List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredFriends.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No friends found.</p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {friend.initials}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{friend.username}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">{friend.xp} XP</p>
                        <span className="text-muted-foreground">•</span>
                        <Badge 
                          variant={friend.status === "online" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {friend.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-secondary hover:text-secondary/80">
                      <Repeat className="w-4 h-4 mr-1" />
                      Trade
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive/80">
                      <UserMinus className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                    <Button size="sm" variant="outline" className="text-muted-foreground hover:text-foreground">
                      <Ban className="w-4 h-4 mr-1" />
                      Block
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
