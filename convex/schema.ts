import { defineSchema, defineTable} from 'convex/server';
import { v } from 'convex/values';

export defualt defineSchema ({
    testimonials: defineTable({
        name: v.string(),
        email: v.optional(v.string()),
        comment: v.string(),
        isApproved: v.boolean(),
        submitedAt: v.number(),

    })
})

  .index("by_approval_and_time", ["isApproved", "submittedAt"])
  .index("by_rating", ["rating"]),
}