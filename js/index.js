document.addEventListener("DOMContentLoaded", function () {
    // Toggle Hero Links Visibility
    const heroSection = document.getElementById("heroCarousel");
    const heroLinks = document.querySelectorAll(".hero-links");

    function toggleHeroLinks() {
        const heroRect = heroSection.getBoundingClientRect();
        if (heroRect.top >= 0 && heroRect.bottom <= window.innerHeight) {
            heroLinks.forEach(link => link.classList.add("visible"));
        } else {
            heroLinks.forEach(link => link.classList.remove("visible"));
        }
    }

    toggleHeroLinks();
    window.addEventListener("scroll", toggleHeroLinks);

    // Preload all carousel images
    const preloadImages = () => {
        const images = document.querySelectorAll('#heroCarousel img');
        images.forEach(img => {
            const newImg = new Image();
            newImg.src = img.src;
        });
    };
    preloadImages();

    // Initialize Carousel with proper cycling
    const myCarousel = new bootstrap.Carousel('#heroCarousel', {
        interval: 5000,
        wrap: true,
        pause: false,
        ride: 'carousel'
    });

    // Handle instant transitions
    document.querySelector('#heroCarousel').addEventListener('slide.bs.carousel', function (e) {
        // Hide current active item
        const activeItem = this.querySelector('.carousel-item.active');
        activeItem.style.opacity = '0';
        
        // Show next item immediately
        const nextItem = e.relatedTarget;
        nextItem.style.opacity = '1';
    });

    // Reset opacity after slide
    document.querySelector('#heroCarousel').addEventListener('slid.bs.carousel', function () {
        const items = this.querySelectorAll('.carousel-item');
        items.forEach(item => {
            if (!item.classList.contains('active')) {
                item.style.opacity = '0';
            }
        });
    });
});

    // Enable hover functionality for dropdowns
    document.querySelectorAll('.nav-item.dropdown').forEach(function (dropdown) {
        dropdown.addEventListener('mouseenter', function () {
            let menu = dropdown.querySelector('.dropdown-menu');
            menu.classList.add('show');
        });
        dropdown.addEventListener('mouseleave', function () {
            let menu = dropdown.querySelector('.dropdown-menu');
            menu.classList.remove('show');
        });
    });


    // Add this JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Animated gradient effect
    const buttons = document.querySelectorAll('.witquest-btn');
    
    buttons.forEach(btn => {
        // Create canvas for gradient animation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        // Set up gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#6a0f1a');
        gradient.addColorStop(0.5, '#0f3460');
        gradient.addColorStop(1, '#3d0f6a');
        
        // Animation loop
        let offset = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = gradient;
            ctx.fillRect(-offset, 0, canvas.width + offset, canvas.height);
            
            offset = (offset + 1) % canvas.width;
            requestAnimationFrame(animate);
        }
        animate();
        
        // Apply animation as background
        btn.style.backgroundImage = `url(${canvas.toDataURL()})`;
        btn.style.backgroundSize = '200% auto';
        btn.style.backgroundPosition = '0 0';
        
        // Hover effects
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                backgroundPosition: '100% 100%',
                duration: 1.5,
                ease: 'power2.inOut'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                backgroundPosition: '0 0',
                duration: 1,
                ease: 'power2.out'
            });
        });
    });

    // Mobile touch optimization
    let lastTap = 0;
    buttons.forEach(btn => {
        btn.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
                btn.click();
            }
            lastTap = currentTime;
        });
    });
});





//MISSION AND VISION SECTION JS
document.addEventListener('DOMContentLoaded', function() {
    // Create particles
    function createParticles(container, count) {
      const containerEl = document.querySelector(container);
      
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.3 + 0.05;
        
        // Random animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        containerEl.appendChild(particle);
      }
    }
    
    createParticles('.vision-particles', 20);
    createParticles('.mission-particles', 20);
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements
    const elements = document.querySelectorAll('.philosophy-content, .icon-container, .philosophy-title, .philosophy-statement, .btn-explore');
    elements.forEach(el => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(el);
    });
    
    // Add parallax effect on scroll
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      const panels = document.querySelectorAll('.philosophy-panel');
      
      panels.forEach(panel => {
        const speed = 0.5;
        const rect = panel.getBoundingClientRect();
        const isInView = (rect.top < window.innerHeight && rect.bottom > 0);
        
        if (isInView) {
          const yPos = (scrollPosition - panel.offsetTop) * speed;
          const emblem = panel.querySelector('.castle-emblem');
          if (emblem) {
            emblem.style.transform = `translateY(calc(-50% + ${yPos}px))`;
          }
        }
      });
    });
    
    // Make elements visible on load
    setTimeout(() => {
      elements.forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      });
    }, 300);
  });





//ADDED CASTLE SECTION
const castle = document.getElementById('castle');
    const castleContainer = document.getElementById('castle-container');
    const toggleNightBtn = document.getElementById('toggleNightBtn');
    const sun = document.getElementById('sun');

    // Castle enlargement
    castle.addEventListener('click', () => {
      castle.classList.toggle('wcs-enlarged');
    });

    // Night mode toggle
    toggleNightBtn.addEventListener('click', () => {
      castleContainer.classList.toggle('wcs-night-mode');
      toggleNightBtn.textContent = castleContainer.classList.contains('wcs-night-mode') ? 'Switch to Day' : 'Toggle Day/Night';
    });

    sun.addEventListener('click', () => {
      castleContainer.classList.toggle('wcs-night-mode');
      toggleNightBtn.textContent = castleContainer.classList.contains('wcs-night-mode') ? 'Switch to Day' : 'Toggle Day/Night';
    });

    // Function to show a specific message
    function showMessage(messageId) {
      const messages = document.querySelectorAll('.wcs-message');
      messages.forEach(msg => {
        if (msg.id === messageId) {
          msg.style.display = 'block';
        } else {
          msg.style.display = 'none';
        }
      });
    }

    // Event listeners for message buttons
    document.getElementById('showMissionBtn').addEventListener('click', () => showMessage('mission-message'));
    document.getElementById('showVisionBtn').addEventListener('click', () => showMessage('vision-message'));
    document.getElementById('showValuesBtn').addEventListener('click', () => showMessage('values-message'));