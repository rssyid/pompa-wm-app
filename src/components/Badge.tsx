import { BadgeProps } from "@/types";

const Badge = ({ children, color = "bg-nb-yellow", className = "" }: BadgeProps) => {
  return (
    <span className={`badge-nb ${color} text-black ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
