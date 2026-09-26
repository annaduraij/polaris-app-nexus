/*
 * Project: Polaris
 * Date: 2026-09-26
 * File: worker.js
 * Description: Serve the app index at the canonical Polaris URL.
 */

const canonicalUrl = "https://ajay.nexus/";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "polaris.ajay.nexus" || url.pathname === "/polaris" || url.pathname.startsWith("/polaris/")) {
      const target = new URL(canonicalUrl);
      target.search = url.search;
      return Response.redirect(target, 308);
    }

    return env.ASSETS.fetch(request);
  },
};
