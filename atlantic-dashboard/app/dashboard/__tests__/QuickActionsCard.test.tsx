import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionsCard } from '../components/QuickActionsCard'

// Mock the phosphor icons
jest.mock('@phosphor-icons/react', () => ({
    CaretDown: () => <span>▼</span>
}))

describe('QuickActionsCard', () => {
    const mockChangeLocation = jest.fn()
    const mockRotationSettings = jest.fn()
    const mockViewActivity = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders quick action buttons', () => {
        render(
            <QuickActionsCard
                onChangeLocation={mockChangeLocation}
                onRotationSettings={mockRotationSettings}
                onViewActivity={mockViewActivity}
            />
        )
        // We check for getting *any* match, usually the visible buttons
        expect(screen.getAllByText('Change Location').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Rotation Settings').length).toBeGreaterThan(0)
    })

    it('calls handlers when buttons are clicked', () => {
        render(
            <QuickActionsCard
                onChangeLocation={mockChangeLocation}
                onRotationSettings={mockRotationSettings}
                onViewActivity={mockViewActivity}
            />
        )

        // Click the visible buttons (usually rendered last in the DOM order in my component)
        const locationBtns = screen.getAllByText('Change Location')
        fireEvent.click(locationBtns[locationBtns.length - 1])
        expect(mockChangeLocation).toHaveBeenCalledTimes(1)

        const rotationBtns = screen.getAllByText('Rotation Settings')
        fireEvent.click(rotationBtns[rotationBtns.length - 1])
        expect(mockRotationSettings).toHaveBeenCalledTimes(1)
    })
})
