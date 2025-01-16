import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/events/EventCard';
import { EventType } from '@/types/events';
import { vi } from 'vitest';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Test Event',
    type: 'bdsm' as EventType,
    description: 'Test Description',
    imageUrl: 'https://example.com/image.jpg',
    startTime: '19:00',
    endTime: '23:00',
  };

  const mockOnParticipate = vi.fn();

  beforeEach(() => {
    mockOnParticipate.mockClear();
  });

  it('renders event details correctly', () => {
    render(
      <EventCard
        {...mockEvent}
        onParticipate={mockOnParticipate}
      />
    );

    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
    expect(screen.getByText('bdsm')).toBeInTheDocument();
    expect(screen.getByText(`${mockEvent.startTime} - ${mockEvent.endTime}`)).toBeInTheDocument();
  });

  it('displays the event image when provided', () => {
    render(
      <EventCard
        {...mockEvent}
        onParticipate={mockOnParticipate}
      />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockEvent.imageUrl);
    expect(image).toHaveAttribute('alt', mockEvent.title);
  });

  it('calls onParticipate with event id when participate button is clicked', () => {
    render(
      <EventCard
        {...mockEvent}
        onParticipate={mockOnParticipate}
      />
    );

    const participateButton = screen.getByText('Participer');
    fireEvent.click(participateButton);

    expect(mockOnParticipate).toHaveBeenCalledTimes(1);
    expect(mockOnParticipate).toHaveBeenCalledWith(mockEvent.id);
  });

  it('renders without time information when not provided', () => {
    const eventWithoutTime = {
      ...mockEvent,
      startTime: undefined,
      endTime: undefined,
    };

    render(
      <EventCard
        {...eventWithoutTime}
        onParticipate={mockOnParticipate}
      />
    );

    expect(screen.queryByText(/:/)).not.toBeInTheDocument();
  });

  it('renders without image when imageUrl is not provided', () => {
    const eventWithoutImage = {
      ...mockEvent,
      imageUrl: undefined,
    };

    render(
      <EventCard
        {...eventWithoutImage}
        onParticipate={mockOnParticipate}
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders different event types correctly', () => {
    const eventTypes: EventType[] = ['jacuzzi', 'gastronomy', 'speed_dating', 'other'];

    eventTypes.forEach(type => {
      const eventWithType = {
        ...mockEvent,
        type,
      };

      const { rerender } = render(
        <EventCard
          {...eventWithType}
          onParticipate={mockOnParticipate}
        />
      );

      expect(screen.getByText(type.replace('_', ' '))).toBeInTheDocument();
      rerender(<></>);
    });
  });
});