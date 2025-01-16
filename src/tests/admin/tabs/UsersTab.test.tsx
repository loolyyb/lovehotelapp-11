import { render, screen } from '@testing-library/react';
import { UsersTab } from '@/components/admin/tabs/UsersTab';
import { useQuery } from '@tanstack/react-query';

// Mock the query hook
jest.mock('@tanstack/react-query');

describe('UsersTab', () => {
  const mockUsers = [
    {
      id: '1',
      full_name: 'Test User',
      user_id: 'user1',
      role: 'user',
      created_at: '2024-01-01',
    },
  ];

  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });
  });

  it('renders the users table', () => {
    render(<UsersTab />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
  });
});