import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserMinus, AlertTriangle } from "lucide-react";

interface RemoveFriendOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  friend: any;
}

export function RemoveFriendOverlay({ isOpen, onClose, friend }: RemoveFriendOverlayProps) {
  const handleRemoveFriend = () => {
    // TODO: Implement friend removal logic
    console.log("Removing friend:", friend.username);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <UserMinus className="w-5 h-5" />
            Remove Friend
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                Are you sure you want to remove <strong>{friend.nickname || friend.username}</strong> from your friends list?
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                They won't be notified, but you'll need to send a new friend request to connect again.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveFriend}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove Friend
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}