// convex/testimonials.ts
import { mutation, query } from "./_generated/server"; // Correct imports
import { v } from "convex/values";


// --- Mutation to add a new testimonial ---
export const addTestimonial = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    comment: v.string(),
    rating: v.optional(v.number()),
    consentToDisplay: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Basic server-side validation
    if (args.comment.trim().length < 10) {
      throw new Error("Comment must be at least 10 characters long.");
    }
    if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
        throw new Error("Rating must be between 1 and 5.");
    }
    if (!args.name.trim()) {
         throw new Error("Name cannot be empty.");
    }

    const testimonialId = await ctx.db.insert("testimonials", {
      name: args.name.trim(), // Trim whitespace
      email: args.email?.trim(), // Trim if provided
      comment: args.comment.trim(),
      consentToDisplay: args.consentToDisplay,
      isApproved: false, // Default to not approved
      submittedAt: Date.now(),
    });
    console.log(`Added testimonial: ${testimonialId}`);
    return testimonialId;
  },
});

// --- Query to get displayable testimonials ---
export const getDisplayableTestimonials = query({
    args: {
        count: v.optional(v.number()), // Optional arg to limit number returned
    },
    handler: async (ctx, args) => {
        let queryBuilder = ctx.db
            .query("testimonials")
            // Use the index for efficient filtering
            .withIndex("by_approval_and_time", q => q.eq("isApproved", true))
            // Further filter for consent (Convex might optimize this)
            .filter(q => q.eq(q.field("consentToDisplay"), true))
            // Order by submission time, newest first
            .order("desc");

         // Apply limit if provided and valid
         if (args.count !== undefined && args.count > 0) {
             queryBuilder = queryBuilder.take(args.count);
         } else {
              // Default limit if none provided (e.g., take latest 10)
              queryBuilder = queryBuilder.take(10);
         }

        const testimonials = await queryBuilder.collect();

        // Exclude email before returning to the client
        return testimonials.map(({ email, ...rest }) => rest);
    },
});