import { useQuery } from "@tanstack/vue-query";

export function FetchData(endpoint: string, params?: Record<string, any>) {
  const queryKey = ["api-data", endpoint, params];

  const queryFn = async () => {
    const url = new URL(endpoint, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, val]) =>
        url.searchParams.append(key, String(val))
      );
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    return res.json();
  };

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
