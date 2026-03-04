import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind className 조합 유틸리티
 *
 * clsx  → 조건부 클래스 조합 및 falsy 값 제거
 * twMerge → 중복/충돌하는 Tailwind 클래스를 나중 값으로 덮어씀
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500')
 * // isActive true  → 'px-4 py-2 bg-blue-500'
 * // isActive false → 'px-4 py-2'
 *
 * cn('px-4', 'px-8')
 * // → 'px-8'  (px-4는 제거됨)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
