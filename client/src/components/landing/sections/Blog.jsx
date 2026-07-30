import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ImageOff, AlertTriangle } from 'lucide-react'
import { fetchFeaturedBlog } from '@/services/blog'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null)

const CARD_CLASS = 'overflow-hidden rounded-[1.75rem] border border-ink/8 bg-card shadow-soft'

/**
 * Homepage's Blog section — one featured (or latest) post, fetched from the
 * backend so editing it in the database changes what renders here with no
 * client redeploy. Same card grammar as Pricing/Testimonials (rounded-[1.75rem]
 * border-ink/8 bg-card shadow-soft, Reveal entrance).
 */
export default function Blog() {
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', 'featured'],
    queryFn: fetchFeaturedBlog,
  })

  return (
    <section id="blog" className="relative py-section">
      <div className="shell">
        <Reveal className="text-center">
          <span className="eyebrow justify-center"><span className="h-px w-8 bg-ink/30" /> From the notebook</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
            Blog
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Notes on meetings, intelligence, and building a product that reads the room.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 max-w-2xl">
          {isLoading && <BlogCardSkeleton />}
          {!isLoading && isError && <BlogCardError />}
          {!isLoading && !isError && !post && <BlogCardEmpty />}
          {!isLoading && !isError && post && <BlogCard post={post} />}
        </div>
      </div>
    </section>
  )
}

function BlogCard({ post }) {
  const date = fmtDate(post.publishedAt)
  return (
    <Reveal>
      <Link to={`/blog/${post.slug}`} className={cn('group block transition-shadow hover:shadow-lift', CARD_CLASS)}>
        <div className="aspect-[16/9] overflow-hidden bg-ink/[0.04]">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="lazy"
              decoding="async"
              width={1280}
              height={720}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted/50">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="p-8">
          <span className="eyebrow">{post.author || 'ATOOPV Team'}{date ? ` · ${date}` : ''}</span>
          <h3 className="mt-3 font-display text-2xl font-medium leading-tight tracking-tight text-balance">
            {post.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">{post.excerpt}</p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            Read more
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

function BlogCardSkeleton() {
  return (
    <div className={CARD_CLASS} aria-busy="true" aria-label="Loading latest blog post">
      <div className="aspect-[16/9] animate-pulse bg-ink/[0.06]" />
      <div className="p-8">
        <div className="h-3 w-40 animate-pulse rounded-full bg-ink/[0.08]" />
        <div className="mt-4 h-7 w-3/4 animate-pulse rounded-full bg-ink/[0.08]" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-ink/[0.06]" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-ink/[0.06]" />
        <div className="mt-6 h-4 w-24 animate-pulse rounded-full bg-ink/[0.06]" />
      </div>
    </div>
  )
}

function BlogCardEmpty() {
  return (
    <div className={cn(CARD_CLASS, 'border-dashed p-10 text-center shadow-none')}>
      <p className="text-sm text-muted">No blog posts published yet — check back soon.</p>
    </div>
  )
}

function BlogCardError() {
  return (
    <div className={cn(CARD_CLASS, 'border-coral/20 bg-coral/[0.04] p-10 text-center shadow-none')}>
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-coral/10 text-coral">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm text-coral">We couldn’t load the blog right now. Please try again shortly.</p>
    </div>
  )
}
