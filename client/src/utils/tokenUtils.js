// Token utility functions
export const isTokenValid = (token) => {
  if (!token) {
    console.log('Token validation: No token provided');
    return false;
  }
  
  try {
    // Check if token has the correct format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Token validation: Invalid token format (not 3 parts)');
      return false;
    }
    
    // Decode the JWT token (without verification)
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    console.log('Token validation: Payload:', payload);
    console.log('Token validation: Current time:', currentTime);
    console.log('Token validation: Expiration time:', payload.exp);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token validation: Token is expired');
      return false;
    }
    
    console.log('Token validation: Token is valid');
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