import { SignJWT, jwtVerify } from "jose";
import { authenticator } from "otplib";

const cors = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization"
};

type Env = {
	SUPABASE_URL: string;
	SUPABASE_KEY: string;
	JWT_SECRET: string;
};

class SupabaseRequestError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = "SupabaseRequestError";
		this.status = status;
	}
}

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...cors, "Content-Type": "application/json" }
	});
}

function successResponse(data: unknown, message = "Success", status = 200) {
	return new Response(JSON.stringify({ success: true, message, data }), {
		status,
		headers: { ...cors, "Content-Type": "application/json" }
	});
}

function errorResponse(message: string, status = 400) {
	return new Response(JSON.stringify({ success: false, message }), {
		status,
		headers: { ...cors, "Content-Type": "application/json" }
	});
}

async function verifyAdmin(request: Request, env: Env) {
	const auth = request.headers.get("Authorization");
	if (!auth) return null;
	try {
		const token = auth.replace("Bearer ", "");
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		if (payload.role !== "admin" && payload.role !== "super_admin") return null;
		return payload;
	} catch {
		return null;
	}
}

async function callSupabase(env: Env, path: string, init?: RequestInit) {
	if (!env.SUPABASE_URL || !env.SUPABASE_KEY) throw new Error("Supabase configuration missing");
	const res = await fetch(`${env.SUPABASE_URL}${path}`, {
		...init,
		headers: {
			apikey: env.SUPABASE_KEY,
			Authorization: `Bearer ${env.SUPABASE_KEY}`,
			...(init?.headers || {})
		}
	});
	if (res.status === 204) return null;
	const text = await res.text();
	if (!text) {
		if (!res.ok) throw new Error(`Supabase ${res.status} ${res.statusText}`);
		return null;
	}
	let data: unknown;
	try { data = JSON.parse(text); } catch {
		throw new Error(`Invalid JSON from Supabase (${res.status}): ${text.slice(0, 200)}`);
	}
	if (!res.ok) {
		const d = data as Record<string, unknown>;
		const msg = typeof d?.message === "string" ? d.message : typeof d?.msg === "string" ? d.msg : JSON.stringify(data);
		throw new SupabaseRequestError(`Supabase ${res.status}: ${msg}`, res.status);
	}
	return data;
}

async function getBody(request: Request) {
	try { return await request.json(); } catch { return null; }
}

function getSiteContentTable(pathname: string): string | null {
	if (pathname === "/api/site-content") return "site_content";
	if (pathname === "/api/real-state-site-content" || pathname === "/api/real-estate-site-content") return "realstate_site_content";
	return null;
}

