import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ImageOff, AlertTriangle } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import { fetchBlogBySlug } from '@/services/blog'
import { usePageMeta } from '@/hooks/usePageMeta'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null)

/** The Read More destination from the Homepage's Blog section. Same public
 * page chrome as the ported ATOOPV pages (AmbientBackground/Navbar/Footer). */
export default function BlogPost() {
  const { slug } = useParams()
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => fetchBlogBySlug(slug),
    retry: false,
  })

  usePageMeta({ title: post?.title, description: post?.excerpt })

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen bg-paper"
    >
      <AmbientBackground />
      <Navbar />

      <div className="shell py-28 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <Link to="/#blog" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {isLoading && <PostSkeleton />}

          {!isLoading && (isError || !post) && (
            <div className="mt-10 rounded-[1.75rem] border border-coral/20 bg-coral/[0.04] p-10 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-coral/10 text-coral">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h1 className="mt-4 font-display text-xl font-medium tracking-tight">This post couldn’t be found.</h1>
              <p className="mt-2 text-sm text-muted">It may have been unpublished or the link is out of date.</p>
              <Link to="/" className="link-underline mt-5 inline-block text-sm font-medium text-ink">
                Return home
              </Link>
            </div>
          )}

          {!isLoading && !isError && post && (
            <article>
              <span className="eyebrow mt-8">
                {post.author || 'ATOOPV Team'}{fmtDate(post.publishedAt) ? ` · ${fmtDate(post.publishedAt)}` : ''}
              </span>
              <h1 className="mt-4 font-display text-display-sm font-semibold leading-[1.05] tracking-tight text-balance">
                {post.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">{post.excerpt}</p>

              <div className="mt-8 aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-ink/8 bg-ink/[0.04] shadow-soft">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} loading="eager" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted/50">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>

              {post.content && (
                <div className="mt-10 whitespace-pre-wrap text-base leading-relaxed text-ink/85">{post.content}</div>
              )}
            </article>
          )}
        </div>
      </div>

      <Footer />
    </motion.main>
  )
}

function PostSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="h-3 w-40 rounded-full bg-ink/[0.08]" />
      <div className="mt-4 h-10 w-full rounded-2xl bg-ink/[0.08]" />
      <div className="mt-3 h-5 w-3/4 rounded-full bg-ink/[0.06]" />
      <div className="mt-8 aspect-[16/9] rounded-[1.75rem] bg-ink/[0.06]" />
    </div>
  )
}
