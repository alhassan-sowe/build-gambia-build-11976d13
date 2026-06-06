import { Link } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle, ShieldCheck, Truck, Banknote } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 md:mt-16 bg-surface text-surface-foreground pb-16 md:pb-0">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { Icon: ShieldCheck, t: "Verified suppliers", d: "Approved by Envora" },
            { Icon: Truck, t: "Direct delivery", d: "From supplier to your site" },
            { Icon: Banknote, t: "Pay on delivery", d: "No upfront payment" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">{t}</div>
                <div className="text-xs opacity-70">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 font-bold text-lg mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">E</span>
            Envora
          </div>
          <p className="text-sm opacity-80">The Gambia's direct construction materials marketplace.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-70">Shop</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/materials" className="hover:text-primary">All materials</Link></li>
            <li><Link to="/materials" className="hover:text-primary">Cement & blocks</Link></li>
            <li><Link to="/materials" className="hover:text-primary">Iron rods</Link></li>
            <li><Link to="/materials" className="hover:text-primary">Transport</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-70">Company</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/auth" className="hover:text-primary">Sell on Envora</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Help & FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-70">Contact</h3>
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
