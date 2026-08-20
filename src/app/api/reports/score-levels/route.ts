import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubjectService } from "@/lib/subjects/subject-service";
import type { SubjectCode } from "@/lib/subjects/subject";

const subjectService = new SubjectService();

export async function GET() {
  const reports = await prisma.scoreReport.findMany({
    orderBy: {
      id: "asc"
    }
  });

  return NextResponse.json(
    reports.map((report) => {
      const subject = subjectService.findByCode(report.subject as SubjectCode);

      return {
        subject: report.subject,
        label: subject?.label ?? report.subject,
        color: subject?.color ?? "#5368d5",
        gte8: report.gte8,
        gte6lt8: report.gte6lt8,
        gte4lt6: report.gte4lt6,
        lt4: report.lt4
      };
    })
  );
}
