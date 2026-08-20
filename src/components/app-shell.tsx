"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  BarChart3,
  Medal,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun
} from "lucide-react";
import { ReportChart } from "@/components/report-chart";
import { ScoreLookup } from "@/components/score-lookup";
import { TopGroupsTable } from "@/components/top-groups-table";
import { type Language, translations } from "@/lib/i18n";

export type View = "lookup" | "reports" | "top";

const navItems = [
  { id: "lookup" as const, href: "/tra-cuu", labelKey: "lookup" as const, icon: Search },
  { id: "reports" as const, href: "/bao-cao", labelKey: "reports" as const, icon: BarChart3 },
  { id: "top" as const, href: "/top-khoi-thi", labelKey: "topGroups" as const, icon: Medal }
];

export function AppShell({ activeView }: { activeView: View }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = useStoredChoice("g-scores-theme", "light", isTheme);
  const language = useStoredChoice("g-scores-language", "vi", isLanguage);
  const t = translations[language];
  const activeTitle = useMemo(
    () => t[navItems.find((item) => item.id === activeView)?.labelKey ?? "lookup"],
    [activeView, t]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("g-scores-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("g-scores-language", language);
  }, [language]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-ink transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={[
            "sticky top-0 hidden h-screen shrink-0 border-r border-line bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col",
            isSidebarOpen ? "w-72" : "w-[88px]"
          ].join(" ")}
        >
          <div
            className={[
              "flex h-[88px] items-center border-b border-line px-4",
              isSidebarOpen ? "justify-between gap-3" : "justify-center"
            ].join(" ")}
          >
            <div
              className={[
                "flex min-w-0 items-center",
                isSidebarOpen ? "gap-3" : "hidden"
              ].join(" ")}
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-indigo text-lg font-bold text-white shadow-sm">
                G
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-ink dark:text-white">G-Scores</h1>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {t.dashboardSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen((value) => !value)}
              title={isSidebarOpen ? t.collapseSidebar : t.expandSidebar}
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:bg-slate-50 hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {isSidebarOpen ? (
                <PanelLeftClose aria-hidden="true" className="size-5" />
              ) : (
                <PanelLeftOpen aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            <p
              className={[
                "px-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-400",
                isSidebarOpen ? "" : "sr-only"
              ].join(" ")}
            >
              {t.menu}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={isSidebarOpen ? undefined : t[item.labelKey]}
                  className={[
                    "group flex h-12 w-full items-center rounded-lg text-left text-sm font-semibold transition",
                    isSidebarOpen ? "gap-3 px-3" : "justify-center px-0",
                    isActive
                      ? "bg-indigo/10 text-indigo dark:bg-indigo/20 dark:text-indigo-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  ].join(" ")}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  <span className={isSidebarOpen ? "truncate" : "sr-only"}>{t[item.labelKey]}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-line p-4 dark:border-slate-800" />
        </aside>

        <section className="min-w-0 flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-line bg-white/95 px-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:h-[88px] sm:px-6 xl:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:bg-slate-50 hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:size-11 lg:hidden"
                title={t.toggleMenu}
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-ink dark:text-white sm:text-2xl">
                  {activeTitle}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() =>
                  setStoredChoice("g-scores-theme", theme === "light" ? "dark" : "light")
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:h-11 sm:px-3"
                title={theme === "light" ? t.themeDark : t.themeLight}
              >
                {theme === "light" ? (
                  <Moon aria-hidden="true" className="size-4" />
                ) : (
                  <Sun aria-hidden="true" className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {theme === "light" ? t.themeDark : t.themeLight}
                </span>
              </button>

              <div className="flex h-10 rounded-lg border border-line bg-white p-1 text-sm font-bold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:h-11">
                {(["en", "vi"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStoredChoice("g-scores-language", item)}
                    className={[
                      "rounded-md px-2 uppercase transition sm:px-3",
                      language === item
                        ? "bg-indigo text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    ].join(" ")}
                    title={t.language}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="px-3 py-4 sm:px-6 sm:py-6 xl:px-8">
            {activeView === "lookup" && <ScoreLookup language={language} />}
            {activeView === "reports" && <ReportChart language={language} />}
            {activeView === "top" && <TopGroupsTable language={language} />}
          </div>
        </section>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden">
          <aside className="flex h-full w-72 flex-col border-r border-line bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-[88px] items-center justify-between border-b border-line px-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-indigo text-lg font-bold text-white">
                  G
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-ink dark:text-white">G-Scores</h1>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {t.dashboardSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="grid size-10 place-items-center rounded-lg border border-line text-slate-600 dark:border-slate-700 dark:text-slate-300"
                title={t.closeMenu}
              >
                <PanelLeftClose aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav className="space-y-2 px-4 py-6">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                {t.menu}
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={[
                      "flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition",
                      isActive
                        ? "bg-indigo/10 text-indigo dark:bg-indigo/20 dark:text-indigo-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    ].join(" ")}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span>{t[item.labelKey]}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </main>
  );
}

function useStoredChoice<T extends string>(
  key: string,
  fallback: T,
  isValid: (value: string | null) => value is T
) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const eventName = `${key}:change`;
      window.addEventListener(eventName, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(eventName, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => {
      const value = window.localStorage.getItem(key);
      return isValid(value) ? value : fallback;
    },
    () => fallback
  );
}

function setStoredChoice(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(`${key}:change`));
}

function isTheme(value: string | null): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "vi";
}
