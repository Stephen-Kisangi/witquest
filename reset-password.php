<?php
// Validate reset token from URL
$token = $_GET['token'] ?? '';
if (empty($token)) {
    // Redirect or show error
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Your existing head content -->
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <form id="resetConfirmForm">
                    <input type="hidden" id="resetToken" value="<?php echo htmlspecialchars($token); ?>">
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" class="form-control" required minlength="8">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" class="form-control" required>
                    </div>
                    <div id="resetConfirmMessage" class="text-center mt-3"></div>
                    <button type="submit" class="btn btn-primary w-100 mt-3">Reset Password</button>
                </form>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const resetConfirmForm = document.getElementById('resetConfirmForm');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const resetToken = document.getElementById('resetToken').value;
        const responseMessage = document.getElementById('resetConfirmMessage');

        // Password match validation
        function validatePasswordMatch() {
            if (newPasswordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        }

        newPasswordInput.addEventListener('input', validatePasswordMatch);
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);

        resetConfirmForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validation
            if (newPasswordInput.value.length < 8) {
                responseMessage.textContent = 'Password must be at least 8 characters long';
                responseMessage.className = 'text-danger';
                return;
            }

            // Send reset confirmation
            fetch('password-reset.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: newPasswordInput.value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    responseMessage.textContent = data.message;
                    responseMessage.className = 'text-success';
                    
                    // Redirect to login after successful reset
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 3000);
                } else {
                    responseMessage.textContent = data.message;
                    responseMessage.className = 'text-danger';
                }
            })
            .catch(error => {
                console.error('Reset Confirmation Error:', error);
                responseMessage.textContent = 'An unexpected error occurred. Please try again.';
                responseMessage.className = 'text-danger';
            });
        });
    });
    </script>
</body>
</html>