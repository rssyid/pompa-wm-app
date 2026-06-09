import { SectionHeaderProps } from "@/types";

const headSizeClasses = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl",
};

const SectionHeader = ({ title, headSize = "md", sectionClassName = "" }: SectionHeaderProps) => {
  return (
    <div className={`mb-8 group cursor-pointer w-fit ${sectionClassName}`}>
      <h2
        className={`${headSizeClasses[headSize]} font-black text-black dark:text-white uppercase tracking-tight`}
      >
        {title}
      </h2>
      <div className="h-2 bg-nb-yellow border-2 border-black mt-2 group-hover:w-full w-3/4 transition-all duration-300" />
    </div>
  );
};

export default SectionHeader;
