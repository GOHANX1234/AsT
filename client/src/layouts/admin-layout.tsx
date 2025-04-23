import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Code,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      title: "Overview",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
      href: "/admin",
      active: location === "/admin",
    },
    {
      title: "Manage Resellers",
      icon: <Users className="mr-3 h-5 w-5" />,
      href: "/admin/resellers",
      active: location === "/admin/resellers",
    },
    {
      title: "Referral Tokens",
      icon: <Ticket className="mr-3 h-5 w-5" />,
      href: "/admin/tokens",
      active: location === "/admin/tokens",
    },
    {
      title: "API Documentation",
      icon: <Code className="mr-3 h-5 w-5" />,
      href: "/admin/api",
      active: location === "/admin/api",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-primary">KeyMaster</h1>
          <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
            Admin
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">{user?.username}</span>
          <Button variant="link" size="sm" className="text-red-600 hover:text-red-800" onClick={handleLogout}>
            Logout
          </Button>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col h-full py-6">
                  <div className="flex items-center mb-6">
                    <h2 className="text-lg font-semibold text-primary">KeyMaster</h2>
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md">
                      Admin
                    </span>
                  </div>
                  <nav className="flex-1">
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href}>
                            <a 
                              className={`flex items-center px-4 py-2 rounded-md text-sm ${
                                item.active
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.icon}
                              {item.title}
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={`flex items-center px-4 py-2 rounded-md ${
                        item.active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      {item.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
