"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Use dynamic import for react-select to avoid hydration mismatch
const Select = dynamic(() => import("react-select"), { ssr: false });

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  required?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  disabled = false,
  name,
  className,
}: SearchableSelectProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            setIsDark(document.documentElement.classList.contains("dark"));
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  if (!mounted) {
    return <div className={`input-nb w-full h-[52px] bg-gray-100 dark:bg-gray-800 ${className || ''}`} />;
  }

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <Select
      name={name}
      value={selectedOption}
      onChange={(opt: any) => onChange(opt ? opt.value : "")}
      options={options}
      isDisabled={disabled}
      placeholder={placeholder}
      className={className}
      isClearable
      isSearchable
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: disabled ? (isDark ? '#374151' : '#e5e7eb') : (isDark ? '#1f2937' : 'white'),
          border: '4px solid black',
          borderRadius: '0',
          boxShadow: state.isFocused ? '6px 6px 0px 0px rgba(0,0,0,1)' : '4px 4px 0px 0px rgba(0,0,0,1)',
          padding: '2px 6px',
          minHeight: '52px',
          transform: state.isFocused ? 'translate(-1px, -1px)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          '&:hover': {
            border: '4px solid black',
          },
          transition: 'all 0.15s ease',
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: isDark ? '#1f2937' : 'white',
          border: '4px solid black',
          borderRadius: '0',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          marginTop: '4px',
          zIndex: 50,
        }),
        menuList: (base) => ({
          ...base,
          padding: 0,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? '#000'
            : state.isFocused
            ? (isDark ? '#374151' : '#f3f4f6')
            : 'transparent',
          color: state.isSelected ? '#fff' : (isDark ? '#fff' : '#000'),
          fontWeight: '700',
          cursor: 'pointer',
          padding: '10px 12px',
          borderBottom: '2px solid black',
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:active': {
            backgroundColor: '#000',
            color: '#fff',
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: isDark ? '#fff' : '#000',
          fontWeight: '700',
        }),
        placeholder: (base) => ({
          ...base,
          color: isDark ? '#9ca3af' : '#6b7280',
          fontWeight: '700',
        }),
        input: (base) => ({
          ...base,
          color: isDark ? '#fff' : '#000',
          fontWeight: '700',
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: 'black',
        }),
        clearIndicator: (base) => ({
          ...base,
          color: 'black',
        }),
      }}
    />
  );
}
