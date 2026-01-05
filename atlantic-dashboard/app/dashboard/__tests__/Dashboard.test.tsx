import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../page'
import { apiClient } from '@/lib/api'

// Mock API client
jest.mock('@/lib/api', () => ({
    apiClient: {
        getStatus: jest.fn(),
        subscribeToStatus: jest.fn(() => jest.fn())
    }
}))

// Mock Phosphor icons
jest.mock('@phosphor-icons/react', () => ({
    Bell: () => <span>BellIcon</span>,
    CurrencyDollar: () => <span>CurrencyIcon</span>,
    CaretDown: () => <span>CaretDownIcon</span>
}))

describe('DashboardPage Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading state initially', async () => {
        (apiClient.getStatus as jest.Mock).mockReturnValue(new Promise(() => { }))
        render(<DashboardPage />)
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })

    it('renders dashboard content after loading', async () => {
        (apiClient.getStatus as jest.Mock).mockResolvedValue({
            connected: true,
            location: 'US',
            ip_address: '127.0.0.1',
            latency: 50
        })

        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument()
        })

        // Check specific cards presence
        expect(screen.getByText('Connection Status')).toBeInTheDocument()
        expect(screen.getByText('Usage')).toBeInTheDocument()
        expect(screen.getByText('Quick Actions')).toBeInTheDocument()
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
})
