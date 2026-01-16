import type { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { eventReceived } from "../jmixSlice";
import type { EnvelopeV1 } from "../types";

// Note: Dashboard slice không có trong meta-schema-final
// Middleware này có thể được sử dụng sau nếu cần
export const dashboardMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action !== "object" || action === null || !("type" in action)) {
    return next(action);
  }
  if (action.type !== eventReceived.type) return next(action);

  const msg = (action as PayloadAction<EnvelopeV1>).payload;

  switch (msg.type) {
    case "DASHBOARD_LOAD": {
      // Note: Request sẽ được gửi từ React component qua post() function
      break;
    }

    case "DASHBOARD_DATA": {
      // Handle dashboard data if needed
      break;
    }

    case "DASHBOARD_ERROR": {
      // Handle dashboard error if needed
      break;
    }

    default:
      break;
  }

  return next(action);
};
