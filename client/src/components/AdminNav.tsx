import { Link, useLocation } from "wouter";
import { FaNewspaper, FaThLarge, FaList, FaUsers, FaCog, FaBell, FaUserTie } from 'react-icons/fa';
import { useAuth } from "@/hooks/useAuth";

export default function AdminNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
                <FaUserTie />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">Jurnalistika Ads</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-1">
              <Link href="/">
                <a 
                  data-testid="link-admin-dashboard"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    location === '/' 
                      ? 'text-foreground bg-accent/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } transition-colors`}
                >
                  <FaThLarge className="inline mr-2" />Dashboard
                </a>
              </Link>
              <Link href="/ads">
                <a 
                  data-testid="link-admin-dashboard"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    location === '/ads' 
                      ? 'text-foreground bg-accent/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } transition-colors`}
                >
                  <FaNewspaper className="inline mr-2" />Ads
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors relative">
                <FaBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <div className="w-9 h-9 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                <FaUserTie />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground" data-testid="text-admin-name">
                  {(user as any)?.firstName || 'Admin'} Jurnalistika
                </p>
                <button 
                  onClick={handleLogout}
                  data-testid="button-admin-logout"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
