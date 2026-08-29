import { directusFetch } from "@/lib/directus-client";

async function directusFieldExists(collection: string, field: string) {
  const response = await directusFetch(`/fields/${collection}/${field}`, {
    authenticated: true,
    cache: "no-store",
  });

  return response.ok;
}

export async function getDirectusCollectionFields(
  collection: string,
  verifyFields: Iterable<string> = []
): Promise<string[] | null> {
  const response = await directusFetch(`/fields/${collection}`, {
    authenticated: true,
    cache: "no-store",
  });

  if (!response.ok) return null;

  const result = (await response.json().catch(() => null)) as
    | { data?: Array<{ field?: string }> }
    | null;

  if (!Array.isArray(result?.data)) return null;

  const fields = new Set(
    result.data
      .map((field) => field.field)
      .filter((field): field is string => typeof field === "string" && field.length > 0)
  );

  for (const field of verifyFields) {
    if (fields.has(field)) continue;
    if (await directusFieldExists(collection, field)) fields.add(field);
  }

  return [...fields];
}
