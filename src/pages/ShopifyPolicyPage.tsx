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
  const [error, setError] = useState(false);

  const fetchPolicy = () => {
    setLoading(true);
    setError(false);
    fetchShopifyPolicy(field)
      .then((policy) => {
        if (policy) {
          setTitle(policy.title);
          setBody(policy.body);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolicy();
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
          <div className="space-y-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm mb-4">Unable to load policy. Please try again.</p>
            <button
              onClick={fetchPolicy}
              className="border border-primary px-6 py-2 font-display text-xs tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              RETRY
            </button>
          </div>
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
