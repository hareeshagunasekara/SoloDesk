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

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid MongoDB ObjectId, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Safely extracts ObjectId from various data structures
 * @param {any} data - The data that might contain an ObjectId
 * @returns {string|null} - The ObjectId if valid, null otherwise
 */
export const extractObjectId = (data) => {
  if (!data) return null;
  
  // If it's already a string, validate it
  if (typeof data === 'string') {
    return isValidObjectId(data) ? data : null;
  }
  
  // If it's an object with _id
  if (data._id) {
    return isValidObjectId(data._id) ? data._id : null;
  }
  
  // If it's an object with id
  if (data.id) {
    return isValidObjectId(data.id) ? data.id : null;
  }
  
  return null;
}; 