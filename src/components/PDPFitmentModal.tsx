import { useState, useEffect, useRef } from "react";
import { useVehicle } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import FitmentSelector from "./FitmentSelector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PDPFitmentModalProps {
  /** Ref to the product images container — modal opens when user scrolls past it */
  imagesRef?: React.RefObject<HTMLElement>;
}

const PDP_DISMISSED_KEY = "pdp_ymm_dismissed";

const PDPFitmentModal = ({ imagesRef }: PDPFitmentModalProps) => {
  const { vehicle } = useVehicle();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Don't trigger if vehicle already set or already dismissed this session
    if (vehicle) return;
    if (sessionStorage.getItem(PDP_DISMISSED_KEY) === "true") return;
    if (triggeredRef.current) return;

    // Timer: 10 seconds
    const timer = setTimeout(() => {
      if (!triggeredRef.current && !vehicle) {
        triggeredRef.current = true;
        setOpen(true);
      }
    }, 10_000);

    // Scroll observer: past product images
    let observer: IntersectionObserver | undefined;
    if (imagesRef?.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          // When images leave viewport (scrolled past)
          if (!entry.isIntersecting && !triggeredRef.current && !vehicle) {
            triggeredRef.current = true;
            setOpen(true);
          }
        },
        { threshold: 0 }
      );
      observer.observe(imagesRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [vehicle, imagesRef]);

  // Close when vehicle is set
  useEffect(() => {
    if (vehicle && open) setOpen(false);
  }, [vehicle, open]);

  if (vehicle) return null;

  const handleSkip = () => {
    sessionStorage.setItem(PDP_DISMISSED_KEY, "true");
    setOpen(false);
  };

  const content = (
    <>
      <FitmentSelector onVehicleSelect={() => setOpen(false)} />
      <button
        onClick={handleSkip}
        className="mt-3 w-full text-center font-body text-[13px] text-muted-foreground hover:text-foreground hover:underline transition-colors py-1"
      >
        Skip — I know this fits
      </button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            handleSkip();
          }
        }}
        modal
      >
        <DrawerContent className="max-h-[70vh] rounded-t-2xl">
          <DrawerHeader className="text-center pt-2 pb-0">
            <DrawerTitle className="font-display text-lg tracking-widest">
              DOES THIS FIT YOUR VEHICLE?
            </DrawerTitle>
            <DrawerDescription className="font-body text-sm text-muted-foreground mt-1">
              Select your vehicle to confirm this part fits before you buy.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 pt-2">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleSkip(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-widest text-center">
            DOES THIS FIT YOUR VEHICLE?
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground text-center mt-1">
            Select your vehicle to confirm this part fits before you buy.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">{content}</div>
      </DialogContent>
    </Dialog>
  );
};

export default PDPFitmentModal;
