import { render, screen } from '@testing-library/react';
import { ConversationsTab } from '@/components/admin/tabs/ConversationsTab';
import { useQuery } from '@tanstack/react-query';

// Mock the query hook
jest.mock('@tanstack/react-query');

describe('ConversationsTab', () => {
  const mockMessages = [
    {
      id: '1',
      sender_id: 'user1',
      content: 'Test message',
      created_at: '2024-01-01T12:00:00',
    },
  ];

  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue({
      data: mockMessages,
      isLoading: false,
    });
  });

  it('renders the messages table', () => {
    render(<ConversationsTab />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});