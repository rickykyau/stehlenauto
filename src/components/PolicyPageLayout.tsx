import { Link } from "react-router-dom";
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

interface PolicyPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PolicyPageLayout = ({ title, children }: PolicyPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
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
              <BreadcrumbPage className="font-display text-[10px] tracking-widest">{title.toUpperCase()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-2xl tracking-wider mb-8">{title}</h1>
        <div className="font-body text-sm text-secondary-foreground leading-relaxed space-y-6 policy-content">
          {children}
        </div>
      </article>

      <SiteFooter />
    </div>
  );
};

export default PolicyPageLayout;
