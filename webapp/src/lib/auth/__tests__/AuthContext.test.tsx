import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '../AuthContext'
import { TestAuthService } from './TestAuthService'

// Test component that uses auth context
function TestComponent() {
  const { user, signIn, signUp, signOut, error } = useAuth()
  return (
    <div>
      <div data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  let authService: TestAuthService

  beforeEach(() => {
    authService = new TestAuthService()
  })

  it('provides authentication state and methods', async () => {
    render(
      <AuthProvider authService={authService}>
        <TestComponent />
      </AuthProvider>
    )

    // Initial state
    expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out')
    expect(screen.getByTestId('error')).toHaveTextContent('no-error')

    // Test sign in
    const testUser = { id: '123', email: 'test@example.com' }
    authService.setUser(testUser)

    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
    })

    // Test sign up
    authService.setUser(testUser)

    fireEvent.click(screen.getByText('Sign Up'))

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
    })

    // Test sign out
    authService.setUser(null)

    fireEvent.click(screen.getByText('Sign Out'))

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out')
    })
  })

  it('handles authentication errors', async () => {
    render(
      <AuthProvider authService={authService}>
        <TestComponent />
      </AuthProvider>
    )

    // Test sign in error
    authService.setError(new Error('An error occurred during sign in'))

    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('An error occurred during sign in')
    })
  })
}) 