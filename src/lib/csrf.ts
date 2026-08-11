import { createMiddleware } from "@tanstack/react-start";

/**
 * Local port of TanStack Start's createCsrfMiddleware. Importing it from
 * "@tanstack/react-start" inside src/start.ts breaks once a shared (client +
 * server) module also imports from that package: the server bundle then
 * resolves the package to the client build, where the middleware export is
 * undefined at runtime ("createCsrfMiddleware is not a function").
 */

const csrfSymbol = Symbol.for("tanstack-start:csrf-middleware");

type CsrfContext = {
  request: Request;
  pathname: string;
  handlerType: string;
};

type CsrfOptions = {
  filter?: (ctx: CsrfContext) => boolean | Promise<boolean>;
  origin?: string | string[] | ((origin: string, ctx: CsrfContext) => boolean);
  referer?: boolean | ((referer: string, ctx: CsrfContext) => boolean);
  secFetchSite?: string | string[] | ((site: string, ctx: CsrfContext) => boolean);
  allowRequestsWithoutOriginCheck?: boolean;
  failureResponse?: Response | ((ctx: CsrfContext) => Response);
};

const getOriginFromUrl = (url: string): string | undefined => {
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

const isRefererSameOrigin = (referer: string, requestOrigin: string): boolean => {
  if (referer === requestOrigin) return true;
  if (!referer.startsWith(requestOrigin)) return false;
  if (referer.length === requestOrigin.length) return true;
  const code = referer.charCodeAt(requestOrigin.length);
  return code === 47 || code === 63 || code === 35;
};

const matchValue = async (
  matcher: string | string[] | ((value: string, ctx: CsrfContext) => boolean) | undefined,
  value: string,
  ctx: CsrfContext,
): Promise<boolean> => {
  if (typeof matcher === "function") return matcher(value, ctx);
  if (Array.isArray(matcher)) return matcher.includes(value);
  return value === matcher;
};

const getCsrfRequestValidationResult = async (
  opts: CsrfOptions,
  ctx: CsrfContext,
): Promise<boolean | undefined> => {
  const fetchSite = ctx.request.headers.get("Sec-Fetch-Site");
  if (fetchSite !== null) return matchValue(opts.secFetchSite ?? "same-origin", fetchSite, ctx);
  const origin = ctx.request.headers.get("Origin");
  if (origin !== null) {
    if (opts.origin) return matchValue(opts.origin, origin, ctx);
    return origin === new URL(ctx.request.url).origin;
  }
  const referer = ctx.request.headers.get("Referer");
  if (referer === null || opts.referer === false) return undefined;
  if (typeof opts.referer === "function") return opts.referer(referer, ctx);
  if (opts.origin) {
    const refererOrigin = getOriginFromUrl(referer);
    return refererOrigin !== undefined && matchValue(opts.origin, refererOrigin, ctx);
  }
  return isRefererSameOrigin(referer, new URL(ctx.request.url).origin);
};

const isCsrfRequestAllowed = async (opts: CsrfOptions, ctx: CsrfContext): Promise<boolean> => {
  const result = await getCsrfRequestValidationResult(opts, ctx);
  return result === true || (result === undefined && opts.allowRequestsWithoutOriginCheck === true);
};

const getFailureResponse = (opts: CsrfOptions, ctx: CsrfContext): Response => {
  if (typeof opts.failureResponse === "function") return opts.failureResponse(ctx);
  return opts.failureResponse?.clone() ?? new Response("Forbidden", { status: 403 });
};

export function createCsrfMiddleware(opts: CsrfOptions = {}) {
  const middleware = createMiddleware({ type: "request" }).server(
    async ({ request, pathname, handlerType, next }) => {
      const ctx: CsrfContext = { request, pathname, handlerType };
      if (opts.filter && !(await opts.filter(ctx))) return next();
      if (await isCsrfRequestAllowed(opts, ctx)) return next();
      return getFailureResponse(opts, ctx);
    },
  );
  Object.defineProperty(middleware, csrfSymbol, { value: true });
  return middleware;
}
