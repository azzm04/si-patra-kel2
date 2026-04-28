import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const beasiswa = await prisma.beasiswa.findMany({
    where:   { status: "AKTIF" },
    select:  { id: true, nama: true, penyelenggara: true, nominalPerSemester: true, kuota: true },
    orderBy: { nama: "asc" },
  });
  return NextResponse.json(beasiswa);
}