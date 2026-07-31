import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    stack: z.array(z.string()).default([]),
    status: z.string().default("draft")
  })
});

const research = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    status: z.string().default("draft")
  })
});

const events = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    status: z.string().default("draft")
  })
});

const talks = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    status: z.string().default("draft")
  })
});

export const collections = { projects, research, events, talks };
