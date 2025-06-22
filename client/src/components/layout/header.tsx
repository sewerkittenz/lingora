import { Menu, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
      </div>

      <div className="flex items-center space-x-4">
        {/* XP Display */}
        <div className="flex items-center bg-accent/20 px-4 py-2 rounded-full">
          <Star className="w-4 h-4 text-accent mr-2 fill-current" />
          <span className="font-medium text-accent">{user?.totalXp || 0} XP</span>
        </div>

        {/* Profile Button */}
        <Link href="/profile">
          <Button
            size="icon"
            className="w-10 h-10 rounded-full"
          >
            <span className="font-medium text-sm">
              {user ? getInitials(user.username) : "U"}
            </span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
