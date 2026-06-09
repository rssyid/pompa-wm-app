import { CardProps } from "@/types";

const Card = ({ children, className = "", color = "bg-white dark:bg-gray-900", hover = false }: CardProps) => {
  return (
    <div
      className={`border-4 border-black ${color} ${
        hover
          ? "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer"
          : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      } transition-all duration-150 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
