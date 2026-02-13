import { Link } from "react-router-dom";
import { 
  Settings, 
  Share2, 
  HelpCircle, 
  Info, 
  User, 
  BookOpen,
  Bookmark,
  TrendingUp,
  FileText,
  Search,
  Heart,
  LogIn,
  LogOut
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const More = () => {
  const { user, signOut } = useAuth();
  const handleShare = async () => {
    const shareData = {
      title: "DailyLight Bible",
      text: "Experience God's word with DailyLight Bible - daily verses, reading plans, and spiritual growth.",
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error("Failed to share");
      }
    }
  };

  const handleGetHelp = () => {
    window.location.href = "mailto:JB.websites.agency@gmail.com?subject=DailyLight%20Bible%20-%20Help%20Request";
  };

  const menuItems = [
    {
      title: "Features",
      items: [
        { icon: Search, label: "Search Bible", path: "/search", description: "Find verses & passages" },
        { icon: Bookmark, label: "Bookmarks", path: "/bookmarks", description: "Your saved verses" },
        { icon: FileText, label: "Notes", path: "/notes", description: "Your reflections" },
        { icon: TrendingUp, label: "Progress", path: "/progress", description: "Track your reading" },
        { icon: Heart, label: "Prayer", path: "/prayer", description: "Prayer journal" },
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-6">More</h1>

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <Card 
            className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors active:scale-[0.98]"
            onClick={handleShare}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Share2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Share the App</h3>
              <p className="text-sm text-muted-foreground">Invite friends to DailyLight</p>
            </div>
          </Card>

          <Link to="/settings">
            <Card className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors active:scale-[0.98]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-muted-foreground">Font size, font & Bible version</p>
              </div>
            </Card>
          </Link>

          <Card 
            className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors active:scale-[0.98]"
            onClick={handleGetHelp}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Get Help / Get in Touch</h3>
              <p className="text-sm text-muted-foreground">JB.websites.agency@gmail.com</p>
            </div>
          </Card>
        </div>

        {/* Account Section */}
        <div className="mb-8">
          {user ? (
            <Card className="glass-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Signed In</h3>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); toast.success("Signed out"); }}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </Card>
          ) : (
            <Link to="/auth">
              <Card className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Sign In / Create Account</h3>
                  <p className="text-sm text-muted-foreground">Sync reflections, prayers & progress</p>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Feature Links */}
        {menuItems.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <Card className="glass-card divide-y divide-border">
              {section.items.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              ))}
            </Card>
          </div>
        ))}

        <Separator className="my-8" />

        {/* About Section */}
        <div className="space-y-4">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                <Info className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">About DailyLight</h2>
                <p className="text-sm text-muted-foreground">Version 1.5</p>
              </div>
            </div>
            
            <div className="space-y-4 text-foreground/90">
              <p>
                <strong className="text-foreground">DailyLight Bible</strong> is a modern, 
                distraction-free Bible app designed to help you build a consistent habit of 
                engaging with God's Word.
              </p>
              
              <p>
                <strong className="text-primary">Our Purpose:</strong> To make daily Bible reading 
                accessible, beautiful, and meaningful. We believe Scripture should be easy to read, 
                reflect upon, and apply to daily life.
              </p>
              
              <p>
                <strong className="text-primary">What We Offer:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Daily verses tailored for morning and evening</li>
                <li>Structured reading plans to guide your journey</li>
                <li>Personal notes and reflections for deeper study</li>
                <li>Progress tracking to celebrate consistency</li>
                <li>Offline access for reading anywhere</li>
              </ul>
              
              <p className="text-muted-foreground italic">
                "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
              </p>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">About the Publisher</h2>
                <p className="text-sm text-muted-foreground">The Creator</p>
              </div>
            </div>
            
            <div className="space-y-4 text-foreground/90">
              <p>
                DailyLight Bible was created by <strong className="text-primary">Ajayi John Oluwafisolami</strong>, 
                a passionate developer with a heart for making God's Word accessible to everyone.
              </p>
              
              <p className="text-muted-foreground">
                "My vision is to create tools that help people draw closer to God through 
                His Word. DailyLight is built with love, prayer, and the hope that it becomes 
                a blessing in your spiritual journey."
              </p>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGetHelp}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Get in Touch
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Made with ❤️ for the glory of God
        </p>
      </div>
    </div>
  );
};

export default More;
