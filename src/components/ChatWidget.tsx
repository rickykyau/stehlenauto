import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ShoppingCart, ExternalLink, ChevronRight, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVehicle } from "@/contexts/VehicleContext";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { trackEvent } from "@/lib/analytics";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  action?: ActionData | null;
  timestamp: Date;
}

interface ProductCard {
  id: string;
  cacheId?: string;
  title: string;
  price: string;
  image: string;
  handle: string;
  inStock: boolean;
  variantId?: string;
  partNumber?: string;
  cbItemName?: string;
}

interface ActionData {
  type: "add_to_cart" | "apply_promo" | "save_vehicle" | "escalate";
  data: Record<string, any>;
}

const MAX_MESSAGES = 30;

const QUICK_ACTIONS = [
  { label: "Find parts for my vehicle", icon: "🔧" },
  { label: "Check if a part fits", icon: "✅" },
  { label: "Track my order", icon: "📦" },
  { label: "Shipping & returns", icon: "🚚" },
  { label: "Apply promo code", icon: "🏷️" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const chatOpenedAtRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { vehicle } = useVehicle();
  const navigate = useNavigate();
  const openCart = useCartStore((s) => s.openCart);
  const addItem = useCartStore((s) => s.addItem);

  // Get user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      const meta = session?.user?.user_metadata;
      setUserName(meta?.first_name || meta?.full_name?.split(" ")[0] || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      const meta = session?.user?.user_metadata;
      setUserName(meta?.first_name || meta?.full_name?.split(" ")[0] || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let greeting = "Welcome to Stehlen Auto! How can I help you find the right parts?";
      if (userName && vehicle) {
        greeting = `Hi ${userName}! I see you have a ${vehicle.year} ${vehicle.make} ${vehicle.model}. How can I help you find parts today?`;
      } else if (userName) {
        greeting = `Hi ${userName}! How can I help you today?`;
      }
      setMessages([{
        id: "greeting",
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, userName, vehicle]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (messages.length >= MAX_MESSAGES) return;

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    trackEvent("chat_message_sent", {
      message_length: text.trim().length,
      message_number: newCount,
      is_first_message: newCount === 1,
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "greeting")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: text.trim(),
          conversationId,
          conversationHistory: history,
          userId,
          vehicleContext: vehicle,
        },
      });

      if (error) throw error;

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        products: data.products?.length > 0 ? data.products : undefined,
        action: data.action || undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Track product recommendations
      if (data.products?.length > 0) {
        data.products.forEach((product: ProductCard) => {
          trackEvent("chat_product_recommended", {
            item_id: product.id,
            item_name: product.title,
          });
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, conversationId, userId, vehicle, userMessageCount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const atLimit = messages.filter((m) => m.role === "user").length >= MAX_MESSAGES;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:brightness-110 transition-all btn-press group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[60] w-full sm:w-[400px] h-full sm:h-[560px] sm:max-h-[80vh] flex flex-col bg-card border border-border sm:rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 bg-background border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground font-display text-xs flex items-center justify-center">
                SA
              </div>
              <div>
                <p className="font-display text-xs tracking-wider text-foreground">STEHLEN AUTO SUPPORT</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-[10px] text-muted-foreground font-body">Online 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([]);
                  setConversationId(null);
                  // Re-trigger greeting
                  let greeting = "Welcome to Stehlen Auto! How can I help you find the right parts?";
                  if (userName && vehicle) {
                    greeting = `Hi ${userName}! I see you have a ${vehicle.year} ${vehicle.make} ${vehicle.model}. How can I help you find parts today?`;
                  } else if (userName) {
                    greeting = `Hi ${userName}! How can I help you today?`;
                  }
                  setMessages([{ id: "greeting", role: "assistant", content: greeting, timestamp: new Date() }]);
                }}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="New conversation"
              >
                <Home className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 text-sm font-body leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.products.slice(0, 5).map((product, idx) => (
                      <div
                        key={`${product.id}-${idx}`}
                        className="border border-border bg-background p-3 flex gap-3 items-start"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-16 h-16 object-cover bg-muted shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs text-foreground line-clamp-2 mb-1">{product.title}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-display text-sm text-primary font-bold">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                            <span className={`text-[10px] font-display ${product.inStock ? "text-green-500" : "text-destructive"}`}>
                              {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                navigate(`/products/${product.handle}`);
                                setIsOpen(false);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-display tracking-wider border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              VIEW
                            </button>
                            {product.inStock && product.variantId && (
                              <button
                                onClick={async () => {
                                  const cartPrice = parseFloat(product.price);
                                  trackEvent("add_to_cart", {
                                    currency: "USD",
                                    value: cartPrice,
                                    items: [{
                                      item_id: product.id,
                                      item_name: product.title,
                                      item_brand: "Stehlen",
                                      price: cartPrice,
                                      quantity: 1,
                                    }],
                                  });
                                  await addItem({
                                    product: { node: { id: product.id, title: product.title, handle: product.handle, description: "", priceRange: { minVariantPrice: { amount: product.price, currencyCode: "USD" } }, images: { edges: product.image ? [{ node: { url: product.image, altText: null } }] : [] }, variants: { edges: [{ node: { id: product.variantId!, title: "Default", price: { amount: product.price, currencyCode: "USD" }, availableForSale: true, selectedOptions: [] } }] }, productType: "", tags: [], options: [] } },
                                    variantId: product.variantId!,
                                    variantTitle: "Default",
                                    price: { amount: product.price, currencyCode: "USD" },
                                    quantity: 1,
                                    selectedOptions: [],
                                  });
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-display tracking-wider bg-primary text-primary-foreground hover:brightness-110 transition-colors"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                ADD
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action confirmations */}
                {msg.action && (
                  <div className="mt-2 border border-primary/30 bg-primary/5 p-3">
                    {msg.action.type === "escalate" && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-sm">🎫</span>
                        <p className="font-body text-xs text-foreground">
                          Support ticket created. Our team will respond within 24 hours.
                        </p>
                      </div>
                    )}
                    {msg.action.type === "apply_promo" && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-sm">🏷️</span>
                        <p className="font-body text-xs text-foreground">
                          {msg.action.data?.valid
                            ? `Promo code applied: ${msg.action.data?.discount} off!`
                            : "This promo code is not valid."}
                        </p>
                      </div>
                    )}
                    {msg.action.type === "save_vehicle" && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-sm">🚗</span>
                        <p className="font-body text-xs text-foreground">
                          Vehicle saved: {msg.action.data?.year} {msg.action.data?.make} {msg.action.data?.model}
                        </p>
                      </div>
                    )}
                    {msg.action.type === "add_to_cart" && (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        <p className="font-body text-xs text-foreground">
                          Added to cart: {msg.action.data?.title}
                        </p>
                        <button
                          onClick={() => { openCart(); setIsOpen(false); }}
                          className="ml-auto text-primary text-[10px] font-display tracking-wider hover:underline"
                        >
                          VIEW CART
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions — shown only when no messages yet (besides greeting) */}
            {messages.length <= 1 && !isLoading && (
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.label)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 border border-border bg-background text-left hover:border-primary/40 transition-colors group"
                  >
                    <span className="text-sm">{action.icon}</span>
                    <span className="font-body text-xs text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {/* Message limit warning */}
            {atLimit && (
              <div className="text-center py-3 border border-border bg-background p-3">
                <p className="font-body text-xs text-muted-foreground">
                  For further assistance, please email{" "}
                  <a href="mailto:support@stehlenauto.com" className="text-primary hover:underline">
                    support@stehlenauto.com
                  </a>{" "}
                  or I can create a support ticket for you.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={atLimit ? "Message limit reached" : "Type a message..."}
                disabled={isLoading || atLimit}
                rows={1}
                className="flex-1 resize-none bg-card border border-border px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 max-h-24 min-h-[40px]"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || atLimit}
                className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground hover:brightness-110 transition-colors btn-press disabled:opacity-50 shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center font-body">
              Press Enter to send · Powered by AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
