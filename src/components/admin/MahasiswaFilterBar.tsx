"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

export default function MahasiswaFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          {isPending ? (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}
          <input
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => updateParams("search", e.target.value)}
            placeholder="Cari nama, email, NIM, prodi..."
            className="input pl-10 text-sm"
          />
        </div>

        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParams("status", e.target.value)}
          className="input w-auto text-sm"
          title="input-status"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>
    </div>
  );
}
