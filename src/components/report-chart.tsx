"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar
} from "recharts";
import { Activity, Award, BarChart3, Loader2, PieChart as PieChartIcon, Users } from "lucide-react";
import { type Language, subjectName, translations } from "@/lib/i18n";

type ReportRow = {
  subject: string;
  label: string;
  color: string;
  gte8: number;
  gte6lt8: number;
  gte4lt6: number;
  lt4: number;
};

const levelConfig = [
  { key: "gte8" as const, label: ">= 8", color: "#0f9f9a" },
  { key: "gte6lt8" as const, label: "6 - 7.99", color: "#5368d5" },
  { key: "gte4lt6" as const, label: "4 - 5.99", color: "#f2a93b" },
  { key: "lt4" as const, label: "< 4", color: "#f26b5e" }
];

export function ReportChart({ language }: { language: Language }) {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 639px)");
  const t = translations[language];

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/reports/score-levels");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message ?? t.reportServiceError);
          return;
        }

        setRows(data);
        setSelectedSubject(data[0]?.subject ?? "");
      } catch {
        setMessage(t.reportServiceError);
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, [t.reportServiceError]);

  const dashboard = useMemo(() => {
    const subjectsWithTotals = rows.map((row) => ({
      ...row,
      translatedLabel: subjectName(language, row.subject, row.label),
      total: row.gte8 + row.gte6lt8 + row.gte4lt6 + row.lt4,
      excellentRate:
        row.gte8 + row.gte6lt8 + row.gte4lt6 + row.lt4 > 0
          ? row.gte8 / (row.gte8 + row.gte6lt8 + row.gte4lt6 + row.lt4)
          : 0,
      belowFourRate:
        row.gte8 + row.gte6lt8 + row.gte4lt6 + row.lt4 > 0
          ? row.lt4 / (row.gte8 + row.gte6lt8 + row.gte4lt6 + row.lt4)
          : 0
    }));
    const totalScores = subjectsWithTotals.reduce((sum, row) => sum + row.total, 0);
    const totalExcellent = subjectsWithTotals.reduce((sum, row) => sum + row.gte8, 0);
    const totalBelowFour = subjectsWithTotals.reduce((sum, row) => sum + row.lt4, 0);
    const bestSubject = [...subjectsWithTotals].sort(
      (a, b) => b.excellentRate - a.excellentRate
    )[0];
    const hardestSubject = [...subjectsWithTotals].sort(
      (a, b) => b.belowFourRate - a.belowFourRate
    )[0];
    const selected = subjectsWithTotals.find((row) => row.subject === selectedSubject);
    const pieData = selected
      ? levelConfig.map((level) => ({
          name: level.label,
          value: selected[level.key],
          color: level.color
        }))
      : [];
    const radialData = subjectsWithTotals
      .map((row) => ({
        name: subjectName(language, row.subject, row.label),
        value: Number((row.excellentRate * 100).toFixed(1)),
        fill: row.color
      }))
      .sort((a, b) => b.value - a.value);

    return {
      subjectsWithTotals,
      totalScores,
      totalExcellent,
      totalBelowFour,
      excellentRate: totalScores > 0 ? totalExcellent / totalScores : 0,
      belowFourRate: totalScores > 0 ? totalBelowFour / totalScores : 0,
      bestSubject,
      hardestSubject,
      selected,
      pieData,
      radialData
    };
  }, [rows, selectedSubject, language]);

  return (
    <section className="grid max-w-full gap-4 overflow-hidden sm:gap-5">
      <div className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-ink dark:text-white">{t.reportTitle}</h3>
            {/* <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.reportSubtitle}
            </p> */}
          </div>
          {rows.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:w-auto sm:min-w-40"
            >
              {rows.map((row) => (
                <option key={row.subject} value={row.subject}>
                  {subjectName(language, row.subject, row.label)}
                </option>
              ))}
            </select>
          )}
        </div>

        {isLoading && (
          <div className="grid min-h-[520px] place-items-center text-slate-500 dark:text-slate-400">
            <Loader2 aria-hidden="true" className="size-7 animate-spin" />
          </div>
        )}

        {!isLoading && message && (
          <div className="mt-5 grid min-h-[360px] place-items-center rounded-md bg-slate-50 px-4 text-center text-sm font-medium text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            {message}
          </div>
        )}
      </div>

      {!isLoading && !message && rows.length > 0 && (
        <>
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Users}
              label={t.recordedScores}
              value={dashboard.totalScores.toLocaleString()}
              detail={t.allNonEmptyScores}
            />
            <MetricCard
              icon={Award}
              label={t.excellentScores}
              value={dashboard.totalExcellent.toLocaleString()}
              detail={`${formatPercent(dashboard.excellentRate)} ${t.ofRecordedScores}`}
            />
            <MetricCard
              icon={Activity}
              label={t.below4Scores}
              value={dashboard.totalBelowFour.toLocaleString()}
              detail={`${formatPercent(dashboard.belowFourRate)} ${t.ofRecordedScores}`}
            />
            <MetricCard
              icon={BarChart3}
              label={t.strongestSubject}
              value={
                dashboard.bestSubject
                  ? subjectName(language, dashboard.bestSubject.subject, dashboard.bestSubject.label)
                  : "-"
              }
              detail={`${formatPercent(dashboard.bestSubject?.excellentRate ?? 0)} >= 8`}
            />
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
            <ChartPanel
              title={t.stackedLevels}
              description={t.compareDistribution}
              icon={BarChart3}
            >
              <div className="h-[320px] w-full sm:h-[430px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboard.subjectsWithTotals}
                    margin={
                      isMobile
                        ? { top: 8, right: 0, left: -18, bottom: 8 }
                        : { top: 12, right: 8, left: 8, bottom: 56 }
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" />
                    <XAxis
                      dataKey="translatedLabel"
                      angle={isMobile ? 0 : -28}
                      textAnchor={isMobile ? "middle" : "end"}
                      height={isMobile ? 16 : 82}
                      interval={0}
                      tick={isMobile ? false : { fontSize: 12, fill: "#475569" }}
                    />
                    <YAxis width={isMobile ? 48 : 60} tick={{ fontSize: isMobile ? 10 : 12, fill: "#475569" }} />
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
                    <Bar dataKey="gte8" stackId="score" name=">= 8" fill="#0f9f9a" />
                    <Bar dataKey="gte6lt8" stackId="score" name="6 - 7.99" fill="#5368d5" />
                    <Bar dataKey="gte4lt6" stackId="score" name="4 - 5.99" fill="#f2a93b" />
                    <Bar dataKey="lt4" stackId="score" name="< 4" fill="#f26b5e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel
              title={t.selectedSubjectMix}
              description={
                dashboard.selected
                  ? subjectName(language, dashboard.selected.subject, dashboard.selected.label)
                  : t.chooseSubject
              }
              icon={PieChartIcon}
            >
              <div className="h-[300px] w-full sm:h-[430px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboard.pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={isMobile ? "48%" : "52%"}
                      outerRadius={isMobile ? "70%" : "78%"}
                      paddingAngle={3}
                    >
                      {dashboard.pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
            <ChartPanel
              title={t.excellentRateRanking}
              description={t.excellentRateDescription}
              icon={Award}
            >
              <div className="h-[280px] w-full sm:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius={isMobile ? "12%" : "18%"}
                    outerRadius={isMobile ? "88%" : "92%"}
                    data={dashboard.radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" background cornerRadius={6} />
                    <Tooltip formatter={(value) => `${value}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {dashboard.radialData.map((item) => (
                  <div key={item.name} className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="truncate font-semibold text-slate-600 dark:text-slate-300">
                      {item.name}
                    </span>
                    <span className="shrink-0 font-bold text-ink dark:text-white">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartPanel>

            <section className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-col gap-1 border-b border-line pb-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-ink dark:text-white">{t.subjectBreakdown}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.subjectBreakdownDescription}
                </p>
              </div>
              <div className="mt-4 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-3 pr-4 font-semibold">{t.subject}</th>
                      <th className="py-3 pr-4 font-semibold">{t.total}</th>
                      <th className="py-3 pr-4 font-semibold">&gt;= 8</th>
                      <th className="py-3 pr-4 font-semibold">6 - 7.99</th>
                      <th className="py-3 pr-4 font-semibold">4 - 5.99</th>
                      <th className="py-3 pr-4 font-semibold">&lt; 4</th>
                      <th className="py-3 font-semibold">{t.excellentRate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.subjectsWithTotals.map((row) => (
                      <tr key={row.subject} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                        <td className="py-3 pr-4 font-bold text-ink dark:text-white">
                          <span
                            className="mr-2 inline-block size-2 rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                          {subjectName(language, row.subject, row.label)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{row.total.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{row.gte8.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{row.gte6lt8.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{row.gte4lt6.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{row.lt4.toLocaleString()}</td>
                        <td className="py-3 font-bold text-teal">{formatPercent(row.excellentRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid gap-3 sm:hidden">
                {dashboard.subjectsWithTotals.map((row) => (
                  <article
                    key={row.subject}
                    className="rounded-md border border-line bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-ink dark:text-white">
                          <span
                            className="mr-2 inline-block size-2 rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                          {subjectName(language, row.subject, row.label)}
                        </h4>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t.total}: {row.total.toLocaleString()}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-teal">
                        {formatPercent(row.excellentRate)}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <BreakdownItem label=">= 8" value={row.gte8} />
                      <BreakdownItem label="6 - 7.99" value={row.gte6lt8} />
                      <BreakdownItem label="4 - 5.99" value={row.gte4lt6} />
                      <BreakdownItem label="< 4" value={row.lt4} />
                    </dl>
                  </article>
                ))}
              </div>
              <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {t.highestBelow4Rate}:{" "}
                {dashboard.hardestSubject
                  ? subjectName(language, dashboard.hardestSubject.subject, dashboard.hardestSubject.label)
                  : "-"}{" "}
                (
                {formatPercent(dashboard.hardestSubject?.belowFourRate ?? 0)})
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function MetricCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: IconComponent;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold text-ink dark:text-white">{value}</p>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-teal dark:bg-slate-800">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{detail}</p>
    </section>
  );
}

function ChartPanel({
  title,
  description,
  icon: Icon,
  children
}: {
  title: string;
  description: string;
  icon: IconComponent;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-line pb-4 dark:border-slate-800">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-ink dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
      {children}
    </section>
  );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white px-2 py-2 dark:bg-slate-900">
      <dt className="font-semibold text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 font-bold text-ink dark:text-white">{value.toLocaleString()}</dd>
    </div>
  );
}

function formatTooltipValue(value: unknown): string | number {
  return typeof value === "number" ? value.toLocaleString() : String(value ?? "");
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatches = () => setMatches(media.matches);

    updateMatches();
    media.addEventListener("change", updateMatches);

    return () => media.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}
