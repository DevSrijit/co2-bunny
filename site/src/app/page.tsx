
import { AirVent, Zap } from "lucide-react";

import { Hero115 } from "@/components/blocks/shadcnblocks-com-hero115"

const Data = {
  icon: <AirVent className="size-6" />,
  heading: "Calculate Your Website's Carbon Footprint",
  description:
    "CO2 Bunny helps you measure and understand your website's environmental impact. Get detailed insights about data transfer, energy consumption, and carbon emissions of your web properties.",
  button: {
    text: "Start Analysis",
    icon: <Zap className="ml-2 size-4" />,
    url: "/analyze",
  },
  trustText: "Helping websites reduce their carbon footprint worldwide",
  imageSrc: "https://cloud-80y8uo1d8-hack-club-bot.vercel.app/0img_2025-1-28_22-23-26_229777.png",
  imageAlt: "CO2 Bunny Website Carbon Calculator",
};

export default function Hero() {
  return <Hero115 {...Data} />;
}