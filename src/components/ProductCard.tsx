/**
 * SHOPIFY SNIPPET: snippets/product-card.liquid
 * 
 * Liquid mapping:
 * - Image: {{ product.featured_image | img_url: '400x' }}
 * - Title: {{ product.title }}
 * - Price: {{ product.price | money }}
 * - URL: {{ product.url }}
 */
import { Link } from "react-router-dom";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  slug?: string;
  compareAt?: string;
  inStock?: boolean;
}

const ProductCard = ({ image, title, price, slug, compareAt, inStock = true }: ProductCardProps) => {
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

      {/* CTA */}
      <button className="w-full h-11 border-t border-primary/50 bg-transparent text-primary font-display text-xs font-bold uppercase tracking-widest transition-colors hover:bg-primary hover:text-primary-foreground btn-press">
        VIEW PRODUCT
      </button>
    </div>
  );

  if (slug) {
    return <Link to={`/products/${slug}`} className="block h-full">{content}</Link>;
  }

  return content;
};

export default ProductCard;
