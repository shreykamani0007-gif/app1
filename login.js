document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeOffIcon = document.getElementById('eyeOffIcon');
  const messageBox = document.getElementById('messageBox');
  const signInBtn = document.getElementById('signInBtn');

  // Show/Hide password functionality
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

    if (isPassword) {
      eyeIcon.classList.add('hidden');
      eyeOffIcon.classList.remove('hidden');
      togglePasswordBtn.setAttribute('aria-label', 'Hide password');
    } else {
      eyeIcon.classList.remove('hidden');
      eyeOffIcon.classList.add('hidden');
      togglePasswordBtn.setAttribute('aria-label', 'Show password');
    }
  });

  // Helper to show message
  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
  }

  // Helper to clear message
  function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message-box';
  }

  // Clear error when user types
  emailInput.addEventListener('input', clearMessage);
  passwordInput.addEventListener('input', clearMessage);

  // Form submission handling
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate credentials
    if (email === 'admin@clubops.ai' && password === 'admin123') {
      showMessage('Login successful!', 'success');
      signInBtn.disabled = true;
      signInBtn.innerHTML = '<span>Redirecting...</span>';

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } else {
      showMessage('Invalid email or password.', 'error');
    }
  });
});
