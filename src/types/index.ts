import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  focusColor?: string;
  error?: string;
}

export interface ContentFrameProps {
  children: React.ReactNode;
  shadowSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export interface SectionHeaderProps {
  title: string;
  headSize?: "sm" | "md" | "lg";
  sectionClassName?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  hover?: boolean;
}

export interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}
