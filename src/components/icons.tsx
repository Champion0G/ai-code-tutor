import type { SVGProps } from "react";
import { Award, BrainCircuit, Star, Zap } from "lucide-react";
import type { BadgeIconType } from "@/contexts/gamification-context";

export const CodeAlchemistIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8.5 2h7" />
    <path d="M12.5 2V6.5" />
    <path d="M5.07 15.22c-1.63 2.56.12 5.78 2.78 7.41 2.66 1.63 5.78-.12 7.41-2.78" />
    <path d="M18.93 8.78c1.63-2.56-.12-5.78-2.78-7.41-2.66-1.63-5.78.12-7.41 2.78" />
    <path d="M10 11l-2 2 2 2" />
    <path d="M14 11l2 2-2 2" />
  </svg>
);

export const BadgeIcon = ({ type, ...props }: { type: BadgeIconType } & SVGProps<SVGSVGElement>) => {
  switch (type) {
    case "Star":
      return <Star {...props} />;
    case "Zap":
      return <Zap {...props} />;
    case "BrainCircuit":
        return <BrainCircuit {...props} />;
    case "Award":
      return <Award {...props} />;
    default:
      return <Award {...props} />;
  }
};
