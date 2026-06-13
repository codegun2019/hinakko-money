// Vercel Node.js serverless function — wraps TanStack Start Web Fetch handler
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import server from "../dist/server/server.js";

export const config = {
  runtime: "nodejs22.x",
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host  = req.headers["x-forwarded-host"] as string || req.headers.host || "localhost";
  const url   = new URL(req.url ?? "/", `${proto}://${host}`);

  // Build headers
  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val == null) continue;
    if (Array.isArray(val)) val.forEach((v) => headers.append(key, v));
    else headers.set(key, val);
  }

  // Read body for POST/PUT/PATCH
  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (c: Buffer) => chunks.push(c));
      req.on("end",  () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }

  const request = new Request(url.toString(), {
    method:  req.method ?? "GET",
    headers,
    body,
  });

  const response = await server.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));

  if (!response.body) {
    res.end();
    return;
  }

  // Stream response body
  const reader = response.body.getReader();
  const nodeStream = new Readable({ read() {} });
  nodeStream.pipe(res);

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { nodeStream.push(null); break; }
        nodeStream.push(value);
      }
    } catch {
      nodeStream.destroy();
    }
  })();
}
