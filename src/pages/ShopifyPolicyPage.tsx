import { useEffect, useState } from "react";
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
import { fetchShopifyPolicy, type ShopifyPolicyField } from "@/lib/shopify";

interface ShopifyPolicyPageProps {
  field: ShopifyPolicyField;
  fallbackTitle: string;
}

const ShopifyPolicyPage = ({ field, fallbackTitle }: ShopifyPolicyPageProps) => {
  const [title, setTitle] = useState(fallbackTitle);
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchShopifyPolicy(field).then((policy) => {
      if (policy) {
        setTitle(policy.title);
        setBody(policy.body);
      }
      setLoading(false);
    });
  }, [field]);

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
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : body ? (
          <div
            className="font-body text-sm text-secondary-foreground leading-relaxed space-y-6 policy-html"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-muted-foreground text-sm">Policy content is not available at this time.</p>
        )}
      </article>

      <SiteFooter />
    </div>
  );
};

export default ShopifyPolicyPage;
