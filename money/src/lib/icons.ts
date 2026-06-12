import {
  Banknote,
  BookOpen,
  Calendar,
  CalendarClock,
  ChevronRight,
  Clapperboard,
  CreditCard,
  FileJson,
  FileSpreadsheet,
  Gift,
  Globe,
  Heart,
  Home,
  Laptop,
  LayoutDashboard,
  Menu,
  Minus,
  Moon,
  Package,
  Palette,
  PawPrint,
  PieChart,
  Pill,
  Plus,
  Settings,
  ShoppingBag,
  Smartphone,
  Soup,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  Bus,
  Wallet,
  Bell,
  ChevronLeft,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  Hand,
  Cat,
  Copy,
  Coins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PaymentMethod } from "~/lib/types";

/** Lucide icon keys stored in category constants */
export type CategoryIconKey =
  | "food"
  | "transport"
  | "shopping"
  | "health"
  | "home"
  | "entertain"
  | "education"
  | "beauty"
  | "pet"
  | "other_exp"
  | "salary"
  | "freelance"
  | "invest"
  | "other_inc";

const CATEGORY_ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  food:       Soup,
  transport:  Bus,
  shopping:   ShoppingBag,
  health:     Pill,
  home:       Home,
  entertain:  Clapperboard,
  education:  BookOpen,
  beauty:     Sparkles,
  pet:        PawPrint,
  other_exp:  Package,
  salary:     Wallet,
  freelance:  Laptop,
  invest:     TrendingUp,
  other_inc:  Gift,
};

const PAYMENT_ICON_MAP: Record<PaymentMethod, LucideIcon> = {
  cash:        Banknote,
  credit:      CreditCard,
  installment: CalendarClock,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICON_MAP[categoryId as CategoryIconKey] ?? Package;
}

export function getPaymentIcon(method: PaymentMethod): LucideIcon {
  return PAYMENT_ICON_MAP[method];
}

/** Shared app icons — single import source for Lucide usage */
export const Icons = {
  nav: {
    home:       Home,
    calendar:   Calendar,
    add:        Plus,
    report:     PieChart,
    settings:   Settings,
    dashboard:  LayoutDashboard,
  },
  action: {
    menu:       Menu,
    bell:       Bell,
    chevronLeft:  ChevronLeft,
    chevronRight: ChevronRight,
    search:     Search,
    close:      X,
    trash:      Trash2,
    upload:     Upload,
    arrowUp:    ArrowUp,
    arrowDown:  ArrowDown,
    hand:       Hand,
    copy:       Copy,
    plus:       Plus,
    minus:      Minus,
  },
  settings: {
    theme:    Moon,
    template: Palette,
    accent:   Sparkles,
    currency: Coins,
    language: Globe,
    export:   Upload,
    clear:    Trash2,
    version:  Smartphone,
    feedback: Heart,
    tutorial: BookOpen,
    budget:   PieChart,
    recurring: CalendarClock,
    json:     FileJson,
    csv:      FileSpreadsheet,
  },
  brand: {
    cat: Cat,
  },
} as const;

export { CATEGORY_ICON_MAP, PAYMENT_ICON_MAP };
