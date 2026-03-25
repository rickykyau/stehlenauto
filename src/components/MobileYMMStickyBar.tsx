import { useState } from "react";
import { Truck, X } from "lucide-react";
import { useVehicle } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileYMMStickyBar = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const { vehicle } = useVehicle();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("ymm_bar_dismissed") === "true"
  );

  if (!isMobile || vehicle || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem("ymm_bar_dismissed", "true");
    setDismissed(true);
  };

  return (
    <div
      onClick={onOpenModal}
      className="fixed bottom-0 left-0 right-0 z-40 bg-primary cursor-pointer"
      style={{ height: 52 }}
    >
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-primary-foreground" />
          <span className="font-display text-[11px] tracking-widest text-primary-foreground font-bold">
            TAP TO FIND PARTS FOR YOUR TRUCK
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="w-8 h-8 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileYMMStickyBar;
