import { render, screen, fireEvent } from '@testing-library/react';
import { EventsTab } from '@/components/admin/tabs/EventsTab';
import { vi } from 'vitest';

// Mock the necessary dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      {
        id: '1',
        title: 'Test Event',
        event_date: '2024-01-24T19:00:00',
        event_type: 'speed_dating',
        event_participants: []
      }
    ],
    isLoading: false
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isLoading: false
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn()
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('EventsTab', () => {
  it('renders the events management interface', () => {
    render(<EventsTab />);
    
    // Check if title is rendered
    expect(screen.getByText('Gestion des événements')).toBeInTheDocument();
    
    // Check if create button is rendered
    expect(screen.getByText('Créer un événement')).toBeInTheDocument();
    
    // Check if table headers are rendered
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Titre')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check if test event is rendered
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});