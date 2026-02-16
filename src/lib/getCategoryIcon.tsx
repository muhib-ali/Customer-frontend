import { ComponentType } from "react";
import {
  Battery,
  Car,
  CarFront,
  CircleDot,
  Cog,
  Disc3,
  Fan,
  Fuel,
  Gauge,
  Hammer,
  KeyRound,
  Lightbulb,
  Package,
  PaintBucket,
  Pipette,
  Settings,
  Shield,
  Sparkles,
  Wrench,
} from "lucide-react";

/** Only spare parts / automotive related icons */
const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  // Car & Vehicles
  car: Car,
  cars: Car,
  carfront: CarFront,
  vehicle: Car,
  vehicles: Car,
  automotive: Car,
  automobile: Car,
  automobiles: Car,
  outdoor: Car,

  // Spare Parts & Components
  spareparts: Cog,
  "spare-parts": Cog,
  "spare parts": Cog,
  parts: Cog,
  autoparts: Cog,
  "auto-parts": Cog,
  components: Cog,
  tools: Wrench,
  hardware: Wrench,
  diy: Hammer,
  repair: Wrench,

  // Engine & Transmission
  engine: Settings,
  engines: Settings,
  motor: Settings,
  transmission: Cog,
  gearbox: Cog,
  "gear box": Cog,

  // Brakes & Wheels
  brakes: Disc3,
  brake: Disc3,
  tires: CircleDot,
  tyres: CircleDot,
  tire: CircleDot,
  tyre: CircleDot,
  wheels: CircleDot,
  wheel: CircleDot,
  rims: CircleDot,
  alloywheels: CircleDot,
  "alloy wheels": CircleDot,
  bearings: Cog,

  // Interior & Seats
  blackbox: Package,
  "black box": Package,
  leatherseatcovers: Package,
  "leather seat covers": Package,
  seats: Package,
  seat: Package,
  seatcovers: Package,
  "seat covers": Package,

  // Fluids & Fuel
  fuel: Fuel,
  petrol: Fuel,
  diesel: Fuel,
  oil: Pipette,
  lubricant: Pipette,

  // Electrical & Battery
  battery: Battery,
  batteries: Battery,

  // Filters & Exhaust
  filter: Fan,
  filters: Fan,
  exhaust: Gauge,
  gauge: Gauge,
  dashboard: Gauge,
  speedometer: Gauge,

  // Body & Exterior
  paint: PaintBucket,
  bodywork: PaintBucket,
  body: PaintBucket,
  bumper: Shield,
  lights: Lightbulb,
  headlight: Lightbulb,
  headlights: Lightbulb,
  taillight: Lightbulb,

  // Car Care
  carwash: Sparkles,
  "car-wash": Sparkles,
  detailing: Sparkles,
  polish: Sparkles,
  cleaning: Sparkles,

  // Keys & Ignition
  carkey: KeyRound,
  "car-key": KeyRound,
  ignition: KeyRound,

  // Fallback (generic spare part / box)
  general: Package,
  miscellaneous: Package,
  other: Package,
  default: Package,
};

const normalize = (value?: string) =>
  value ? value.toLowerCase().trim().replace(/\s+/g, " ") : "default";

const toKeyForm = (value: string) => value.replace(/\s+/g, "");

/** Keys that should not be used for keyword matching (too generic) */
const FALLBACK_ONLY_KEYS = new Set(["default", "general", "other", "miscellaneous"]);

/** Sorted by key length descending so longer phrases match first (e.g. "alloy wheels" before "wheels") */
const iconKeysByLength = (Object.keys(iconMap) as (keyof typeof iconMap)[])
  .filter((k) => !FALLBACK_ONLY_KEYS.has(k))
  .sort((a, b) => b.length - a.length);

/**
 * Find an icon whose key appears in the category text (e.g. "Premium Alloy Wheels" → "alloy wheels" → CircleDot).
 * Uses longest-match so "alloy wheels" wins over "wheels".
 */
function matchIconByKeyword(categoryNormalized: string, categoryNoSpaces: string): (typeof iconMap)[keyof typeof iconMap] | null {
  for (const key of iconKeysByLength) {
    const keyNoSpaces = toKeyForm(key);
    const keyInText =
      categoryNormalized.includes(key) ||
      categoryNoSpaces.includes(keyNoSpaces);
    if (keyInText) return iconMap[key];
  }
  return null;
}

export function getCategoryIcon(categoryName: string, className: string = "h-8 w-8 text-primary") {
  const normalized = normalize(categoryName);
  const noSpaces = toKeyForm(normalized);

  const Icon =
    iconMap[normalized as keyof typeof iconMap] ??
    iconMap[noSpaces as keyof typeof iconMap] ??
    matchIconByKeyword(normalized, noSpaces) ??
    iconMap.default;

  return <Icon className={className} />;
}
