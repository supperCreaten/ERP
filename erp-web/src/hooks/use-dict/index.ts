import { useEffect, useMemo, useState } from "react";
import api from "@/api";

export type DictOption = {
  label: string;
  value: string;
  id: string;
};

type DictRecord = Record<string, DictOption[]>;

type DictItem = {
  dictLabel?: string;
  dictValue?: string;
  id?: string | number;
  dictId?: string | number;
};

/** 进程内缓存，避免同一字典编码重复请求 */
const dictCache: DictRecord = {};

function normalizeDictList(response: unknown): DictOption[] {
  if (!Array.isArray(response)) return [];
  return response.map((item: DictItem) => ({
    label: item?.dictLabel ?? "",
    value: item?.dictValue ?? "",
    id: String(item?.id ?? item?.dictId ?? ""),
  }));
}

function buildInitialDict(codes: string[]): DictRecord {
  return codes.reduce<DictRecord>((acc, code) => {
    if (dictCache[code]) {
      acc[code] = dictCache[code];
    }
    return acc;
  }, {});
}

/**
 * 按字典编码批量加载选项，返回形如 { sys_document_type: [...] } 的对象，可直接解构使用。
 */
export default function useDict(codes: string[]) {
  const stableCodes = useMemo(() => [...new Set(codes.filter(Boolean))], [codes.join(",")]);
  const codesKey = stableCodes.join(",");

  const [dict, setDict] = useState<DictRecord>(() => buildInitialDict(stableCodes));

  useEffect(() => {
    if (!stableCodes.length) {
      setDict({});
      return;
    }

    let cancelled = false;

    const fetchDict = async () => {
      const entries = await Promise.all(
        stableCodes.map(async (code) => {
          if (dictCache[code]) {
            return [code, dictCache[code]] as const;
          }
          const response = await api.getDictByCode({ dictCode: code });
          const options = normalizeDictList(response);
          dictCache[code] = options;
          return [code, options] as const;
        }),
      );

      if (cancelled) return;

      setDict((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    };

    fetchDict();

    return () => {
      cancelled = true;
    };
  }, [codesKey, stableCodes]);

  return dict;
}
