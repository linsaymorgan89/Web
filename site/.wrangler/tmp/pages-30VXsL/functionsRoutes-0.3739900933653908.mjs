import { onRequest as __api_admin_js_onRequest } from "/home/tacavar/workspaces/theeroticmorgan-rebuild/site/functions/api/admin.js"
import { onRequestPost as __api_js_onRequestPost } from "/home/tacavar/workspaces/theeroticmorgan-rebuild/site/functions/api.js"
import { onRequest as ___middleware_js_onRequest } from "/home/tacavar/workspaces/theeroticmorgan-rebuild/site/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/admin",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_admin_js_onRequest],
    },
  {
      routePath: "/api",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__api_js_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]