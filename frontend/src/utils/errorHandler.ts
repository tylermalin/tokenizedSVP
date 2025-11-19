/**
 * Safely extract error message from various error formats
 * Always returns a string to prevent React error #31 (Objects as React children)
 */
export function getErrorMessage(error: any): string {
  // If it's already a string, return it
  if (typeof error === "string") {
    return error;
  }

  // Try to extract from axios error response
  if (error?.response?.data) {
    const data = error.response.data;

    // If data.error is a string, use it
    if (typeof data.error === "string") {
      return data.error;
    }

    // If data.message is a string, use it
    if (typeof data.message === "string") {
      return data.message;
    }

    // If data is an object with code and message
    if (data.code && data.message && typeof data.message === "string") {
      return data.message;
    }

    // If data itself is a string (unlikely but possible)
    if (typeof data === "string") {
      return data;
    }
  }

  // Try error.message
  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  // Fallback to generic error message
  return "An unexpected error occurred. Please try again.";
}
