import { Link, useLocation } from "wouter";
import { FaNewspaper, FaPlus, FaList, FaChartBar, FaBell, FaUser } from 'react-icons/fa';
import { useAuth } from "@/hooks/useAuth";

export default function AdvertiserNav() {
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
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <FaNewspaper className="text-primary-foreground" />
              </div>
              <h1 className="text-lg font-serif font-bold text-foreground">Jurnalistika Ads</h1>
            </div>
            
            <div className="hidden md:flex space-x-1">
              <Link href="/create-ad">
                <a 
                  data-testid="link-create-ad"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    location === '/create-ad' 
                      ? 'text-foreground bg-accent/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } transition-colors`}
                >
                  <FaPlus className="inline mr-2" />Buat Iklan
                </a>
              </Link>
              <Link href="/my-ads">
                <a 
                  data-testid="link-my-ads"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    location === '/my-ads' 
                      ? 'text-foreground bg-accent/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } transition-colors`}
                >
                  <FaList className="inline mr-2" />Iklan Saya
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <FaBell />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
                <FaUser className="text-accent-foreground" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                  {(user as any)?.companyName || (user as any)?.email || 'Pemasang Iklan'}
                </p>
                <button 
                  onClick={handleLogout}
                  data-testid="button-logout"
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
