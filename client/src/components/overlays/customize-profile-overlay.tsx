import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface CustomizeProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizeProfileOverlay({ isOpen, onClose }: CustomizeProfileOverlayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nickname: user?.nickname || user?.username || "",
    profilePicture: user?.profilePicture || "🧑‍🎓",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nickname: string; profilePicture?: string }) => {
      return apiRequest(`/api/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      nickname: formData.nickname,
      profilePicture: formData.profilePicture
    });
  };

  const profilePictureOptions = [
    "🧑‍🎓", "👨‍💼", "👩‍💼", "🧑‍🏫", "👨‍🎨", "👩‍🎨", 
    "🧑‍💻", "👨‍🔬", "👩‍🔬", "🧑‍🚀", "👨‍⚕️", "👩‍⚕️",
    "🧑‍🍳", "👨‍🎤", "👩‍🎤", "🧑‍✈️", "👨‍🌾", "👩‍🌾"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname">Display Name</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="Enter your display name"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is how others will see you (can be changed anytime)
              </p>
            </div>
            
            <div>
              <Label>Profile Picture</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {profilePictureOptions.map((pic) => (
                  <button
                    key={pic}
                    type="button"
                    onClick={() => setFormData({ ...formData, profilePicture: pic })}
                    className={`w-10 h-10 text-xl rounded-full border-2 hover:bg-muted/50 transition-colors ${
                      formData.profilePicture === pic ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    {pic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}