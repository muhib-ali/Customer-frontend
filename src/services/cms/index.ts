import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/config/api';

/* ================= TYPES ================= */

export type CmsSubsection = {
  id: string;
  section_key: string;
  subsection_key: string | null;
  label: string | null;
  title: string | null;
  description: string | null;
  section_img_url: string | null;
  sort_order: number;
};

export type CmsSection = {
  id: string;
  section_key: string;
  title: string | null;
  description: string | null;
  section_img_url: string | null;
  sort_order: number;
  subsections: CmsSubsection[];
};

export type CmsResponse = {
  success: boolean;
  message: string;
  data: CmsSection[];
};

/* ================= QUERY KEY ================= */

export const cmsQueryKey = ['cms'] as const;

/* ================= FETCH FUNCTION ================= */

export async function fetchCms(): Promise<CmsSection[]> {

  const url = getApiUrl('/cms/getAll');   // yahan apna GET ALL endpoint lagana

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const json: CmsResponse = await response.json();

  if (!Array.isArray(json.data)) {
    console.error('CMS API: data array nahi hai', json);
    return [];
  }

  return json.data;
}

/* ================= REACT QUERY HOOK ================= */

export function useCms() {
  return useQuery({
    queryKey: cmsQueryKey,
    queryFn: fetchCms,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}