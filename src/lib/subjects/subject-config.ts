import { Subject } from "./subject";

export const subjects = [
  new Subject("toan", "Math", "toan", "#0f9f9a"),
  new Subject("ngu_van", "Literature", "nguVan", "#f26b5e"),
  new Subject("ngoai_ngu", "Foreign Language", "ngoaiNgu", "#5368d5"),
  new Subject("vat_li", "Physics", "vatLi", "#f2a93b"),
  new Subject("hoa_hoc", "Chemistry", "hoaHoc", "#d94f70"),
  new Subject("sinh_hoc", "Biology", "sinhHoc", "#31a354"),
  new Subject("lich_su", "History", "lichSu", "#8c6dd1"),
  new Subject("dia_li", "Geography", "diaLi", "#2b8cbe"),
  new Subject("gdcd", "Civic Education", "gdcd", "#756bb1")
] as const;
