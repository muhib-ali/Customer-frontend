import Navbar from "./Navbar";
import Footer from "./Footer";
import WishlistBootstrapper from "./WishlistBootstrapper";
import CartBootstrapper from "./CartBootstrapper";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
      <WishlistBootstrapper />
      <CartBootstrapper />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
