import { useState, useEffect, useCallback } from 'react';

const UserProfile = ({ userId }: { userId: number }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`https://api.example.com/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');

      const userData: { name: string; email: string } = await response.json();
      setUser(userData);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) return <div>Error: {error}</div>;

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default UserProfile;
