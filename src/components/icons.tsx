
import type { SVGProps } from "react";
import { Award, BrainCircuit, Star, Zap, User, FolderUp, Github } from "lucide-react";
import type { BadgeIconType } from "@/contexts/gamification-context";

export const LexerIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="m14 7 5.3 5.3a1 1 0 0 1 0 1.4L14 19" />
        <path d="m10 7-5.3 5.3a1 1 0 0 0 0 1.4L10 19" />
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
