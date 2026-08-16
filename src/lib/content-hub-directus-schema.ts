import { DIRECTUS_URL } from "@/lib/directus";

export async function getDirectusCollectionFields(
  collection: string,
  token: string
): Promise<string[] | null> {
  const response = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const result = (await response.json().catch(() => null)) as
    | { data?: Array<{ field?: string }> }
    | null;

  if (!Array.isArray(result?.data)) {
    return null;
  }

  return result.data
    .map((field) => field.field)
    .filter((field): field is string => typeof field === "string" && field.length > 0);
}
