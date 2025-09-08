// src/content/config.ts
import { defineCollection, z } from 'astro:content'

const media = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.enum(['video', 'article']),
    title: z.string(),
    description: z.string(),
    subtitle: z.string().optional(),
    url: z.string().url(),
    date: z.string(),
    publication: z.string(),
    image: z.string().optional(),
    featured: z.boolean().optional(),
    additionalLinks: z
      .array(
        z.object({
          platform: z.string(),
          url: z.string().url()
        })
      )
      .optional()
  })
})

export const collections = {
  media: media
}
