import { render, screen } from '@testing-library/react';
import Events from '@/pages/Events';
import { vi } from 'vitest';

// Mock the EventCalendar component
vi.mock('@/components/events/EventCalendar', () => ({
  EventCalendar: () => <div data-testid="event-calendar">Calendar Mock</div>,
}));

describe('Events Page', () => {
  it('renders the events page with title and calendar', () => {
    render(<Events />);
    
    // Check if title is rendered
    expect(screen.getByText('Agenda des événements')).toBeInTheDocument();
    
    // Check if description is rendered
    expect(screen.getByText('Découvrez et participez à nos événements exclusifs')).toBeInTheDocument();
    
    // Check if calendar component is rendered
    expect(screen.getByTestId('event-calendar')).toBeInTheDocument();
  });
});