import { Check, Star, Crown, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingTier {
  price: number;
  description: string;
  accommodation_level: string;
}

export interface PricingTiers {
  silver?: PricingTier;
  gold?: PricingTier;
  platinum?: PricingTier;
}

interface PricingTierSelectorProps {
  tiers: PricingTiers | null;
  selectedTier: "silver" | "gold" | "platinum";
  onTierSelect: (tier: "silver" | "gold" | "platinum") => void;
  fallbackPrice?: number | null;
}

const tierConfig = {
  silver: {
    label: "Silver",
    icon: Award,
    description: "Essential comfort",
    bgClass: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800",
    borderClass: "border-slate-300 dark:border-slate-600",
    selectedBorderClass: "border-slate-500 ring-2 ring-slate-400",
    iconColor: "text-slate-500",
    badgeClass: "bg-slate-500",
  },
  gold: {
    label: "Gold",
    icon: Star,
    description: "Premium experience",
    bgClass: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30",
    borderClass: "border-amber-300 dark:border-amber-700",
    selectedBorderClass: "border-amber-500 ring-2 ring-amber-400",
    iconColor: "text-amber-500",
    badgeClass: "bg-amber-500",
  },
  platinum: {
    label: "Platinum",
    icon: Crown,
    description: "Ultimate luxury",
    bgClass: "bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30",
    borderClass: "border-violet-300 dark:border-violet-700",
    selectedBorderClass: "border-violet-500 ring-2 ring-violet-400",
    iconColor: "text-violet-500",
    badgeClass: "bg-violet-500",
  },
};

export function PricingTierSelector({
  tiers,
  selectedTier,
  onTierSelect,
  fallbackPrice,
}: PricingTierSelectorProps) {
  // If no tiers defined, show nothing (will use legacy pricing)
  if (!tiers || (!tiers.silver && !tiers.gold && !tiers.platinum)) {
    return null;
  }

  const availableTiers = (["silver", "gold", "platinum"] as const).filter(
    (tier) => tiers[tier]
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Select Package</p>
      <div className="space-y-2">
        {availableTiers.map((tierKey) => {
          const tier = tiers[tierKey]!;
          const config = tierConfig[tierKey];
          const Icon = config.icon;
          const isSelected = selectedTier === tierKey;

          return (
            <button
              key={tierKey}
              onClick={() => onTierSelect(tierKey)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
                config.bgClass,
                isSelected ? config.selectedBorderClass : config.borderClass,
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      config.badgeClass
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {config.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.accommodation_level || config.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">
                    ${tier.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">per person</p>
                </div>
              </div>
              {tier.description && (
                <p className="text-xs text-muted-foreground mt-2 pl-13">
                  {tier.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for tour cards
export function PricingTierBadges({
  tiers,
  fallbackPrice,
}: {
  tiers: PricingTiers | null;
  fallbackPrice?: number | null;
}) {
  if (!tiers || (!tiers.silver && !tiers.gold && !tiers.platinum)) {
    if (fallbackPrice) {
      return (
        <div className="absolute top-4 right-4 bg-background/95 text-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          From ${fallbackPrice.toLocaleString()} pps
        </div>
      );
    }
    return null;
  }

  const lowestPrice = Math.min(
    tiers.silver?.price || Infinity,
    tiers.gold?.price || Infinity,
    tiers.platinum?.price || Infinity
  );

  return (
    <div className="absolute top-4 right-4 bg-background/95 text-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
      From ${lowestPrice.toLocaleString()} pps
    </div>
  );
}
