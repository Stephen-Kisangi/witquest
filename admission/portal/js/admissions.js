// script.js
class AdmissionsPortal {
  constructor() {
      this.API_BASE_URL = window.location.origin;
      this.authToken = localStorage.getItem('authToken') || null;
      this.initialize();
  }

  initialize() {
      this.setupEventListeners();
      this.initializePasswordToggle();
      this.initializeRegistrationValidations();
      this.initializeClock();
      this.checkAuthState();
      this.initializeMobileMenu();
      this.ensurePasswordStrengthIndicator();
      this.initializeLogout();
  }

  setupEventListeners() {
      // Auth Forms
      document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
      document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
      
      // Payment Check
      document.getElementById('paymentCheckForm')?.addEventListener('submit', (e) => this.checkPaymentStatus(e));
      
      // Admin Verification
      document.getElementById('payment-verification-form')?.addEventListener('submit', (e) => this.handlePaymentVerification(e));
  }

  initializeMobileMenu() {
      const navbarToggler = document.querySelector('.navbar-toggler');
      const navbarCollapse = document.querySelector('.navbar-collapse');
      const authButtons = document.getElementById('auth-buttons');

      // Clone auth buttons for mobile
      if (authButtons && !document.getElementById('mobile-auth-buttons')) {
          const mobileAuth = authButtons.cloneNode(true);
          mobileAuth.id = 'mobile-auth-buttons';
          mobileAuth.classList.add('d-lg-none', 'my-3', 'text-center');
          navbarCollapse?.appendChild(mobileAuth);
      }

      navbarToggler?.addEventListener('click', () => {
          navbarCollapse.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
          if (window.innerWidth <= 992 && 
              !e.target.closest('.navbar') && 
              navbarCollapse.classList.contains('show')) {
              navbarCollapse.classList.remove('show');
          }
      });
  }

