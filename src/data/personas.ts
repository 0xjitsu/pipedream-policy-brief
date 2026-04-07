export interface Persona {
  id: string;
  icon: string;
  name: string;
  quote: string;
  keyStat: string;
  statLabel: string;
  impactColor: string;
}

export const personas: Persona[] = [
  {
    id: "jeepney-driver",
    icon: "🚐",
    name: "Jeepney Driver",
    quote: "My daily fuel cost doubled. I can't raise fares fast enough — I'm losing ₱300 every day.",
    keyStat: "₱1,200 → ₱2,400",
    statLabel: "daily fuel cost",
    impactColor: "#EF4444",
  },
  {
    id: "sari-sari-owner",
    icon: "🏪",
    name: "Sari-Sari Store Owner",
    quote: "Delivery trucks charge more. I pass the cost to customers — they buy less.",
    keyStat: "+18%",
    statLabel: "delivery surcharge",
    impactColor: "#F97316",
  },
  {
    id: "household",
    icon: "🏠",
    name: "NCR Household",
    quote: "Our monthly LPG and transport budget went from ₱3,500 to ₱5,800. We cut meals to compensate.",
    keyStat: "+66%",
    statLabel: "energy spend",
    impactColor: "#F59E0B",
  },
  {
    id: "fisher",
    icon: "🎣",
    name: "Municipal Fisher",
    quote: "Diesel for my boat costs more than the fish I catch. Some days I don't go out.",
    keyStat: "₱4,500 → ₱9,000+",
    statLabel: "per trip fuel cost",
    impactColor: "#EF4444",
  },
  {
    id: "factory-commuter",
    icon: "🏭",
    name: "Factory Worker (Commuter)",
    quote: "My jeepney fare is the same but there are fewer routes. I walk 2km to catch one now.",
    keyStat: "425",
    statLabel: "stations closed on routes",
    impactColor: "#F97316",
  },
];
