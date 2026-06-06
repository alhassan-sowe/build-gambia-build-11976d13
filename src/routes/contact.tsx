import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Envora" }, { name: "description", content: "Get help and contact Envora." }] }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Message sent! We'll reply soon.");
    setForm({ name: "", email: "", message: "" });
  }
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold">Contact & Support</h1>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-accent" /><div><div className="font-medium">Call us</div><div className="text-sm text-muted-foreground">+220 000 0000</div></div></div>
          <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-accent" /><div><div className="font-medium">WhatsApp</div><a href="https://wa.me/220000000" className="text-sm text-muted-foreground hover:text-accent">Chat now</a></div></div>
          <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-accent" /><div><div className="font-medium">Email</div><div className="text-sm text-muted-foreground">hello@envora.gm</div></div></div>
        </Card>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Message</Label><Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <Button type="submit" className="w-full">Send message</Button>
          </form>
        </Card>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <Accordion type="single" collapsible className="bg-card rounded-xl border px-4">
          <AccordionItem value="1"><AccordionTrigger>How do I place an order?</AccordionTrigger><AccordionContent>Browse materials, add to cart, fill in delivery details, and place the order. The supplier will confirm and deliver.</AccordionContent></AccordionItem>
          <AccordionItem value="2"><AccordionTrigger>Can I become a supplier?</AccordionTrigger><AccordionContent>Yes — register as a supplier. After admin approval you can list your products.</AccordionContent></AccordionItem>
          <AccordionItem value="3"><AccordionTrigger>How is payment handled?</AccordionTrigger><AccordionContent>For now, payments are arranged directly with the supplier on delivery.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
