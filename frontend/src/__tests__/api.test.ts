import { apiClient } from '../lib/api';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('includes auth token in requests', async () => {
      localStorage.setItem('authToken', 'test-token');
      const fetchSpy = jest.spyOn(global, 'fetch');
      
      await apiClient.get('/test');
      
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('returns error on failed request', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      
      const result = await apiClient.get('/test');
      
      expect(result.error).toBe('Network error');
      expect(result.data).toBeUndefined();
    });
  });
});
