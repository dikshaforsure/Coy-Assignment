
const API_URL = 'http://localhost:5000';

export const getFeed = async () => {
  const response = await fetch(`${API_URL}/feed`);

  if (!response.ok) {
    throw new Error('Failed to fetch profiles');
  }

  return response.json();
};

export const swipeProfile = async (profileId, direction) => {
  const response = await fetch(`${API_URL}/swipe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileId,
      direction,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Swipe failed');
  }

  return data;
};

export const getMatches = async () => {
  const response = await fetch(`${API_URL}/matches`);

  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }

  return response.json();
};
