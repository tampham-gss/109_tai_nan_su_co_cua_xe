/** Màu badge theo mức độ sự cố (catalog DEFAULT_SEVERITIES). */
export function severityBadgeClass(severity: string): string {
  switch (severity) {
    case "Thấp":
      return "border-slate-300 bg-slate-50 text-slate-600";
    case "Trung bình":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "Cao":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "Nghiêm trọng":
      return "border-red-300 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}
