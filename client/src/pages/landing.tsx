import { FaNewspaper, FaQuestionCircle, FaChartLine, FaCalendarCheck, FaEye, FaUserShield } from 'react-icons/fa';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FaNewspaper className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">Jurnalistika Ads</h1>
                <p className="text-xs text-muted-foreground">Platform Periklanan Jurnalistika.id</p>
              </div>
            </div>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <FaQuestionCircle className="inline mr-1" /> Bantuan
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Pasang Iklan di Jurnalistika.id</h2>
              <p className="text-lg text-muted-foreground">Platform periklanan profesional untuk menjangkau audiens Jurnalistika.id dengan mudah dan efektif.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <FaChartLine className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pilihan Pembayaran Fleksibel</h3>
                  <p className="text-sm text-muted-foreground">Bayar per periode atau per tayangan sesuai kebutuhan kampanye Anda</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <FaCalendarCheck className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Kontrol Penuh Jadwal</h3>
                  <p className="text-sm text-muted-foreground">Tentukan tanggal mulai dan berakhir iklan Anda dengan fleksibel</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <FaEye className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Transparansi Real-time</h3>
                  <p className="text-sm text-muted-foreground">Lihat ketersediaan slot dan estimasi biaya secara langsung</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Masuk ke Akun Anda</h3>
            
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground text-center py-4">
                Gunakan Replit Auth untuk masuk ke platform
              </p>
              
              <button 
                onClick={handleLogin}
                data-testid="button-login"
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center space-x-2"
              >
                <FaUserShield />
                <span>Masuk dengan Replit Auth</span>
              </button>
            </div>
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Belum punya akun? Daftar otomatis saat login pertama kali
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">© 2024 Jurnalistika.id. Hak cipta dilindungi.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kebijakan Privasi</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
