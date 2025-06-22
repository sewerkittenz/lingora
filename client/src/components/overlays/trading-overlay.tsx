import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { X, ArrowLeftRight, Send, Check, Trash2, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { soundManager } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface TradingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  friendUsername?: string;
}

export function TradingOverlay({ isOpen, onClose, friendUsername }: TradingOverlayProps) {
  const [selectedTab, setSelectedTab] = useState("create");
  const [searchUsername, setSearchUsername] = useState(friendUsername || "");
  const [selectedUserItems, setSelectedUserItems] = useState<number[]>([]);
  const [selectedDesiredItems, setSelectedDesiredItems] = useState<number[]>([]);
  const [tradeMessage, setTradeMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userItems = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'items'],
    enabled: !!user?.id,
  });

  const { data: allShopItems = [] } = useQuery({
    queryKey: ['/api/shop/items'],
  });

  const { data: tradeOffers = [] } = useQuery({
    queryKey: ['/api/trades', user?.id],
    enabled: !!user?.id,
  });

  const { data: searchedUser } = useQuery({
    queryKey: ['/api/users/search', searchUsername],
    enabled: !!searchUsername && searchUsername.length > 2,
  });

  const createTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await fetch('/api/trades/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create trade');
      }
      return response.json();
    },
    onSuccess: () => {
      soundManager.play('correct');
      toast({
        title: "Trade Offer Sent!",
        description: "Your trade offer has been sent successfully.",
      });
      setSelectedUserItems([]);
      setSelectedDesiredItems([]);
      setTradeMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
    },
    onError: (error: Error) => {
      soundManager.play('incorrect');
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const respondToTradeMutation = useMutation({
    mutationFn: async ({ tradeId, action }: { tradeId: number; action: 'accept' | 'decline' }) => {
      const response = await fetch(`/api/trades/${tradeId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} trade`);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      soundManager.play(variables.action === 'accept' ? 'finish' : 'skip');
      toast({
        title: variables.action === 'accept' ? "Trade Accepted!" : "Trade Declined",
        description: variables.action === 'accept' 
          ? "Items have been exchanged successfully." 
          : "Trade offer has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'items'] });
    },
    onError: (error: Error) => {
      soundManager.play('incorrect');
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleItemSelect = (itemId: number, isUserItem: boolean) => {
    soundManager.play('click');
    if (isUserItem) {
      setSelectedUserItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : prev.length < 4 ? [...prev, itemId] : prev
      );
    } else {
      setSelectedDesiredItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : prev.length < 4 ? [...prev, itemId] : prev
      );
    }
  };

  const handleCreateTrade = () => {
    if (!searchedUser || selectedUserItems.length === 0 || selectedDesiredItems.length === 0) {
      soundManager.play('incorrect');
      toast({
        title: "Invalid Trade",
        description: "Please select items to offer and request, and specify a valid recipient.",
        variant: "destructive",
      });
      return;
    }

    createTradeMutation.mutate({
      toUserId: searchedUser.id,
      offeredItems: selectedUserItems,
      requestedItems: selectedDesiredItems,
      message: tradeMessage.trim() || undefined,
    });
  };

  const getItemById = (itemId: number) => {
    return allShopItems.find((item: any) => item.id === itemId);
  };

  const getUserItemsData = () => {
    return userItems.map((userItem: any) => ({
      ...userItem,
      ...getItemById(userItem.itemId)
    }));
  };

  const getAvailableItems = () => {
    if (!searchedUser) return [];
    // In a real app, this would fetch the other user's items
    // For now, show all shop items as potentially available
    return allShopItems;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trading Center
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6 h-[75vh] overflow-y-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create Trade
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Incoming Offers
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sent Offers
              </TabsTrigger>
            </TabsList>

            {/* Create Trade Tab */}
            <TabsContent value="create" className="space-y-6">
              {/* Search User */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Trading Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter username to trade with"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      className="flex-1"
                    />
                    {searchedUser && (
                      <Badge className="bg-green-100 text-green-800">
                        Found: {searchedUser.username}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Items ({selectedUserItems.length}/4 selected)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                    {getUserItemsData().map((item: any) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105",
                          selectedUserItems.includes(item.itemId)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleItemSelect(item.itemId, true)}
                      >
                        <div className="text-2xl">{item.emoji || "📦"}</div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name || "Unknown Item"}</div>
                          <div className="text-sm text-gray-500">
                            {item.rarity && (
                              <Badge variant="secondary" className="text-xs">
                                {item.rarity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {selectedUserItems.includes(item.itemId) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                    {getUserItemsData().length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        You don't have any items to trade
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Desired Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Desired Items ({selectedDesiredItems.length}/4 selected)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                    {getAvailableItems().map((item: any) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105",
                          selectedDesiredItems.includes(item.id)
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleItemSelect(item.id, false)}
                      >
                        <div className="text-2xl">{item.emoji || "📦"}</div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            <Badge variant="secondary" className="text-xs">
                              {item.rarity}
                            </Badge>
                          </div>
                        </div>
                        {selectedDesiredItems.includes(item.id) && (
                          <Check className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Trade Message */}
              <Card>
                <CardHeader>
                  <CardTitle>Trade Message (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add a message to your trade offer..."
                    value={tradeMessage}
                    onChange={(e) => setTradeMessage(e.target.value)}
                    maxLength={200}
                    className="resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {tradeMessage.length}/200 characters
                  </div>
                </CardContent>
              </Card>

              {/* Send Trade Button */}
              <div className="text-center">
                <Button
                  onClick={handleCreateTrade}
                  disabled={!searchedUser || selectedUserItems.length === 0 || selectedDesiredItems.length === 0 || createTradeMutation.isPending}
                  className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createTradeMutation.isPending ? "Sending..." : "Send Trade Offer"}
                </Button>
              </div>
            </TabsContent>

            {/* Incoming Offers Tab */}
            <TabsContent value="incoming" className="space-y-4">
              {tradeOffers.filter((offer: any) => offer.toUserId === user?.id && offer.status === 'pending').map((offer: any) => (
                <Card key={offer.id} className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Trade from {offer.fromUser?.username}
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">
                        Incoming
                      </Badge>
                    </div>
                    {offer.message && (
                      <p className="text-sm text-gray-600 mt-2">"{offer.message}"</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">They offer:</h4>
                        <div className="space-y-2">
                          {offer.offeredItems?.map((itemId: number) => {
                            const item = getItemById(itemId);
                            return (
                              <div key={itemId} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{item?.emoji || "📦"}</span>
                                <span>{item?.name || "Unknown Item"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">For your:</h4>
                        <div className="space-y-2">
                          {offer.requestedItems?.map((itemId: number) => {
                            const item = getItemById(itemId);
                            return (
                              <div key={itemId} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{item?.emoji || "📦"}</span>
                                <span>{item?.name || "Unknown Item"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => respondToTradeMutation.mutate({ tradeId: offer.id, action: 'decline' })}
                        disabled={respondToTradeMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        onClick={() => respondToTradeMutation.mutate({ tradeId: offer.id, action: 'accept' })}
                        disabled={respondToTradeMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tradeOffers.filter((offer: any) => offer.toUserId === user?.id && offer.status === 'pending').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No incoming trade offers</p>
                </div>
              )}
            </TabsContent>

            {/* Sent Offers Tab */}
            <TabsContent value="sent" className="space-y-4">
              {tradeOffers.filter((offer: any) => offer.fromUserId === user?.id).map((offer: any) => (
                <Card key={offer.id} className="border-2 border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Trade to {offer.toUser?.username}
                      </CardTitle>
                      <Badge variant={
                        offer.status === 'pending' ? 'default' :
                        offer.status === 'accepted' ? 'default' :
                        'destructive'
                      } className={
                        offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {offer.status}
                      </Badge>
                    </div>
                    {offer.message && (
                      <p className="text-sm text-gray-600 mt-2">"{offer.message}"</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">You offered:</h4>
                        <div className="space-y-2">
                          {offer.offeredItems?.map((itemId: number) => {
                            const item = getItemById(itemId);
                            return (
                              <div key={itemId} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{item?.emoji || "📦"}</span>
                                <span>{item?.name || "Unknown Item"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">For their:</h4>
                        <div className="space-y-2">
                          {offer.requestedItems?.map((itemId: number) => {
                            const item = getItemById(itemId);
                            return (
                              <div key={itemId} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{item?.emoji || "📦"}</span>
                                <span>{item?.name || "Unknown Item"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tradeOffers.filter((offer: any) => offer.fromUserId === user?.id).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sent trade offers</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}