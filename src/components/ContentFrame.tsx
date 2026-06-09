import { ContentFrameProps } from "@/types";

const shadowClasses = {
  sm: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  md: "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
  lg: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
  xl: "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
};

const ContentFrame = ({ children, shadowSize = "lg", className = "" }: ContentFrameProps) => {
  return (
    <div
      className={`border-4 border-black bg-white dark:bg-gray-900 ${shadowClasses[shadowSize]} ${className}`}
    >
      {children}
    </div>
  );
};

export default ContentFrame;
