import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('UserProfile Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('displays user data after successful fetch', async () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    fetchMock.mockResponseOnce(JSON.stringify(mockUser));

    render(<UserProfile userId={1} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    );
    expect(screen.getByText(`Email: ${mockUser.email}`)).toBeInTheDocument();
  });

  it('displays an error message if fetch fails', async () => {
    fetchMock.mockReject(new Error('Failed to fetch user data'));

    render(<UserProfile userId={1} />);

    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    expect(screen.getByText(/Failed to fetch user data/i)).toBeInTheDocument();
  });
});
