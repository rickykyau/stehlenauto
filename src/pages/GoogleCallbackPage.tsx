import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { socialLoginToShopify } from "@/lib/social-auth";
import { useCustomer } from "@/contexts/CustomerContext";

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { setToken } = useCustomer();
  const [status, setStatus] = useState("Processing Google sign-in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        console.log("Google callback - hash present:", !!window.location.hash);
        console.log("Google callback - access_token:", accessToken ? "found" : "missing");

        if (!accessToken) {
          const queryParams = new URLSearchParams(window.location.search);
          const err = queryParams.get("error");
          console.log("Google callback - error param:", err);
          setError("Google login failed. No access token received.");
          setTimeout(() => navigate("/account/login"), 3000);
          return;
        }

        setStatus("Getting your account info...");
        const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Google user info");
        }

        const user = await response.json();
        console.log("Google user:", user.email, user.given_name, user.family_name);

        if (!user.email) {
          setError("Could not get email from Google.");
          setTimeout(() => navigate("/account/login"), 3000);
          return;
        }

        setStatus("Creating your account...");
        const result = await socialLoginToShopify(
          user.email,
          user.given_name || "",
          user.family_name || "",
          "google"
        );

        console.log("socialLoginToShopify result:", result);

        if (result.success && result.token) {
          setToken(result.token);
          navigate("/account");
        } else {
          setError(result.error || "Login failed. Please try again.");
          setTimeout(() => navigate("/account/login"), 3000);
        }
      } catch (err: any) {
        console.error("Google callback error:", err);
        setError("Google login failed: " + (err?.message || "Unknown error"));
        setTimeout(() => navigate("/account/login"), 3000);
      }
    }

    handleCallback();
  }, [navigate, setToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">{status}</p>
        </>
      )}
    </div>
  );
};

export default GoogleCallbackPage;
