import { Link } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">E</span>
            Envora
          </div>
          <p className="text-sm opacity-80">Order construction materials directly from trusted suppliers across The Gambia.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Explore</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/materials" className="hover:text-accent">Materials</Link></li>
            <li><Link to="/auth" className="hover:text-accent">Become a Supplier</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact & Support</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +220 000 0000</li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@envora.gm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Envora. Built for The Gambia.
      </div>
    </footer>
  );
}
