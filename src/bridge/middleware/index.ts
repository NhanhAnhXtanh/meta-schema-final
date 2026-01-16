import type { Middleware } from "@reduxjs/toolkit";
import { dashboardMiddleware } from "./dashboard";
import { listMiddleware } from "./list";

export const jmixMiddlewares: Middleware[] = [dashboardMiddleware, listMiddleware];
