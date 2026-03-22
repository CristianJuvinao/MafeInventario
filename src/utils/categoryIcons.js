import {
  Package,
  Palette,
  CupSoda,
  Laptop,
  Shirt,
  Droplet,
  Book,
  Gamepad2,
  Home,
  Car,

  // 💄 Belleza / Maquillaje
  Sparkles,
  Heart,
  Flower,
  Brush,
  Scissors,
  Eye,
  Smile,
  ShoppingBag,
  Crown,
  Star,
  Hand,
  Gem,
  SprayCan,
} from "lucide-react";

export const CATEGORY_ICONS = {
  // 📦 General
  package: Package,
  default: Package,

  // 💄 Maquillaje & Belleza
  makeup: Sparkles,        // maquillaje general / glow
  palette: Palette,        // sombras
  brush: Brush,            // brochas
  eye: Eye,                // ojos / pestañina
  lips: Smile,             // labiales
  perfume: SprayCan,       // perfumes
  beauty: Gem,             // belleza premium
  crown: Crown,            // lujo / top
  star: Star,              // favoritos
  heart: Heart,            // skincare / amor propio

  // 👗 Moda femenina
  shirt: Shirt,
  bag: ShoppingBag,
  flower: Flower,

  // 🧴 Cuidado personal
  droplet: Droplet,
  hand: Hand,

  // 💻 Otros
  laptop: Laptop,
  book: Book,
  game: Gamepad2,
  home: Home,
  car: Car,
  cup: CupSoda,
};