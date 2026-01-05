import { render, screen, fireEvent } from '@testing-library/react'
import { UsageStatsCard } from '../components/UsageStatsCard'

describe('UsageStatsCard', () => {
    const mockUpgrade = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('displays usage stats correctly', () => {
        render(<UsageStatsCard used={2} total={10} onUpgrade={mockUpgrade} />)
        expect(screen.getByText('2 GB / 10 GB (20%)')).toBeInTheDocument()
    })

    it('shows no warning when quota is below 80%', () => {
        render(<UsageStatsCard used={5} total={10} onUpgrade={mockUpgrade} />)
        expect(screen.queryByText('Quota Low')).not.toBeInTheDocument()
    })

    it('shows warning and upgrade button when quota is >= 80%', () => {
        render(<UsageStatsCard used={8} total={10} onUpgrade={mockUpgrade} />)
        expect(screen.getByText('Quota Alert')).toBeInTheDocument()
        expect(screen.getByText(/Running low on bandwidth/)).toBeInTheDocument()
        expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
    })

    it('calls onUpgrade when upgrade button is clicked', () => {
        render(<UsageStatsCard used={9} total={10} onUpgrade={mockUpgrade} />)
        fireEvent.click(screen.getByText('Upgrade Now'))
        expect(mockUpgrade).toHaveBeenCalledTimes(1)
    })

    it('handles division by zero gracefully', () => {
        render(<UsageStatsCard used={0} total={0} onUpgrade={mockUpgrade} />)
        expect(screen.getByText('0 GB / 0 GB (0%)')).toBeInTheDocument()
    })
})
