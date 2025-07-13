import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().optional(),
});

export const devToSchema = z.object({
  username: z.string().min(1, "Username is required"),
});
