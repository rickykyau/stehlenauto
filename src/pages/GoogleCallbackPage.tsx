import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { socialLoginToShopify } from "@/lib/social-auth";
import { useCustomer } from "@/contexts/CustomerContext";

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { setToken } = useCustomer();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then(async (user) => {
          const result = await socialLoginToShopify(
            user.email,
            user.given_name || "",
            user.family_name || "",
            "google"
          );
          if (result.success && result.token) {
            setToken(result.token);
            navigate("/account");
          } else {
            navigate("/account/login");
          }
        })
        .catch(() => {
          navigate("/account/login");
        });
    } else {
      navigate("/account/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default GoogleCallbackPage;
