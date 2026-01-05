import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import BillingPage from '../billing/page'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

jest.mock('@/lib/api', () => ({
    apiClient: {
        getPlans: jest.fn(),
        getSubscription: jest.fn(),
        createCheckoutSession: jest.fn()
    }
}))

// Mock Icons
jest.mock('lucide-react', () => ({
    Loader2: () => <span>Loading...</span>,
    Check: () => <span>Check</span>,
    CreditCard: () => <span>CardIcon</span>,
    Shield: () => <span>Shield</span>,
    Zap: () => <span>Zap</span>,
    Lock: () => <span>Lock</span>,
    Globe: () => <span>Globe</span>
}))

jest.mock('@phosphor-icons/react', () => ({
    CurrencyDollar: () => <span>$</span>
}))

describe('BillingPage', () => {
    const mockPlans = [
        { id: 'starter', name: 'Starter', price_monthly: 0, data_limit_mb: 500, concurrent_conns: 1, features: [] },
        { id: 'team', name: 'Team', price_monthly: 99, data_limit_mb: 50000, concurrent_conns: 10, features: ['Priority Support'] }
    ]

    const mockSubscription = {
        plan_id: 'starter',
        status: 'active',
        end_date: new Date().toISOString()
    }

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
        (apiClient.getPlans as jest.Mock).mockResolvedValue(mockPlans);
        (apiClient.getSubscription as jest.Mock).mockResolvedValue({ subscription: mockSubscription });
    })

    it('renders current plan and upgrade options', async () => {
        render(<BillingPage />)

        await waitFor(() => {
            expect(screen.getByText('Billing & Plans')).toBeInTheDocument()
        })

        // Check current plan
        expect(screen.getByText(/Starter Plan/i)).toBeInTheDocument()
        expect(screen.getByText('active')).toBeInTheDocument()

        // Check upgrade options
        expect(screen.getByText('Team')).toBeInTheDocument()
        expect(screen.getByText('$99')).toBeInTheDocument()

        expect(screen.getByText('Current Plan')).toBeInTheDocument()
    })

    it('opens payment modal when upgrade clicked', async () => {
        render(<BillingPage />)
        await waitFor(() => expect(screen.getByText('Billing & Plans')).toBeInTheDocument())

        const upgradeBtns = screen.getAllByText('Upgrade')
        fireEvent.click(upgradeBtns[0])

        expect(screen.getByText('Purchase Team')).toBeInTheDocument()
        expect(screen.getByText('Pay $99')).toBeInTheDocument()
    })
})
