import { z } from "zod";

export const windowAnalyticsSchema = z.object({
  windowId: z.string().min(1, "Window ID required")
});