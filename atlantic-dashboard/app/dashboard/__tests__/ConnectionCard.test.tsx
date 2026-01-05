import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectionCard } from '../components/ConnectionCard'

describe('ConnectionCard', () => {
    const mockToggle = jest.fn()
    const mockRotate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('shows Connect button when disconnected', () => {
        render(<ConnectionCard isConnected={false} onToggleConnection={mockToggle} />)
        expect(screen.getByText('Connect to Proxy')).toBeInTheDocument()
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('shows Disconnect button when connected', () => {
        render(<ConnectionCard isConnected={true} onToggleConnection={mockToggle} />)
        expect(screen.getByText('Disconnect')).toBeInTheDocument()
        expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('shows Rotate IP button only when connected', () => {
        const { rerender } = render(<ConnectionCard isConnected={false} onToggleConnection={mockToggle} />)
        expect(screen.queryByText('Rotate IP Now')).not.toBeInTheDocument()

        rerender(<ConnectionCard isConnected={true} onToggleConnection={mockToggle} />)
        expect(screen.getByText('Rotate IP Now')).toBeInTheDocument()
    })

    it('calls onToggleConnection when button is clicked', () => {
        render(<ConnectionCard isConnected={false} onToggleConnection={mockToggle} />)
        fireEvent.click(screen.getByText('Connect to Proxy'))
        expect(mockToggle).toHaveBeenCalledTimes(1)
    })

    it('calls onRotateIP when button is clicked', () => {
        render(
            <ConnectionCard
                isConnected={true}
                onToggleConnection={mockToggle}
                onRotateIP={mockRotate}
            />
        )
        fireEvent.click(screen.getByText('Rotate IP Now'))
        expect(mockRotate).toHaveBeenCalledTimes(1)
    })

    it('shows loading state', () => {
        render(
            <ConnectionCard
                isConnected={false}
                onToggleConnection={mockToggle}
                isLoading={true}
            />
        )
        expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
})
