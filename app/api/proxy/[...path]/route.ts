import { type NextRequest, NextResponse } from "next/server"

// Base URL of the Swigg backend, configured via env variable.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ""

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const targetPath = path.join("/")

  if (!BACKEND_URL) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend URL is not configured. Set the NEXT_PUBLIC_API_BASE_URL environment variable to your API server.",
      },
      { status: 503 },
    )
  }

  const search = req.nextUrl.search
  const targetUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/${targetPath}${search}`

  const headers = new Headers()
  const auth = req.headers.get("authorization")
  if (auth) headers.set("authorization", auth)
  const contentType = req.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  let body: string | undefined
  if (!["GET", "HEAD"].includes(req.method)) {
    body = await req.text()
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    })

    const text = await res.text()
    const responseHeaders = new Headers()
    const resContentType = res.headers.get("content-type")
    if (resContentType) responseHeaders.set("content-type", resContentType)

    return new NextResponse(text, {
      status: res.status,
      headers: responseHeaders,
    })
  } catch (err) {
    console.log("[v0] proxy error:", err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the backend server. Check that NEXT_PUBLIC_API_BASE_URL points to a running API.",
      },
      { status: 502 },
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
