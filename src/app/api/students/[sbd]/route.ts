import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubjectService } from "@/lib/subjects/subject-service";
import { registrationNumberSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    sbd: string;
  }>;
};

const subjectService = new SubjectService();

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const parsed = registrationNumberSchema.safeParse(params.sbd);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid registration number" },
      { status: 400 }
    );
  }

  const result = await prisma.examResult.findUnique({
    where: {
      sbd: parsed.data
    },
    select: {
      sbd: true,
      maNgoaiNgu: true,
      toan: true,
      nguVan: true,
      ngoaiNgu: true,
      vatLi: true,
      hoaHoc: true,
      sinhHoc: true,
      lichSu: true,
      diaLi: true,
      gdcd: true
    }
  });

  if (!result) {
    return NextResponse.json(
      { message: "No score result found for this registration number" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    sbd: result.sbd,
    maNgoaiNgu: result.maNgoaiNgu,
    scores: subjectService.getAll().map((subject) => ({
      code: subject.code,
      label: subject.label,
      color: subject.color,
      score: subjectService.serializeScore(subject.extractScore(result))
    }))
  });
}
