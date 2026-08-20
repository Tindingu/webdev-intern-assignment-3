"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { type Language, subjectName, translations } from "@/lib/i18n";

type Score = {
  code: string;
  label: string;
  color: string;
  score: number | null;
};

type LookupResult = {
  sbd: string;
  maNgoaiNgu: string | null;
  scores: Score[];
};

export function ScoreLookup({ language }: { language: Language }) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sbd = registrationNumber.trim();

    setMessage("");
    setResult(null);

    if (!/^\d{8}$/.test(sbd)) {
      setMessage(t.invalidRegistration);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/students/${sbd}`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(response.status === 404 ? t.notFound : data.message ?? t.notFound);
        return;
      }

      setResult(data);
    } catch {
      setMessage(t.scoreServiceError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,440px)_1fr]">
      <section className="rounded-lg border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h3 className="text-lg font-bold text-ink dark:text-white">{t.searchScore}</h3>
        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t.registrationNumber}
            <input
              value={registrationNumber}
              onChange={(event) => setRegistrationNumber(event.target.value)}
              inputMode="numeric"
              maxLength={8}
              placeholder={t.registrationPlaceholder}
              className="h-12 rounded-md border border-line bg-white px-3 text-base text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-teal px-4 text-sm font-bold text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Search aria-hidden="true" className="size-4" />
            )}
            {t.search}
          </button>
        </form>

        {message && (
          <div className="mt-4 flex gap-2 rounded-md border border-coral/30 bg-coral/10 p-3 text-sm font-medium text-coral">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col justify-between gap-2 border-b border-line pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-ink dark:text-white">{t.result}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {result ? `${t.registrationResult} ${result.sbd}` : t.noSearchResult}
            </p>
          </div>
          {result?.maNgoaiNgu && (
            <span className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {t.languageCode}: {result.maNgoaiNgu}
            </span>
          )}
        </div>

        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-3 pr-4 font-semibold">{t.subject}</th>
                <th className="py-3 pr-4 font-semibold">{t.score}</th>
                <th className="py-3 font-semibold">{t.level}</th>
              </tr>
            </thead>
            <tbody>
              {(result?.scores ?? []).map((score) => (
                <tr key={score.code} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="py-3 pr-4 font-semibold text-ink dark:text-white">
                    <span
                      className="mr-2 inline-block size-2 rounded-full"
                      style={{ backgroundColor: score.color }}
                    />
                    {subjectName(language, score.code, score.label)}
                  </td>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                    {score.score === null ? "-" : score.score.toFixed(2)}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">
                    {score.score === null ? t.noRegisteredScore : getScoreLevel(score.score, language)}
                  </td>
                </tr>
              ))}
              {!result && (
                <tr>
                  <td className="py-8 text-center text-slate-500 dark:text-slate-400" colSpan={3}>
                    {t.searchEmpty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-2 sm:hidden">
          {(result?.scores ?? []).map((score) => (
            <div
              key={score.code}
              className="rounded-md border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 font-semibold text-ink dark:text-white">
                  <span
                    className="mr-2 inline-block size-2 rounded-full"
                    style={{ backgroundColor: score.color }}
                  />
                  {subjectName(language, score.code, score.label)}
                </div>
                <div className="shrink-0 text-base font-bold text-teal">
                  {score.score === null ? "-" : score.score.toFixed(2)}
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {score.score === null ? t.noRegisteredScore : getScoreLevel(score.score, language)}
              </p>
            </div>
          ))}

          {!result && (
            <div className="rounded-md bg-slate-50 px-3 py-6 text-center text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              {t.searchEmpty}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getScoreLevel(score: number, language: Language) {
  const t = translations[language];

  if (score >= 8) {
    return t.excellent;
  }

  if (score >= 6) {
    return t.good;
  }

  if (score >= 4) {
    return t.average;
  }

  return t.belowAverage;
}
