// Common exclude patterns for both Istanbul and webpack
const excludePatterns = [
  'node_modules/**',
  'coverage/**',
  'test/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.d.ts',
  '.next/**',
  'next.config.*',
  'jest.config.*',
  'eslint.config.*',
];

// Convert glob patterns to RegExp for webpack
const excludeRegexps = excludePatterns.map(pattern => 
  new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
);

// Export configurations for different tools
module.exports = {
  // Raw exclude patterns (glob format) for NYC/Istanbul config
  excludePatterns,

  // RegExp patterns for webpack config
  excludeRegexps
}; 