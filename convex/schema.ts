import { defineSchema, defineTable} from 'convex/server';
import { v } from 'convex/values';

export default defineSchema ({
    testimonials: defineTable({
        name: v.string(),
        email: v.optional(v.string()),
        comment: v.string(),
        isApproved: v.boolean(),
        submittedAt: v.number(),
        rating: v.optional(v.number()),
        consentToDisplay: v.boolean(),
    })
  .index("by_approval_and_time", ["isApproved", "submittedAt"])
  .index("by_rating", ["rating"]),
});