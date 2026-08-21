import { directusFetch } from "@/lib/directus-client";

export async function getDirectusCollectionFields(
  collection: string
): Promise<string[] | null> {
  const response = await directusFetch(`/fields/${collection}`, {
    authenticated: true,
  });

  if (!response.ok) return null;

  const result = (await response.json().catch(() => null)) as
    | { data?: Array<{ field?: string }> }
    | null;

  if (!Array.isArray(result?.data)) return null;

  return result.data
    .map((field) => field.field)
    .filter((field): field is string => typeof field === "string" && field.length > 0);
}
