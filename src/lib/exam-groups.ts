export type ExamGroupCode = "A" | "B" | "C" | "D";

export type ExamGroupSubject = {
  label: string;
  field:
    | "toan"
    | "nguVan"
    | "ngoaiNgu"
    | "vatLi"
    | "hoaHoc"
    | "sinhHoc"
    | "lichSu"
    | "diaLi";
};

export type ExamGroup = {
  code: ExamGroupCode;
  label: string;
  description: string;
  subjects: [ExamGroupSubject, ExamGroupSubject, ExamGroupSubject];
};

export const examGroups: ExamGroup[] = [
  {
    code: "A",
    label: "Group A",
    description: "Math, Physics, Chemistry",
    subjects: [
      { label: "Math", field: "toan" },
      { label: "Physics", field: "vatLi" },
      { label: "Chemistry", field: "hoaHoc" }
    ]
  },
  {
    code: "B",
    label: "Group B",
    description: "Math, Chemistry, Biology",
    subjects: [
      { label: "Math", field: "toan" },
      { label: "Chemistry", field: "hoaHoc" },
      { label: "Biology", field: "sinhHoc" }
    ]
  },
  {
    code: "C",
    label: "Group C",
    description: "Literature, History, Geography",
    subjects: [
      { label: "Literature", field: "nguVan" },
      { label: "History", field: "lichSu" },
      { label: "Geography", field: "diaLi" }
    ]
  },
  {
    code: "D",
    label: "Group D",
    description: "Math, Literature, Foreign Language",
    subjects: [
      { label: "Math", field: "toan" },
      { label: "Literature", field: "nguVan" },
      { label: "Foreign Language", field: "ngoaiNgu" }
    ]
  }
];

export function findExamGroup(code: string | null) {
  return examGroups.find((group) => group.code === code) ?? examGroups[0];
}
