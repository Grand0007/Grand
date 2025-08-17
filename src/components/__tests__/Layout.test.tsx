import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/router'
import Layout from '../Layout'
import { useAuth } from '@/pages/_app'

// Mock the auth hook
jest.mock('@/pages/_app', () => ({
  useAuth: jest.fn()
}))

const mockPush = jest.fn()
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Layout Component', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      pathname: '/dashboard',
      push: mockPush,
      route: '/dashboard',
      query: {},
      asPath: '/dashboard',
      back: jest.fn(),
      beforePopState: jest.fn(),
      prefetch: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the layout with logo and navigation', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('AI Resume Builder')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('shows authenticated user navigation when logged in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-01T00:00:00Z',
        subscription_type: 'free'
      },
      token: 'test-token',
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('free')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('handles logout correctly', () => {
    const mockLogout = jest.fn()
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-01T00:00:00Z',
        subscription_type: 'free'
      },
      token: 'test-token',
      login: jest.fn(),
      logout: mockLogout,
      loading: false
    })

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('renders footer with correct information', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('© 2024 AI Resume Builder. Powered by Azure Cloud Services.')).toBeInTheDocument()
    expect(screen.getByText('AI Resume Enhancement')).toBeInTheDocument()
    expect(screen.getByText('ATS Optimization')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
  })
})