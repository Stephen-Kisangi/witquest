function smoothScrollToContact() {
    document.getElementById('contactForm').scrollIntoView({
        behavior: 'smooth'
    });
}

// Add intersection observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate__fadeInUp');
        }
    });
});

// Add animation to map container
const mapContainer = document.querySelector('.map-container');
observer.observe(mapContainer);



// Generate CAPTCHA on load
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * 5) + 1;
    document.getElementById('captchaQuestion').textContent = `Math question: ${num1} + ${num2} = ?`;
    return num1 + num2;
}

let correctAnswer = generateCaptcha();

// Form Validation
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    // Name validation
    const name = document.getElementById('name').value;
    if (!name.includes(' ') || name.trim().split(' ').length < 2) {
        document.getElementById('nameError').textContent = 'Please enter both first and last name';
        isValid = false;
    } else {
        document.getElementById('nameError').textContent = '';
    }

    // Email validation
    const email = document.getElementById('email').value;
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    } else {
        document.getElementById('emailError').textContent = '';
    }

    // Phone validation
    const phone = document.getElementById('phone').value;
    if (!/^07\d{8}$/.test(phone)) {
        document.getElementById('phoneError').textContent = 'Phone must start with 07 and have 10 digits';
        isValid = false;
    } else {
        document.getElementById('phoneError').textContent = '';
    }

    // Message validation
    const message = document.getElementById('message').value;
    if (message.trim().length < 10) {
        document.getElementById('messageError').textContent = 'Message must be at least 10 characters';
        isValid = false;
    } else {
        document.getElementById('messageError').textContent = '';
    }

    // CAPTCHA validation
    const captcha = parseInt(document.getElementById('captcha').value);
    if (captcha !== correctAnswer) {
        document.getElementById('captchaError').textContent = 'Incorrect answer to math question';
        isValid = false;
    } else {
        document.getElementById('captchaError').textContent = '';
    }

    if (isValid) {
        // Prepare data for submission
        const formData = {
            name: name,
            email: email,
            phone: '+254' + phone.substring(1),
            message: message
        };

        // Here you would typically send formData to your PHP backend
        console.log('Form data valid:', formData);
        alert('Message sent successfully!');
        this.reset();
        correctAnswer = generateCaptcha();
    }
});