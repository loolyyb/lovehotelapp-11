import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { vi } from 'vitest';

// Mock the store
vi.mock('@/stores/adminAuthStore');

describe('AdminDashboard', () => {
  beforeEach(() => {
    (useAdminAuthStore as ReturnType<typeof vi.fn>).mockReturnValue({
      setAdminAuthenticated: vi.fn(),
    });
  });

  it('renders the dashboard title', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Dashboard Administrateur')).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    const mockSetAdminAuthenticated = vi.fn();
    (useAdminAuthStore as ReturnType<typeof vi.fn>).mockReturnValue({
      setAdminAuthenticated: mockSetAdminAuthenticated,
    });

    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Déconnexion Admin'));
    expect(mockSetAdminAuthenticated).toHaveBeenCalledWith(false);
  });
});