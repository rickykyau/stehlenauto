import { useEffect } from "react";

const SHOPIFY_ACCOUNT_URL = "https://shopify.com/72426389551/account";

const ShopifyRedirect = () => {
  useEffect(() => {
    window.location.href = SHOPIFY_ACCOUNT_URL;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="font-body text-sm text-muted-foreground">Redirecting to account...</p>
    </div>
  );
};

export default ShopifyRedirect;
