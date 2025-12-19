import { useEffect, useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')

  const navigation = [
    { name: 'Media', href: '/media' },
    { name: 'Tools', href: '/tools/technical-debt-simulator' },
    { name: 'About', href: '/about' }
  ]

  useEffect(() => {
    // Set initial path
    setCurrentPath(window.location.pathname)

    // Listen for navigation changes (for SPA-like behavior)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === '/' && currentPath === '/') return true
    if (href !== '/' && currentPath.startsWith(href)) return true
    return false
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              Ariel Pérez
            </a>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden flex-1 justify-center space-x-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="cursor-pointer text-gray-600 hover:text-gray-900"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-gray-200 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-xl font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
