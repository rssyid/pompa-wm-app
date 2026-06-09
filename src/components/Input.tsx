import React from "react";
import { InputProps } from "@/types";

const Input: React.FC<InputProps> = ({ focusColor, label, className = "", error, ...rest }) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={rest.id}
          className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        className={`input-nb w-full ${focusColor ? `focus:border-${focusColor}` : ""} ${className}`}
        {...rest}
      />
      {error && (
        <p className="mt-2 text-sm font-bold text-nb-red">{error}</p>
      )}
    </div>
  );
};

export default Input;
