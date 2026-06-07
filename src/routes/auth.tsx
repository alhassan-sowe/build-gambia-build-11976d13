import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Truck, Banknote, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden md:flex relative bg-surface text-surface-foreground p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(0.68 0.21 45 / 0.5), transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.72 0.19 50 / 0.4), transparent 50%)" }} />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">E</span>
            Envora
          </Link>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">The Gambia's direct materials marketplace.</h1>
          <p className="mt-4 opacity-80">Join thousands of buyers and suppliers building smarter, together.</p>
          <div className="mt-8 space-y-3">
            {[
              { Icon: ShieldCheck, t: "Verified suppliers" },
              { Icon: Truck, t: "Direct delivery to your site" },
              { Icon: Banknote, t: "Pay on delivery" },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-3"><Icon className="h-5 w-5 text-primary" /><span>{t}</span></div>
            ))}
          </div>
        </div>
        <div className="relative text-xs opacity-60">© {new Date().getFullYear()} Envora.</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col p-6 md:p-12 justify-center">
        <Link to="/" className="md:hidden flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Envora
        </Link>
        <div className="w-full max-w-md mx-auto">
          <div className="md:hidden mb-6 flex items-center gap-2 font-extrabold text-xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">E</span>
            Envora
          </div>
          <h2 className="text-2xl font-bold">Welcome to Envora</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in or create your account to get started.</p>

          <Button variant="outline" className="w-full mt-6 h-11" onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (r.error) toast.error(r.error.message);
          }}>
            <GoogleIcon /> Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="register"><RegisterForm /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1S8.7 5.9 12 5.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z"/>
    </svg>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    let dest = "/";
    const uid = data.user?.id;
    if (uid) {
      const { data: p } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
      const role = (p as any)?.role;
      dest = role === "ADMIN" ? "/admin" : role === "SUPPLIER" ? "/supplier" : "/dashboard";
    }
    navigate({ to: dest });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" /></div>
      <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">{loading ? "Signing in…" : "Log In"}</Button>
    </form>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "", role: "BUYER" as "BUYER" | "SUPPLIER" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: form.name, phone: form.phone, location: form.location, role: form.role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (form.role === "SUPPLIER") {
      toast.success("Account created! Awaiting admin approval before you can list.");
    } else {
      toast.success("Account created! You're signed in.");
    }
    navigate({ to: "/" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div>
        <Label>I am a…</Label>
        <RadioGroup value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })} className="grid grid-cols-2 gap-3 mt-2">
          <label className="flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value="BUYER" /><div><div className="font-semibold text-sm">Buyer</div><div className="text-[11px] text-muted-foreground">Order materials</div></div>
          </label>
          <label className="flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value="SUPPLIER" /><div><div className="font-semibold text-sm">Supplier</div><div className="text-[11px] text-muted-foreground">Sell materials</div></div>
          </label>
        </RadioGroup>
        {form.role === "SUPPLIER" && (
          <Badge variant="secondary" className="mt-2 text-[11px]">Supplier accounts need admin approval.</Badge>
        )}
      </div>
      <div><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" /></div>
      <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" /></div>
      <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" /></div>
        <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-11" /></div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">{loading ? "Creating…" : "Create Account"}</Button>
      <p className="text-xs text-muted-foreground text-center">By signing up you agree to our terms.</p>
    </form>
  );
}
