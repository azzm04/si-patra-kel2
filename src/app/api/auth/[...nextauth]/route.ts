// src/app/api/auth/nextauth/route.ts
// NOTE: File ini harus di-rename ke [...nextauth]/route.ts
// karena bash tidak bisa membuat folder [...nextauth]
// Rename manual: mv src/app/api/auth/nextauth src/app/api/auth/[...nextauth]
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
