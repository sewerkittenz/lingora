import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, Shield } from "lucide-react";

interface BlockUserOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  friend: any;
}

export function BlockUserOverlay({ isOpen, onClose, friend }: BlockUserOverlayProps) {
  const handleBlockUser = () => {
    // TODO: Implement user blocking logic
    console.log("Blocking user:", friend.username);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="w-5 h-5" />
            Block User
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                Are you sure you want to block <strong>{friend.nickname || friend.username}</strong>?
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                They won't be able to send you messages, friend requests, or trade offers. 
                You can unblock them later in your settings.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBlockUser}
            >
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}