import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BookOpen, Calendar, Heart, Search } from "lucide-react";

const actions = [
  {
    icon: BookOpen,
    label: "Read Bible",
    description: "Continue reading",
    path: "/bible",
    gradient: "from-primary to-primary-glow",
  },
  {
    icon: Calendar,
    label: "Reading Plans",
    description: "7-day devotionals",
    path: "/plans",
    gradient: "from-accent to-orange-400",
  },
  {
    icon: Search,
    label: "Search",
    description: "Find verses",
    path: "/search",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Heart,
    label: "Prayer Journal",
    description: "Your reflections",
    path: "/prayer",
    gradient: "from-pink-500 to-rose-400",
  },
];

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link key={action.path} to={action.path}>
          <Card
            className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">
              {action.label}
            </h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
};
