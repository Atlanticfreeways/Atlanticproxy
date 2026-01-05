import { render, screen, fireEvent } from '@testing-library/react'
import { PremiumFeatureGate } from '../components/PremiumFeatureGate'

describe('PremiumFeatureGate', () => {
    it('renders feature name and upgrade button', () => {
        const mockUpgrade = jest.fn()
        render(<PremiumFeatureGate featureName="Advanced Analytics" onUpgrade={mockUpgrade} />)

        expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
        expect(screen.getByText(/requires a Team or Enterprise plan/)).toBeInTheDocument()
        expect(screen.getByText('Upgrade to Team')).toBeInTheDocument()
    })

    it('calls onUpgrade when clicked', () => {
        const mockUpgrade = jest.fn()
        render(<PremiumFeatureGate featureName="Test" onUpgrade={mockUpgrade} />)

        fireEvent.click(screen.getByText('Upgrade to Team'))
        expect(mockUpgrade).toHaveBeenCalledTimes(1)
    })
})
