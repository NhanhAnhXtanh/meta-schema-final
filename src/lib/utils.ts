import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Chức năng:
 * - Kết hợp nhiều className thành một string
 * - Xử lý conditional classes (điều kiện)
 * - Tự động giải quyết conflict giữa các Tailwind classes (ưu tiên class sau)
 * 
 * Lưu ý: Function này không chỉ dành cho shadcn/ui mà là utility chung
 * cho việc merge Tailwind CSS classes. Được sử dụng trong cả custom components
 * (TableNode, RelationshipEdge) và UI components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
