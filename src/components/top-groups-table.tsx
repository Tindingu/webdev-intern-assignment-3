"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { examGroups, type ExamGroupCode } from "@/lib/exam-groups";
import { type Language, subjectName, translations } from "@/lib/i18n";
import { buildMedalLevelByTotal, getMedalLevel } from "@/lib/ranking";

type TopStudent = {
  rank: number;
  sbd: string;
  group: ExamGroupCode;
  subjects: {
    label: string;
    score: number;
  }[];
  total: number;
};

export function TopGroupsTable({ language }: { language: Language }) {
  const [rows, setRows] = useState<TopStudent[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(examGroups[0]);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const t = translations[language];
  const medalLevelByTotal = useMemo(() => {
    return buildMedalLevelByTotal(rows.map((student) => student.total));
  }, [rows]);

  useEffect(() => {
    async function loadTopStudents() {
      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch(`/api/reports/top-groups?group=${selectedGroup.code}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message ?? t.topServiceError);
          return;
        }

        setRows(data);
      } catch {
        setMessage(t.topServiceError);
      } finally {
        setIsLoading(false);
      }
    }

    loadTopStudents();
  }, [selectedGroup, t.topServiceError]);

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">
            {t.top10} {selectedGroup.label}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {translateGroupDescription(selectedGroup.code, language)} {t.totalScore}.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsGroupMenuOpen((value) => !value)}
            className="inline-flex h-11 min-w-40 items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {selectedGroup.label}
            <ChevronDown aria-hidden="true" className="size-4 text-slate-500" />
          </button>

          {isGroupMenuOpen && (
            <div className="absolute right-0 top-12 z-10 w-72 overflow-hidden rounded-lg border border-line bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-950">
              {examGroups.map((group) => {
                const isActive = group.code === selectedGroup.code;

                return (
                  <button
                    key={group.code}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsGroupMenuOpen(false);
                    }}
                    className={[
                      "flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition",
                      isActive
                        ? "bg-indigo/10 text-indigo dark:bg-indigo/20 dark:text-indigo-200"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                    ].join(" ")}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line bg-white text-xs font-bold dark:border-slate-700 dark:bg-slate-900">
                      {group.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{group.label}</span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-500">
                        {translateGroupDescription(group.code, language)}
                      </span>
                    </span>
                    {isActive && <Check aria-hidden="true" className="mt-1 size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-3 pr-4 font-semibold">{t.rank}</th>
              <th className="py-3 pr-4 font-semibold">{t.registrationNo}</th>
              {selectedGroup.subjects.map((subject) => (
                <th key={subject.field} className="py-3 pr-4 font-semibold">
                  {translateGroupSubject(subject.label, language)}
                </th>
              ))}
              <th className="py-3 font-semibold">{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-10 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                  <Loader2 aria-hidden="true" className="mx-auto size-7 animate-spin" />
                </td>
              </tr>
            )}

            {!isLoading && message && (
              <tr>
                <td className="py-10 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                  {message}
                </td>
              </tr>
            )}

            {!isLoading &&
              !message &&
              rows.map((student) => {
                const medalLevel = getMedalLevel(student.total, medalLevelByTotal);

                return (
                  <tr
                    key={student.sbd}
                    className={[
                      "border-b border-slate-100 last:border-0 dark:border-slate-800",
                      getMedalRowClass(medalLevel)
                    ].join(" ")}
                  >
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-grid size-8 place-items-center rounded-md text-sm font-bold",
                          getMedalBadgeClass(medalLevel)
                        ].join(" ")}
                      >
                        {student.rank}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-ink dark:text-white">{student.sbd}</td>
                    {student.subjects.map((subject) => (
                      <td key={subject.label} className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                        {subject.score.toFixed(2)}
                      </td>
                    ))}
                    <td className="py-3 text-base font-bold text-teal">
                      {student.total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getMedalRowClass(medalLevel: number) {
  if (medalLevel === 1) {
    return "bg-yellow-100/90 dark:bg-yellow-500/20";
  }

  if (medalLevel === 2) {
    return "bg-slate-100/80 dark:bg-slate-700/60";
  }

  if (medalLevel === 3) {
    return "bg-orange-50/80 dark:bg-orange-500/15";
  }

  return "";
}

function getMedalBadgeClass(medalLevel: number) {
  if (medalLevel === 1) {
    return "bg-yellow-400 text-yellow-950 shadow-sm ring-1 ring-yellow-500/60";
  }

  if (medalLevel === 2) {
    return "bg-slate-300 text-slate-900 shadow-sm";
  }

  if (medalLevel === 3) {
    return "bg-orange-300 text-orange-950 shadow-sm";
  }

  return "bg-ink text-white dark:bg-slate-700";
}

function translateGroupDescription(code: ExamGroupCode, language: Language) {
  const descriptions: Record<Language, Record<ExamGroupCode, string>> = {
    en: {
      A: "Math, Physics, Chemistry",
      B: "Math, Chemistry, Biology",
      C: "Literature, History, Geography",
      D: "Math, Literature, Foreign Language"
    },
    vi: {
      A: "Toán, Vật lý, Hóa học",
      B: "Toán, Hóa học, Sinh học",
      C: "Ngữ văn, Lịch sử, Địa lý",
      D: "Toán, Ngữ văn, Ngoại ngữ"
    }
  };

  return descriptions[language][code];
}

function translateGroupSubject(label: string, language: Language) {
  const codeByLabel: Record<string, string> = {
    Math: "toan",
    Literature: "ngu_van",
    "Foreign Language": "ngoai_ngu",
    Physics: "vat_li",
    Chemistry: "hoa_hoc",
    Biology: "sinh_hoc",
    History: "lich_su",
    Geography: "dia_li"
  };

  return subjectName(language, codeByLabel[label] ?? label, label);
}
