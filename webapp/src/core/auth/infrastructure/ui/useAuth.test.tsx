import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'
import { TestAuthService } from '@test/core/auth/infrastructure/TestAuthService'

// Test component that uses auth context
function TestComponent() {
  const { user, signIn, signUp, signOut, error } = useAuth()
  return (
    <div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe('useAuth', () => {
  let authService: TestAuthService
  const testUser = { id: '123', email: 'test@example.com' }

  beforeEach(() => {
    authService = new TestAuthService()
  })

  describe('sign in', () => {
    it('updates user state when sign in is successful', async () => {
      render(
        <AuthProvider authService={authService}>
          <TestComponent />
        </AuthProvider>
      )
      
      // Initial state check
      expect(screen.getByTestId('user-data')).toHaveTextContent('no-user')
      
      // Set up successful sign in
      authService.setUser(testUser)
      
      // Trigger sign in
      fireEvent.click(screen.getByText('Sign In'))
      
      // Verify state update with actual user data
      await waitFor(() => {
        expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(testUser))
      })
    })

    it('handles sign in errors', async () => {
      render(
        <AuthProvider authService={authService}>
          <TestComponent />
        </AuthProvider>
      )
      
      // Set up sign in error
      authService.setError(new Error('Invalid credentials'))
      
      // Trigger sign in
      fireEvent.click(screen.getByText('Sign In'))
      
      // Verify error state and no user is set
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
        expect(screen.getByTestId('user-data')).toHaveTextContent('no-user')
      })
    })
  })

  describe('sign up', () => {
    it('updates user state when sign up is successful', async () => {
      render(
        <AuthProvider authService={authService}>
          <TestComponent />
        </AuthProvider>
      )
      
      // Set up successful sign up
      authService.setUser(testUser)
      
      // Trigger sign up
      fireEvent.click(screen.getByText('Sign Up'))
      
      // Verify state update with actual user data
      await waitFor(() => {
        expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(testUser))
      })
    })

    it('handles sign up errors', async () => {
      render(
        <AuthProvider authService={authService}>
          <TestComponent />
        </AuthProvider>
      )
      
      // Set up sign up error
      authService.setError(new Error('Email already exists'))
      
      // Trigger sign up
      fireEvent.click(screen.getByText('Sign Up'))
      
      // Verify error state and no user is set
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email already exists')
        expect(screen.getByTestId('user-data')).toHaveTextContent('no-user')
      })
    })
  })

  describe('sign out', () => {
    it('clears user state when sign out is successful', async () => {
      // Set initial logged in state
      authService.setUser(testUser)

      render(
        <AuthProvider authService={authService}>
          <TestComponent />
        </AuthProvider>
      )
            
      // Check for initial user state
      await waitFor(() => {
        expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(testUser))
      })
      
      // Set up successful sign out
      authService.setUser(null)
      
      // Trigger sign out
      fireEvent.click(screen.getByText('Sign Out'))
      
      // Verify user is completely cleared
      await waitFor(() => {
        expect(screen.getByTestId('user-data')).toHaveTextContent('no-user')
      })
    })

    it('handles sign out errors and maintains user state', async () => {
      // Set initial logged in state
      authService.setUser(testUser)
  
      render(
        <AuthProvider authService={authService}>
          <TestComponent />
        </AuthProvider>
      )
      
      // Check for initial user state
      await waitFor(() => {
        expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(testUser))
      })
      
      // Set up sign out error
      authService.setError(new Error('Network error during sign out'))
      
      // Trigger sign out
      fireEvent.click(screen.getByText('Sign Out'))
      
      // Verify error state and user remains set
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error during sign out')
        expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(testUser))
      })
    })
  })
})