import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findExamGroup } from "@/lib/exam-groups";

type TopGroupRow = {
  rank: number;
  sbd: string;
  subject_one: Prisma.Decimal;
  subject_two: Prisma.Decimal;
  subject_three: Prisma.Decimal;
  total: Prisma.Decimal;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const group = findExamGroup(url.searchParams.get("group"));
  const topStudents = await prisma.$queryRaw<TopGroupRow[]>`
    SELECT "rank", "sbd", "subject_one", "subject_two", "subject_three", "total"
    FROM "top_group_reports"
    WHERE "group" = ${group.code}
    ORDER BY "rank" ASC
  `;

  return NextResponse.json(
    topStudents.map((student) => ({
      rank: student.rank,
      sbd: student.sbd,
      group: group.code,
      subjects: group.subjects.map((subject, subjectIndex) => ({
        label: subject.label,
        score: Number(
          [student.subject_one, student.subject_two, student.subject_three][subjectIndex]
        )
      })),
      total: Number(student.total)
    }))
  );
}
