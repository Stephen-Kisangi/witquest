// Academics Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to elements as they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.approach-card, .card, .section-heading, .lead');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Initial check for elements in view
    animateOnScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add active class to nav items on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Curriculum tab interactions
    const curriculumTabs = document.getElementById('curriculumTabs');
    if (curriculumTabs) {
        curriculumTabs.addEventListener('shown.bs.tab', function (event) {
            // Add animation to the newly activated tab content
            const targetId = event.target.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);
            
            // Reset animations
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('fade-in');
                pane.classList.remove('fade-in-delay-1');
            });
            
            // Add animations to new content
            targetPane.classList.add('fade-in');
            
            // Animate internal elements with delay
            const targetElements = targetPane.querySelectorAll('.card, .accordion');
            targetElements.forEach(el => {
                el.classList.add('fade-in-delay-1');
            });
        });
    }
    
    // Form validation for any contact or inquiry forms
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Counter animation for statistics
    const startCounters = () => {
        const counters = document.querySelectorAll('.counter');
        const speed = 200;
        
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const increment = target / speed;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCount();
        });
    };
    
    // Check if counters are in view
    const observeCounters = () => {
        const countersSection = document.querySelector('.counter-wrapper');
        if (countersSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    startCounters();
                    observer.unobserve(entries[0].target);
                }
            }, { threshold: 0.5 });
            
            observer.observe(countersSection);
        }
    };
    
    observeCounters();
    
    // Image gallery for curriculum sections (if needed)
    const initGallery = () => {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').getAttribute('src');
                const modal = document.createElement('div');
                modal.classList.add('gallery-modal');
                
                modal.innerHTML = `
                    <div class="gallery-modal-content">
                        <span class="close">&times;</span>
                        <img src="${imgSrc}" alt="Gallery image">
                    </div>
                `;
                
                document.body.appendChild(modal);
                document.body.style.overflow = 'hidden';
                
                modal.querySelector('.close').addEventListener('click', function() {
                    document.body.removeChild(modal);
                    document.body.style.overflow = 'auto';
                });
                
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                        document.body.style.overflow = 'auto';
                    }
                });
            });
        });
    };
    
    // Initialize gallery if gallery items exist
    if (document.querySelector('.gallery-item')) {
        initGallery();
    }
    
    // Handle curriculum downloads
    const downloadButtons = document.querySelectorAll('.download-curriculum');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // In production, this would trigger a download or redirect
            // For now, show a toast notification
            const toastContainer = document.createElement('div');
            toastContainer.classList.add('position-fixed', 'bottom-0', 'end-0', 'p-3');
            toastContainer.style.zIndex = '11';
            
            toastContainer.innerHTML = `
                <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="fas fa-check-circle me-2"></i> Curriculum guide will download shortly!
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(toastContainer);
            
            const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
            toast.show();
            
            setTimeout(() => {
                document.body.removeChild(toastContainer);
            }, 5000);
        });
    });
});