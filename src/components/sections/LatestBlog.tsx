// src/components/sections/LatestBlog.tsx
import React, { useEffect, useState } from 'react'

interface BlogPost {
  title: string
  description: string
  publishingDate: string
  readingTime: string
  heroImageUrl: string
  url: string
}

interface LatestBlogProps {
  title: string
  subtitle: string
  posts: BlogPost[]
  blogUrl: string
  apiUrl: string
}

const LatestBlog: React.FC<LatestBlogProps> = ({
  title,
  subtitle,
  posts,
  blogUrl,
  apiUrl
}) => {
  const [currentPosts, setCurrentPosts] = useState<BlogPost[]>(posts)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!apiUrl) return

    const checkForUpdates = async () => {
      try {
        const response = await fetch(apiUrl)
        if (!response.ok) return

        const newPosts = await response.json()
        if (Array.isArray(newPosts) && newPosts.length > 0) {
          // Sort by publishing date and take the latest 3
          const sortedPosts = newPosts
            .sort(
              (a, b) =>
                new Date(b.publishingDate).getTime() -
                new Date(a.publishingDate).getTime()
            )
            .slice(0, 3)

          // Check if posts are different
          const postsChanged =
            JSON.stringify(sortedPosts) !== JSON.stringify(currentPosts)
          if (postsChanged) {
            setIsUpdating(true)
            // Add a small delay for smooth transition
            setTimeout(() => {
              setCurrentPosts(sortedPosts)
              setIsUpdating(false)
            }, 300)
          }
        }
      } catch (error) {
        console.warn('Failed to fetch updated blog posts:', error)
      }
    }

    // Check for updates once when component mounts
    checkForUpdates()
  }, [apiUrl, currentPosts])

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
            {title}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">{subtitle}</p>
        </div>

        <div
          className={`mb-12 grid grid-cols-1 gap-8 transition-opacity duration-300 md:grid-cols-2 lg:grid-cols-3 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}
        >
          {currentPosts.map((post, index) => (
            <article
              key={index}
              className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex-none">
                <img
                  src={post.heroImageUrl}
                  alt={`${post.title} hero`}
                  className="aspect-[16/9] h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    {new Date(post.publishingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 leading-relaxed text-gray-600">
                  {post.description}
                </p>

                <div className="mt-auto flex justify-end">
                  <a
                    href={`${post.url}?utm_source=arielperez-io&utm_medium=referral`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Read more
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <a
            href={`${blogUrl}?utm_source=arielperez-io&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-2 rounded-md px-8 py-3 text-lg font-medium text-white transition-colors"
          >
            Read all posts
          </a>
        </div>
      </div>
    </section>
  )
}

export default LatestBlog
