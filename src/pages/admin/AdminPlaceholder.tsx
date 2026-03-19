import { useLocation } from "react-router-dom";

export default function AdminPlaceholder() {
  const location = useLocation();
  const name = location.pathname.split("/").pop() || "page";

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center space-y-2">
        <p className="font-display text-xs tracking-widest text-muted-foreground uppercase">{name}</p>
        <p className="font-body text-sm text-muted-foreground">Coming soon in Phase 2</p>
      </div>
    </div>
  );
}
