// Token utility functions
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Decode the JWT token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    console.error('Token expiration check error:', error);
    return null;
  }
};

export const isTokenExpiringSoon = (token, minutes = 5) => {
  if (!token) return false;
  
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  
  const now = new Date();
  const timeUntilExpiration = expiration.getTime() - now.getTime();
  const minutesUntilExpiration = timeUntilExpiration / (1000 * 60);
  
  return minutesUntilExpiration <= minutes;
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Dispatch logout event
  const logoutEvent = new CustomEvent('auth:logout', {
    detail: { reason: 'manual_clear' }
  });
  window.dispatchEvent(logoutEvent);
}; 