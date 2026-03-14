/**
 * SHOPIFY SNIPPET: snippets/product-card.liquid
 */
import { Link } from "react-router-dom";
import { ShoppingCart, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  slug?: string;
  compareAt?: string;
  inStock?: boolean;
}

const ProductCard = ({ image, title, price, slug, compareAt, inStock = true }: ProductCardProps) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Added to cart",
      description: title,
    });
  };

  const content = (
    <div className="group bg-card border border-border overflow-hidden transition-colors hover:border-primary/40 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="font-display text-xs tracking-widest text-muted-foreground">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-body text-sm leading-relaxed mb-3 text-foreground/90 line-clamp-2 flex-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg text-primary font-bold">{price}</span>
          {compareAt && (
            <span className="font-display text-xs text-muted-foreground line-through">{compareAt}</span>
          )}
        </div>
      </div>

      {/* CTA — split: View + Add to Cart */}
      <div className="flex border-t border-border">
        <span className="flex-1 h-11 flex items-center justify-center text-muted-foreground font-display text-[10px] tracking-widest transition-colors group-hover:text-foreground">
          VIEW PRODUCT
        </span>
        {inStock ? (
          <button
            onClick={handleAddToCart}
            className="w-12 h-11 border-l border-border flex items-center justify-center bg-primary text-primary-foreground transition-colors hover:brightness-110 btn-press shrink-0"
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        ) : (
          <span className="w-12 h-11 border-l border-border flex items-center justify-center bg-muted text-muted-foreground shrink-0">
            <Plus className="w-5 h-5" />
          </span>
        )}
      </div>
    </div>
  );

  if (slug) {
    return <Link to={`/products/${slug}`} className="block h-full">{content}</Link>;
  }

  return content;
};

export default ProductCard;
