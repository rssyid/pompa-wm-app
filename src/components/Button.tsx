import React from "react";
import { ButtonProps } from "@/types";

const sizeClasses = {
  xs: "px-2 py-1 text-sm",
  sm: "px-3 py-1.5 text-base",
  md: "px-5 py-2.5 text-lg",
  lg: "px-7 py-3.5 text-xl",
  xl: "px-9 py-4.5 text-2xl",
};

const variantClasses = {
  primary: "bg-nb-yellow text-black",
  secondary: "bg-nb-purple text-black",
  danger: "bg-nb-red text-black",
  success: "bg-nb-green text-black",
  outline: "bg-white text-black",
};

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  color,
  ...rest
}) => {
  return (
    <button
      className={`btn-nb ${sizeClasses[size]} ${color || variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
