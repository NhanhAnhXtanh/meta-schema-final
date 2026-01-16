import type { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { eventReceived } from "../jmixSlice";
import { EnvelopeV1 } from "../types";

// Note: List slice không có trong meta-schema-final
// Middleware này có thể được sử dụng sau nếu cần
export const listMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action !== "object" || action === null || !("type" in action)) {
    return next(action);
  }
  if (action.type !== eventReceived.type) return next(action);

  const msg = (action as PayloadAction<EnvelopeV1>).payload;

  switch (msg.type) {
    case "LIST_LOAD_PAGE": {
      // Note: Request sẽ được gửi từ React component qua post() function
      break;
    }

    case "LIST_PAGE_DATA": {
      // Handle list data if needed
      break;
    }

    case "LIST_ERROR": {
      // Handle list error if needed
      break;
    }

    default:
      break;
  }

  return next(action);
};
