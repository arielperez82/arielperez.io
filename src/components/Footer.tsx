const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-4 text-xl font-bold">Ariel Pérez</h3>
            <p className="mb-4 text-gray-300">
              Cross-functional systems specialist helping Series B-D CTOs
              transform engineering velocity from constraint to competitive
              advantage.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Services:{' '}
                <a
                  href="mailto:inquiries@adaptivealchemy.io"
                  className="hover:text-white"
                >
                  inquiries@adaptivealchemy.io
                </a>
              </p>
              <p className="text-sm text-gray-400">
                Speaking:{' '}
                <a
                  href="mailto:ariel@arielperez.io"
                  className="hover:text-white"
                >
                  ariel@arielperez.io
                </a>
              </p>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href="https://www.adaptivealchemist.com/?utm_source=arielperez-io&utm_medium=referral"
                  className="hover:text-white"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Ariel Pérez. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <a
              href="https://linkedin.com/in/arielxperez"
              className="text-gray-400 hover:text-white"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/arielxperez"
              className="text-gray-400 hover:text-white"
            >
              Twitter
            </a>
            <a
              href="https://github.com/arielperez82"
              className="text-gray-400 hover:text-white"
            >
              Github
            </a>
            <a
              href="https://www.adaptivealchemist.com/?utm_source=arielperez-io&utm_medium=referral"
              className="text-gray-400 hover:text-white"
            >
              Blog
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
