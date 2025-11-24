interface ApiError {
  status: number;
  message: string;
}

export const handleApiError = (error: any): void => {
  if (error.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
  
  if (error.status >= 500) {
    showNotification('Server error. Please try again later.', 'error');
    return;
  }
  
  const message = error.message || 'An unexpected error occurred';
  showNotification(message, 'error');
};

export const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'error'): void => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${getNotificationStyles(type)}`;
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="mr-2">${getNotificationIcon(type)}</span>
      <span class="text-sm font-medium">${message}</span>
      <button class="ml-2 text-lg leading-none" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
};

const getNotificationStyles = (type: string): string => {
  switch (type) {
    case 'success':
      return 'bg-green-100 border border-green-400 text-green-700';
    case 'error':
      return 'bg-red-100 border border-red-400 text-red-700';
    case 'warning':
      return 'bg-yellow-100 border border-yellow-400 text-yellow-700';
    default:
      return 'bg-blue-100 border border-blue-400 text-blue-700';
  }
};

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
};