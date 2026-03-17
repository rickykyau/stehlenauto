import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    window.location.href = `mailto:info@stehlenauto.com?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
    toast.success("Opening your email client…");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border px-4 lg:px-8 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary">HOME</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-display text-[10px] tracking-widest">CONTACT US</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-2xl tracking-wider mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-display text-sm tracking-widest font-bold text-foreground">STEHLEN AUTO</h2>
            <div className="space-y-4 text-sm text-secondary-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>21912 Garcia Lane, City of Industry, CA 91789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:info@stehlenauto.com" className="text-primary hover:underline">info@stehlenauto.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:909-895-4522" className="text-primary hover:underline">909-895-4522</a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Monday – Friday, 9am – 5pm PST</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-display text-sm tracking-widest font-bold text-foreground">SEND US A MESSAGE</h2>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border text-foreground"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground"
            />
            <Textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="bg-input border-border text-foreground"
            />
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-display text-xs tracking-widest font-bold hover:brightness-110">
              SUBMIT
            </Button>
          </form>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
};

export default ContactPage;
