import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, User, Menu, Search, MapPin, Globe } from "lucide-react";

const Header = () => {
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            LaZone
          </span>
        </div>

        {/* Country Selector - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Select defaultValue="ci">
            <SelectTrigger className="w-[180px]">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ci">🇨🇮 Côte d'Ivoire</SelectItem>
              <SelectItem value="sn">🇸🇳 Sénégal</SelectItem>
              <SelectItem value="ma">🇲🇦 Maroc</SelectItem>
              <SelectItem value="ng">🇳🇬 Nigeria</SelectItem>
              <SelectItem value="gh">🇬🇭 Ghana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;