  // AUTHENTICATION METHODS
  async checkAuthState() {
      try {
          const response = await fetch(`${this.API_BASE_URL}/check-auth.php`, {
              credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Auth check failed');
          
          const data = await response.json();
          if (data.authenticated) {
              this.setAuthState(true, data.role);
          } else {
              this.setAuthState(false);
          }
      } catch (error) {
          console.error('Auth check error:', error);
          this.setAuthState(false);
      }
  }

  async handleLogin(e) {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
          this.showLoader(true);
          
          const formData = new URLSearchParams();
          formData.append('loginIdentifier', identifier);
          formData.append('loginPassword', password);

          const response = await fetch(`${this.API_BASE_URL}/login.php`, {
              method: 'POST',
              body: formData,
              credentials: 'include'
          });

          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error || 'Login failed');
          }

          this.setAuthState(true, data.role);
          $('#loginModal').modal('hide');
          this.showAlert(data.message || 'Login successful!', 'success');
      } catch (error) {
          this.showAlert(error.message, 'error');
      } finally {
          this.showLoader(false);
      }
  }

  async handleRegister(e) {
      e.preventDefault();
      const formData = {
          name: document.getElementById('fullName').value.trim(),
          phone: document.getElementById('regPhone').value.trim(),
          email: document.getElementById('regEmail').value.trim().toLowerCase(),
          password: document.getElementById('regPassword').value
      };

      try {
          this.validateRegistrationForm(formData);
          this.showLoader(true);

          const regData = new URLSearchParams();
          regData.append('fullName', formData.name);
          regData.append('regPhone', formData.phone);
          regData.append('regEmail', formData.email);
          regData.append('regPassword', formData.password);

          const response = await fetch(`${this.API_BASE_URL}/register.php`, {
              method: 'POST',
              body: regData,
              credentials: 'include'
          });

          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error || 'Registration failed');
          }

          // Auto-login after registration
          const loginData = new URLSearchParams();
          loginData.append('loginIdentifier', formData.email);
          loginData.append('loginPassword', formData.password);

          const loginResponse = await fetch(`${this.API_BASE_URL}/login.php`, {
              method: 'POST',
              body: loginData,
              credentials: 'include'
          });

          const loginResult = await loginResponse.json();
          
          if (!loginResponse.ok) {
              throw new Error(loginResult.error || 'Auto-login failed');
          }

          this.setAuthState(true, loginResult.role);
          $('#registerModal').modal('hide');
          this.showAlert('Registration and login successful!', 'success');
      } catch (error) {
          this.showAlert(error.message, 'error');
      } finally {
          this.showLoader(false);
      }
  }

  // PAYMENT HANDLING METHODS
  async checkPaymentStatus(e) {
      e.preventDefault();
      const form = e.target;
      const input = form.querySelector('input');
      const code = input.value.trim();

      try {
          this.showLoader(true);
          const response = await fetch(`${this.API_BASE_URL}/check-payment.php?code=${encodeURIComponent(code)}`, {
              credentials: 'include'
          });

          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error || 'Payment check failed');
          }

          this.updatePaymentStatus(data);
          if (data.status === 'paid') {
              this.showDownloadButton(data.downloadUrl);
          }
      } catch (error) {
          this.showAlert(error.message, 'error');
      } finally {
          this.showLoader(false);
      }
  }

  async handlePaymentVerification(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);

      try {
          this.showLoader(true);
          const response = await fetch(`${this.API_BASE_URL}/verify-payment.php`, {
              method: 'POST',
              body: formData,
              credentials: 'include'
          });

          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error || 'Verification failed');
          }

          this.showAlert('Payment verified successfully!', 'success');
          form.reset();
          this.loadAdminData();
      } catch (error) {
          this.showAlert(error.message, 'error');
      } finally {
          this.showLoader(false);
      }
  }

  // UI METHODS
  updatePaymentStatus(paymentData) {
      const alertDiv = document.getElementById('payment-status-alert');
      const downloadSection = document.getElementById('download-section');
      
      alertDiv.className = `alert alert-${paymentData.status === 'paid' ? 'success' : 'danger'}`;
      alertDiv.innerHTML = `
          Payment Status: ${paymentData.status.toUpperCase()}
          ${paymentData.status === 'paid' ? 
              `<div class="mt-2">Amount: ${paymentData.amount} KES</div>
               <div>Date: ${new Date(paymentData.date).toLocaleDateString()}</div>` : 
              '<div class="mt-2">Please complete your payment first</div>'}
      `;

      downloadSection.innerHTML = paymentData.status === 'paid' ? 
          `<button class="btn btn-success mt-3" onclick="location.href='${paymentData.downloadUrl}'">
              <i class="fas fa-download me-2"></i>Download Admission Form
          </button>` : 
          '';
  }

  populatePaymentsList(payments) {
      const container = document.getElementById('payments-list');
      container.innerHTML = payments.map(payment => `
          <div class="accordion-item">
              <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse">
                      ${payment.transaction_code} - ${payment.amount} KES
                  </button>
              </h2>
              <div class="accordion-collapse collapse show">
                  <div class="accordion-body">
                      <p>Phone: ${payment.phone}</p>
                      <p>Date: ${new Date(payment.date).toLocaleString()}</p>
                      ${payment.status === 'pending' ? 
                          `<button class="btn btn-sm btn-success" 
                              data-payment-id="${payment.id}"
                              onclick="app.verifyPayment('${payment.id}')">
                              Verify Payment
                          </button>` : 
                          `<span class="badge bg-success">Verified</span>`}
                  </div>
              </div>
          </div>
      `).join('');
  }

  // VALIDATION METHODS
  initializeRegistrationValidations() {
      const validationConfig = {
          fullName: {
              regex: /^[A-Za-z]{2,}(?:\s[A-Za-z]{2,})+$/,
              error: 'Please enter both first and last name'
          },
          regPhone: {
              regex: /^07\d{8}$/,
              error: 'Valid Kenyan number starting with 07'
          },
          regEmail: {
              regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              error: 'Valid email required'
          },
          regPassword: {
              regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              error: 'Must include uppercase, number, and special character'
          }
      };

      Object.entries(validationConfig).forEach(([fieldId, { regex, error }]) => {
          const field = document.getElementById(fieldId);
          if (!field) return;

          const validateField = () => {
              const isValid = regex.test(field.value.trim());
              this.updateFieldValidation(field, isValid, error);
              
              if (fieldId === 'regPassword') {
                  this.updatePasswordStrength(field.value);
              }
          };

          field.addEventListener('input', validateField);
          field.addEventListener('blur', validateField);
          validateField();
      });
  }

  updateFieldValidation(field, isValid, errorMessage) {
      const errorElement = field.parentElement.querySelector('.invalid-feedback');
      
      field.classList.remove('is-valid', 'is-invalid');
      errorElement.textContent = '';

      if (field.value.trim() === '') return;

      if (isValid) {
          field.classList.add('is-valid');
      } else {
          field.classList.add('is-invalid');
          errorElement.textContent = errorMessage;
      }
  }

  // PASSWORD STRENGTH
  ensurePasswordStrengthIndicator() {
      const passwordGroup = document.getElementById('regPassword')?.parentElement;
      if (!passwordGroup || document.getElementById('passwordStrength')) return;

      const strengthContainer = document.createElement('div');
      strengthContainer.id = 'passwordStrength';
      strengthContainer.className = 'mt-2';
      strengthContainer.innerHTML = `
          <div class="progress" style="height: 5px">
              <div id="passwordStrengthBar" class="progress-bar" role="progressbar"></div>
          </div>
          <small id="passwordStrengthText" class="form-text"></small>
      `;
      passwordGroup.appendChild(strengthContainer);
  }

  updatePasswordStrength(password) {
      const strength = this.calculatePasswordStrength(password);
      const strengthBar = document.getElementById('passwordStrengthBar');
      const strengthText = document.getElementById('passwordStrengthText');

      if (!strengthBar || !strengthText) return;

      strengthBar.className = `progress-bar bg-${this.getStrengthColor(strength)}`;
      strengthBar.style.width = `${this.getStrengthWidth(strength)}%`;
      strengthText.textContent = this.getStrengthText(strength);
      strengthText.style.color = this.getStrengthColor(strength) === 'danger' ? '#dc3545' : 
                                  this.getStrengthColor(strength) === 'warning' ? '#ffc107' : '#28a745';
  }

  calculatePasswordStrength(password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      return Math.min(strength, 4);
  }

  getStrengthColor(strength) {
      return strength <= 1 ? 'danger' : strength <= 3 ? 'warning' : 'success';
  }

  getStrengthWidth(strength) {
      return (strength / 4) * 100;
  }

  getStrengthText(strength) {
      return ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][strength];
  }

  // UTILITIES
  initializeClock() {
      const updateClock = () => {
          const clockElement = document.getElementById('current-time');
          if (!clockElement) return;

          const now = new Date();
          const options = {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
          };

          clockElement.innerHTML = `
              <div class="navbar-clock-date">${now.toLocaleDateString('en-US', options)}</div>
              <div class="navbar-clock-time">${now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>
          `;
      };

      updateClock();
      setInterval(updateClock, 1000);
      window.addEventListener('resize', updateClock);
  }

  setAuthState(authenticated, role = 'parent') {
      document.getElementById('auth-buttons')?.classList.toggle('d-none', authenticated);
      document.getElementById('mobile-auth-buttons')?.classList.toggle('d-none', authenticated);
      document.getElementById('user-menu')?.classList.toggle('d-none', !authenticated);
      this.loadUserView(role);
      
      if (authenticated) {
          localStorage.setItem('authToken', this.authToken);
      } else {
          localStorage.removeItem('authToken');
      }
  }

  loadUserView(role) {
      const parentView = document.getElementById('parent-view');
      const adminView = document.getElementById('admin-view');
      
      if (role === 'admin') {
          parentView?.classList.add('d-none');
          adminView?.classList.remove('d-none');
          this.loadAdminData();
      } else {
          adminView?.classList.add('d-none');
          parentView?.classList.remove('d-none');
          this.loadParentData();
      }
  }

  async loadAdminData() {
      try {
          const response = await fetch(`${this.API_BASE_URL}/admin-data.php`, {
              credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Failed to load admin data');
          
          const data = await response.json();
          this.populatePaymentsList(data.payments);
      } catch (error) {
          this.showAlert(error.message, 'error');
      }
  }

  async loadParentData() {
      try {
          const response = await fetch(`${this.API_BASE_URL}/parent-data.php`, {
              credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Failed to load parent data');
          
          const data = await response.json();
          this.updatePaymentStatus(data.paymentStatus);
      } catch (error) {
          this.showAlert(error.message, 'error');
      }
  }

  initializeLogout() {
      document.querySelectorAll('[data-action="logout"]').forEach(button => {
          button.addEventListener('click', () => this.logout());
      });
  }

  logout() {
      fetch(`${this.API_BASE_URL}/logout.php`, {
          method: 'POST',
          credentials: 'include'
      })
      .then(() => {
          localStorage.removeItem('authToken');
          this.setAuthState(false);
          this.showAlert('Logged out successfully', 'success');
      })
      .catch(error => {
          this.showAlert('Logout failed: ' + error.message, 'error');
      });
  }

  showAlert(message, type = 'info') {
      const alert = document.createElement('div');
      alert.className = `alert alert-${type} alert-dismissible fade show`;
      alert.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;

      const container = document.getElementById('global-alert');
      container?.prepend(alert);

      setTimeout(() => alert.remove(), 5000);
  }

  initializePasswordToggle() {
      document.querySelectorAll('.btn-password-toggle').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const input = e.currentTarget.parentElement.querySelector('input');
              const isPassword = input.type === 'password';
              input.type = isPassword ? 'text' : 'password';
              btn.innerHTML = isPassword ? 
                  '<i class="fas fa-eye"></i>' : 
                  '<i class="fas fa-eye-slash"></i>';
          });
      });
  }

  showLoader(show) {
      const loader = document.getElementById('loader') || this.createLoader();
      loader.style.display = show ? 'flex' : 'none';
  }

  createLoader() {
      const loader = document.createElement('div');
      loader.id = 'loader';
      loader.innerHTML = `
          <div class="spinner-border text-primary"></div>
          <span class="ms-2">Processing...</span>
      `;
      Object.assign(loader.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'none',
          alignItems: 'center',
          zIndex: 9999
      });
      document.body.appendChild(loader);
      return loader;
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AdmissionsPortal();
});