const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-4 text-xl font-bold">Ariel Pérez</h3>
            <p className="mb-4 text-gray-300">
              Cross-functional systems specialist helping Series A+ startups
              transform product & engineering velocity from constraint to
              competitive advantage.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Advisory & fractional leadership:{' '}
                <a
                  href="mailto:inquiries@adaptivealchemy.io"
                  className="hover:text-white"
                  data-track
                  data-track-prop-placement="footer"
                >
                  inquiries@adaptivealchemy.io
                </a>
              </p>
              <p className="text-sm text-gray-400">
                Speaking & collaboration:{' '}
                <a
                  href="mailto:ariel@arielperez.io"
                  className="hover:text-white"
                  data-track
                  data-track-prop-placement="footer"
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
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track
                  data-trackprop-placement="footer-resources"
                >
                  The Adaptive Alchemist
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
              target="_blank"
              rel="noopener noreferrer"
              data-track
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/arielxperez"
              className="text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              data-track
            >
              Twitter
            </a>
            <a
              href="https://github.com/arielperez82"
              className="text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              data-track
            >
              Github
            </a>
            <a
              href="https://www.adaptivealchemist.com/?utm_source=arielperez-io&utm_medium=referral"
              className="text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              data-track
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
