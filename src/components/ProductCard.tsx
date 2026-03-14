import { Check, Package } from "lucide-react";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  category: string;
  inStock?: boolean;
  specs?: string;
  href?: string;
}

const ProductCard = ({ image, title, price, category, inStock = true, specs, href }: ProductCardProps) => {
  return (
    <div className="group border border-border bg-card overflow-hidden transition-colors hover:border-primary/40">
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category tag */}
        <div className="absolute top-0 left-0 bg-background/90 border-r border-b border-border px-3 py-1">
          <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">{category}</span>
        </div>
        {/* Stock status */}
        {inStock && (
          <div className="absolute bottom-0 right-0 flex items-center gap-1.5 bg-background/90 border-l border-t border-border px-3 py-1">
            <div className="w-2 h-2 bg-success" />
            <span className="font-display text-[10px] tracking-widest text-success uppercase">In Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 border-t border-border">
        <h4 className="font-display text-xs tracking-wider leading-relaxed mb-2 line-clamp-2">{title}</h4>
        {specs && (
          <p className="font-display text-[10px] text-muted-foreground tracking-wider mb-3">{specs}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-primary font-bold">{price}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Check className="w-3 h-3" />
            <span className="font-display text-[10px] tracking-widest uppercase">Verified Fit</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full h-10 bg-secondary text-secondary-foreground font-display text-xs font-bold uppercase tracking-widest border-t border-border btn-press transition-colors hover:bg-primary hover:text-primary-foreground">
        <div className="flex items-center justify-center gap-2">
          <Package className="w-3.5 h-3.5" />
          ADD TO BUILD
        </div>
      </button>
    </div>
  );
};

export default ProductCard;
