import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useVehicle } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import FitmentSelector from "./FitmentSelector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const MobileYMMBottomSheet = () => {
  const { vehicle } = useVehicle();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isMobile || vehicle) return;

    // Check if skipped this session
    if (sessionStorage.getItem("ymm_modal_skipped_session") === "true") return;

    // Check localStorage for existing vehicle
    try {
      const stored = localStorage.getItem("stehlen_vehicle");
      if (stored) return;
    } catch {}

    // Small delay so page renders first
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, [isMobile, vehicle]);

  // Close when vehicle is set
  useEffect(() => {
    if (vehicle && open) setOpen(false);
  }, [vehicle, open]);

  if (!isMobile) return null;

  const handleSkip = () => {
    sessionStorage.setItem("ymm_modal_skipped_session", "true");
    setOpen(false);
    navigate("/collections/all");
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(val) => {
        // Prevent closing by swipe/overlay — only close programmatically
        if (!val) return;
      }}
      modal
    >
      <DrawerContent
        className="max-h-[65vh] rounded-t-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DrawerHeader className="text-center pt-2 pb-0">
          <DrawerTitle className="font-display text-lg tracking-widest">
            FIND PARTS THAT FIT YOUR VEHICLE
          </DrawerTitle>
          <DrawerDescription className="font-body text-sm text-muted-foreground mt-1">
            Select your year, make, and model to see only parts guaranteed to fit.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 pt-2">
          <FitmentSelector onVehicleSelect={() => setOpen(false)} />
          <button
            onClick={handleSkip}
            className="mt-4 w-full text-center font-body text-[13px] text-muted-foreground hover:text-foreground hover:underline transition-colors py-2"
          >
            Browse all parts without a vehicle
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileYMMBottomSheet;
