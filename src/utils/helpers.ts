export async function parseBody(request: Request): Promise<Record<string, any> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function paginate<T>(data: T[], page: number, limit: number): { data: T[]; total: number; page: number; limit: number } {
  const total = data.length;
  const start = (page - 1) * limit;
  return { data: data.slice(start, start + limit), total, page, limit };
}
