import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome to Envora</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in or create your account</p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login"><LoginForm /></TabsContent>
          <TabsContent value="register"><RegisterForm /></TabsContent>
        </Tabs>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
        <Button variant="outline" className="w-full" onClick={async () => {
          const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
          if (r.error) toast.error(r.error.message);
        }}>Continue with Google</Button>
      </Card>
    </div>
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in…" : "Log In"}</Button>
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
      toast.success("Account created! Awaiting admin approval before you can list products.");
    } else {
      toast.success("Account created! You're signed in.");
    }
    navigate({ to: "/" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      </div>
      <div>
        <Label>I am a…</Label>
        <RadioGroup value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })} className="grid grid-cols-2 gap-3 mt-2">
          <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/10">
            <RadioGroupItem value="BUYER" /> Buyer
          </label>
          <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/10">
            <RadioGroupItem value="SUPPLIER" /> Supplier
          </label>
        </RadioGroup>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating…" : "Create Account"}</Button>
      <p className="text-xs text-muted-foreground text-center">By signing up you agree to our terms.</p>
    </form>
  );
}
