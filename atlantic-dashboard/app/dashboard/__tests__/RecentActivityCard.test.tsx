import { render, screen } from '@testing-library/react'
import { RecentActivityCard, ActivityItem } from '../components/RecentActivityCard'

describe('RecentActivityCard', () => {
    const mockActivities: ActivityItem[] = [
        {
            id: '1',
            type: 'connection',
            description: 'Connected to US Proxy',
            timestamp: new Date().toISOString()
        },
        {
            id: '2',
            type: 'rotation',
            description: 'IP Rotated',
            timestamp: new Date().toISOString()
        }
    ]

    it('displays activity list', () => {
        render(<RecentActivityCard activities={mockActivities} />)
        expect(screen.getByText('Connected to US Proxy')).toBeInTheDocument()
        expect(screen.getByText('IP Rotated')).toBeInTheDocument()
    })

    it('displays empty state when no activities', () => {
        render(<RecentActivityCard activities={[]} />)
        expect(screen.getByText('No recent activity.')).toBeInTheDocument()
    })
})