async function deleteImagesFromStorage(env: Env, imageUrls: string[]) {
	try {
		const filePaths = imageUrls.map(url => url.split("/storage/v1/object/public/")[1]);
		await fetch(`${env.SUPABASE_URL}/storage/v1/object/remove`, {
			method: "POST",
			headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}`, "Content-Type": "application/json" },
			body: JSON.stringify({ bucket: "Real-Estate-Images", paths: filePaths })
		});
	} catch (err) { console.error("Image delete failed:", err); }
}

export default {
	async fetch(request: Request, env: Env) {
		try {
			if (request.method === "OPTIONS") return new Response(null, { headers: cors });

			const url = new URL(request.url);
			const { pathname } = url;

			const isPublic =
				request.method === "GET" ||
				pathname === "/api/users/login" ||
				pathname === "/api/users/2fa/setup" ||
				pathname === "/api/users/2fa/verify-setup";

			if (!isPublic && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
				const admin = await verifyAdmin(request, env);
				if (!admin) return errorResponse("Unauthorized", 401);
			}

			// ── health ──
			if (pathname === "/" && request.method === "GET") return successResponse("API is running 🚀");

			// ── properties ──
			if (pathname === "/api/properties" && request.method === "GET")
				return successResponse(await callSupabase(env, "/rest/v1/properties?select=*&order=createdat.desc"), "Properties fetched");

			if (pathname.startsWith("/api/properties/") && request.method === "GET") {
				const id = pathname.split("/").pop();
				return successResponse(await callSupabase(env, `/rest/v1/properties?id=eq.${id}&select=*`), "Property fetched");
			}

			if (pathname === "/api/properties" && request.method === "POST") {
				const body = await getBody(request);
				if (!body) return errorResponse("Invalid or empty JSON body", 400);
				return successResponse(await callSupabase(env, "/rest/v1/properties", {
					method: "POST",
					headers: { "Content-Type": "application/json", Prefer: "return=representation" },
					body: JSON.stringify(body)
				}), "Property created", 201);
			}

			if (pathname.startsWith("/api/properties/") && request.method === "PATCH") {
				const id = pathname.split("/").pop();
				const body = await getBody(request);
				if (!body) return errorResponse("Invalid or empty JSON body", 400);
				return successResponse(await callSupabase(env, `/rest/v1/properties?id=eq.${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json", Prefer: "return=representation" },
					body: JSON.stringify(body)
				}), "Property updated");
			}

			if (pathname.startsWith("/api/properties/") && request.method === "DELETE") {
				const id = pathname.split("/").pop();
				const existing = await callSupabase(env, `/rest/v1/properties?id=eq.${id}&select=images`) as Record<string, unknown>[] | null;
				await callSupabase(env, `/rest/v1/properties?id=eq.${id}`, { method: "DELETE" });
				if (existing?.[0]?.images) await deleteImagesFromStorage(env, existing[0].images as string[]);
				return successResponse(null, "Property deleted");
			}

			// ── site content ──
			const siteContentTable = getSiteContentTable(pathname);
			if (siteContentTable) {
				const scp = `/rest/v1/${siteContentTable}?key=eq.main`;
				if (request.method === "GET")
					return successResponse(await callSupabase(env, `${scp}&select=*`), "Site content fetched");
				if (request.method === "POST") {
					const body = await getBody(request);
					if (!body) return errorResponse("Invalid or empty JSON body", 400);
					return successResponse(await callSupabase(env, `/rest/v1/${siteContentTable}`, {
						method: "POST",
						headers: { "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=representation" },
						body: JSON.stringify({ key: "main", ...(body as object) })
					}), "Site content created");
				}
				if (["PUT", "PATCH"].includes(request.method)) {
					const body = await getBody(request);
					if (!body) return errorResponse("Invalid or empty JSON body", 400);
					return successResponse(await callSupabase(env, scp, {
						method: "PATCH",
						headers: { "Content-Type": "application/json", "Prefer": "return=representation" },
						body: JSON.stringify(body)
					}), "Site content updated");
				}
				if (request.method === "DELETE")
					return successResponse(await callSupabase(env, scp, { method: "DELETE" }), "Site content deleted");
			}

			// ── admin users ──
			if (pathname === "/api/users/register" && request.method === "POST") {
				const body = (await getBody(request)) as Record<string, unknown> | null;
				if (!body) return errorResponse("Invalid or empty JSON body", 400);
				if (!body.email || !body.username) return errorResponse("Username and email required");
				const result = await callSupabase(env, "/rest/v1/users", {
					method: "POST",
					headers: { "Content-Type": "application/json", "Prefer": "return=representation" },
					body: JSON.stringify({ username: body.username, email: body.email, role: body.role === "super_admin" ? "super_admin" : "admin" })
				});
				return successResponse(result, "Admin created successfully");
			}

			if (pathname === "/api/users/login" && request.method === "POST") {
				const body = (await request.json()) as Record<string, unknown>;
				if (!body.email || !body.token) return errorResponse("Email and token required");
				const res = await fetch(`${env.SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(body.email as string)}&role=in.(admin,super_admin)`, {
					headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` }
				});
				const users = JSON.parse(await res.text()) as Record<string, unknown>[];
				if (!users || users.length === 0) return errorResponse("User not found", 404);
				const user = users[0];
				if (!user.twoFactorSecret) return errorResponse("2FA not setup", 400);
				if (!authenticator.check(String(body.token), user.twoFactorSecret as string)) return errorResponse("Invalid OTP", 401);
				const secret = new TextEncoder().encode(env.JWT_SECRET);
				const token = await new SignJWT({ id: user.id, role: user.role }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
				const { twoFactorSecret: _s, ...safeUser } = user;
				return successResponse({ user: safeUser, token }, "Login successful");
			}

			if (pathname === "/api/users" && request.method === "GET") {
				if (!(await verifyAdmin(request, env))) return errorResponse("Unauthorized", 401);
				return successResponse(await callSupabase(env, "/rest/v1/users?select=*"), "Users fetched successfully");
			}

			if (pathname === "/api/users/2fa/setup" && request.method === "POST") {
				const body = (await request.json()) as Record<string, unknown>;
				if (!body?.email) return errorResponse("Email required");
				const res = await fetch(`${env.SUPABASE_URL}/rest/v1/users?email=eq.${body.email}`, { headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` } });
				const users = JSON.parse(await res.text()) as Record<string, unknown>[];
				if (!users?.length) return errorResponse("User not found", 404);
				const user = users[0];
				if (user.twoFactorEnabled) return errorResponse("2FA already enabled", 400);
				const tfSecret = authenticator.generateSecret();
				const otpauth_url = authenticator.keyuri(user.email as string, "DreamHome", tfSecret);
				await fetch(`${env.SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
					method: "PATCH",
					headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
					body: JSON.stringify({ twoFactorSecret: tfSecret })
				});
				return jsonResponse({ message: "Scan QR in Google Authenticator", data: { secret: tfSecret, otpauth_url } });
			}

			if (pathname === "/api/users/2fa/verify-setup" && request.method === "POST") {
				const body = (await request.json()) as Record<string, unknown>;
				if (!body?.email || !body?.token) return errorResponse("Email and token required");
				const res = await fetch(`${env.SUPABASE_URL}/rest/v1/users?email=eq.${body.email}`, { headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` } });
				const users = JSON.parse(await res.text()) as Record<string, unknown>[];
				if (!users?.length) return errorResponse("User not found", 404);
				const user = users[0];
				if (!user.twoFactorSecret) return errorResponse("2FA not started", 400);
				if (!authenticator.check(String(body.token), user.twoFactorSecret as string)) return errorResponse("Invalid code", 400);
				await callSupabase(env, `/rest/v1/users?id=eq.${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ twoFactorEnabled: true }) });
				const secret = new TextEncoder().encode(env.JWT_SECRET);
				const token = await new SignJWT({ id: user.id, role: user.role }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
				return successResponse({ token }, "2FA enabled");
			}

			return errorResponse("Not Found", 404);

		} catch (err: unknown) {
			console.error("Unhandled error", err);
			if (err instanceof SupabaseRequestError) return errorResponse(err.message, err.status);
			return errorResponse("Unhandled error: " + (err as Error).message, 500);
		}
	}
};
