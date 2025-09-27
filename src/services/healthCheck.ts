export const healthCheck = {
  async checkBackend(): Promise<boolean> {
    try {
      // Try multiple endpoints to check if backend is available
      const endpoints = ['/api/health', '/api/Auth/login', '/api'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          console.log(`Health check ${endpoint} status:`, response.status);
          
          // If we get any response (even 404), backend is running
          if (response.status !== 0) {
            return true;
          }
        } catch (e) {
          console.log(`Health check ${endpoint} failed:`, e);
        }
      }
      
      return false;
    } catch (error) {
      console.error('All health checks failed:', error);
      return false;
    }
  }
};
