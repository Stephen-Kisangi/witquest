document.addEventListener('DOMContentLoaded', function() {
    // Phone input formatting and validation
    const phoneInput = document.getElementById('phone');
    
    phoneInput.addEventListener('input', function(e) {
        // Remove non-digit characters
        let value = e.target.value.replace(/\D/g, '');
        
        // Ensure it starts with '07'
        if (value.length >= 2 && value.substring(0, 2) !== '07') {
            value = '07' + value.substring(2);
        }
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Update input value
        e.target.value = value;
        
        // Validate input
        validatePhoneInput();
    });
    
    function validatePhoneInput() {
        const value = phoneInput.value;
        const isValid = /^07[0-9]{8}$/.test(value);
        
        if (isValid) {
            phoneInput.classList.remove('is-invalid');
            phoneInput.classList.add('is-valid');
        } else {
            phoneInput.classList.remove('is-valid');
            if (value.length > 0) {
                phoneInput.classList.add('is-invalid');
            } else {
                phoneInput.classList.remove('is-invalid');
            }
        }
        
        return isValid;
    }
    
    // Payment form submission handler
    const mpesaPaymentForm = document.getElementById('mpesaPaymentForm');
    
    mpesaPaymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate phone before submission
        if (!validatePhoneInput()) {
            showToast('Please enter a valid M-Pesa phone number', 'error');
            return;
        }
        
        const formData = {
            phone: document.getElementById('phone').value,
            amount: document.getElementById('amount').value
        };

        // Show processing status with animation
        showProcessingUI();

        // Simulate payment request (replace with actual API call)
        simulatePaymentRequest(formData);
    });
    
    function showProcessingUI() {
        const statusDiv = document.getElementById('paymentStatus');
        statusDiv.style.display = 'block';
        
        // Scroll to status display
        statusDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Disable form inputs and submit button
        document.querySelectorAll('#mpesaPaymentForm input, #mpesaPaymentForm button').forEach(el => {
            el.setAttribute('disabled', 'true');
        });
    }
    
    function hideProcessingUI() {
        // Enable form inputs and submit button
        document.querySelectorAll('#mpesaPaymentForm input, #mpesaPaymentForm button').forEach(el => {
            el.removeAttribute('disabled');
        });
    }
    
    // Simulate M-Pesa payment request (replace with actual implementation)
    function simulatePaymentRequest(formData) {
        // In a real application, this would be replaced with an actual API call
        // This is just a simulation for demonstration purposes
        
        // Uncomment this section and replace with your actual implementation
        /*
        fetch('mpesa_initiate.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Poll for payment confirmation
                checkPaymentStatus(data.CheckoutRequestID);
            } else {
                showPaymentError(data.error || 'Payment initiation failed');
            }
        })
        .catch(error => {
            showPaymentError('An error occurred. Please try again.');
        });
        */
        
        // For demo: Simulate successful API call after 2 seconds
        setTimeout(() => {
            const mockResponse = {
                success: true,
                CheckoutRequestID: 'ws_CO_' + Date.now()
            };
            
            if (mockResponse.success) {
                simulateCheckPaymentStatus(mockResponse.CheckoutRequestID);
            } else {
                showPaymentError('Payment initiation failed. Please try again.');
            }
        }, 2000);
    }
    
    // Simulate checking payment status (replace with actual implementation)
    function simulateCheckPaymentStatus(checkoutRequestID) {
        // Simulate checking status after 3 seconds
        setTimeout(() => {
            const randomOutcome = Math.random();
            
            if (randomOutcome > 0.3) { // 70% success rate for demo
                showPaymentSuccess();
                
                // Redirect after successful payment (2 seconds delay)
                setTimeout(() => {
                    window.location.href = 'download.php';
                }, 2000);
            } else {
                showPaymentError('Transaction failed or was cancelled. Please try again.');
            }
        }, 3000);
    }
    
    // Payment success UI update
    function showPaymentSuccess() {
        const statusDiv = document.getElementById('paymentStatus');
        statusDiv.innerHTML = `
            <div class="alert alert-success animate__animated animate__fadeIn">
                <h5 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Payment Successful!</h5>
                <p>Your payment has been processed successfully. Redirecting you to the download page...</p>
                <div class="progress mt-2">
                    <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                         style="width: 100%"></div>
                </div>
            </div>
        `;
    }
    
    // Payment error UI update
    function showPaymentError(message) {
        const statusDiv = document.getElementById('paymentStatus');
        statusDiv.innerHTML = `
            <div class="alert alert-danger animate__animated animate__fadeIn">
                <h5 class="alert-heading"><i class="fas fa-times-circle me-2"></i>Payment Failed</h5>
                <p>${message}</p>
                <button class="btn btn-outline-danger btn-sm mt-2" id="retryPayment">
                    <i class="fas fa-redo me-1"></i>Try Again
                </button>
            </div>
        `;
        
        // Add event listener to retry button
        document.getElementById('retryPayment').addEventListener('click', function() {
            // Hide status and reset form
            statusDiv.style.display = 'none';
            hideProcessingUI();
        });
    }
    
    // Toast notification helper function
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '5';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'info'}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        // Add toast to container
        document.getElementById('toast-container').innerHTML += toastHTML;
        
        // Initialize and show toast
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { 
            autohide: true,
            delay: 5000
        });
        bsToast.show();
    }
});