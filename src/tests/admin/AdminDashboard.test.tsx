import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

// Mock the store
jest.mock('@/stores/adminAuthStore');

describe('AdminDashboard', () => {
  beforeEach(() => {
    (useAdminAuthStore as jest.Mock).mockReturnValue({
      setAdminAuthenticated: jest.fn(),
    });
  });

  it('renders the dashboard title', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Dashboard Administrateur')).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    const mockSetAdminAuthenticated = jest.fn();
    (useAdminAuthStore as jest.Mock).mockReturnValue({
      setAdminAuthenticated: mockSetAdminAuthenticated,
    });

    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Déconnexion Admin'));
    expect(mockSetAdminAuthenticated).toHaveBeenCalledWith(false);
  });
});