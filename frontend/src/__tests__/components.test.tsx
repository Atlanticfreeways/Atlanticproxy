import { render, screen } from '@testing-library/react';
import { DashboardOverview } from '../components/DashboardOverview';

describe('Component Tests', () => {
  describe('DashboardOverview', () => {
    it('renders dashboard statistics', () => {
      render(<DashboardOverview />);
      expect(screen.getByText(/active proxies/i)).toBeInTheDocument();
    });

    it('displays uptime percentage', () => {
      render(<DashboardOverview />);
      expect(screen.getByText(/99.99%/)).toBeInTheDocument();
    });

    it('shows response time metric', () => {
      render(<DashboardOverview />);
      expect(screen.getByText(/145ms/)).toBeInTheDocument();
    });
  });
});
