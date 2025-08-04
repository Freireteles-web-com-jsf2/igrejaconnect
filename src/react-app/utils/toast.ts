interface ToastOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function showToast({ title, message, type, duration = 5000 }: ToastOptions) {
  const toastId = `toast-${Date.now()}`;
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full ${colors[type]} rounded-lg p-4 shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
  
  toast.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">${icons[type]}</div>
      <div class="flex-1">
        <h4 class="text-sm font-semibold">${title}</h4>
        <p class="text-sm mt-1">${message}</p>
      </div>
      <button onclick="document.getElementById('${toastId}').remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 100);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (document.getElementById(toastId)) {
        toast.remove();
      }
    }, 300);
  }, duration);
}