import { render, screen } from '@testing-library/react';
import { StatsTab } from '@/components/admin/tabs/StatsTab';
import { useQuery } from '@tanstack/react-query';

// Mock the query hook
jest.mock('@tanstack/react-query');

describe('StatsTab', () => {
  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('renders the statistics cards', () => {
    render(<StatsTab />);
    expect(screen.getByText('Total Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Messages Aujourd\'hui')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs Actifs')).toBeInTheDocument();
  });
});