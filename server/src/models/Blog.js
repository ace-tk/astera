import mongoose from 'mongoose'

/**
 * A blog post. Designed to support many posts even though today only one
 * (the featured/latest) is ever rendered — see blogController.getFeaturedBlog.
 */
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, maxlength: 400 },
    content: { type: String, maxlength: 20000 },
    imageUrl: { type: String, required: true },
    author: { type: String, default: 'ATOOPV Team' },
    // Homepage shows the featured post if one exists, else the latest
    // published one — see getFeaturedBlog. Unpublished posts are drafts.
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

blogSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  return { ...o, id: String(o._id) }
}

export const Blog = mongoose.model('Blog', blogSchema)
