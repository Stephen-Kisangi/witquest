// Initialize AOS animation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }

    // Activity filtering
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter activities
            document.querySelectorAll('.activity-item').forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } else if (item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Timeline year tabs
    document.querySelectorAll('.year-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.year-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            const yearValue = this.getAttribute('data-year');
            
            // Show/hide timeline items based on year
            document.querySelectorAll('.timeline-item').forEach(item => {
                if (item.getAttribute('data-year') === yearValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Gallery item click event for larger view
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').getAttribute('src');
            const imgTitle = this.querySelector('.gallery-item-overlay h6').textContent;
            
            // Create modal for image view
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '9999';
            modal.style.flexDirection = 'column';
            
            const img = document.createElement('img');
            img.setAttribute('src', imgSrc);
            img.style.maxWidth = '80%';
            img.style.maxHeight = '80%';
            img.style.borderRadius = '5px';
            
            const title = document.createElement('h5');
            title.textContent = imgTitle;
            title.style.color = 'white';
            title.style.marginTop = '15px';
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.style.padding = '8px 20px';
            closeBtn.style.backgroundColor = '#fff';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.marginTop = '15px';
            closeBtn.style.cursor = 'pointer';
            
            modal.appendChild(img);
            modal.appendChild(title);
            modal.appendChild(closeBtn);
            
            document.body.appendChild(modal);
            
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
    });

    // Load more activities button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        let isMoreLoaded = false;

        loadMoreBtn.addEventListener('click', function() {
            if (!isMoreLoaded) {
                // Create more activity cards
                const activitiesContainer = document.getElementById('activities-container');
                
                const newActivities = [
                    {
                        category: 'academic',
                        date: 'September 3, 2024',
                        title: 'Admission Day Ceremony',
                        description: 'We welcomed new students to our school with a formal induction ceremony, cultural performances, and orientation activities.',
                        image: './images/activities/activities-page/admission-ceremony.avif'
                    },
                    {
                        category: 'arts',
                        date: 'August 12, 2024',
                        title: 'Music & Dance Festival',
                        description: 'Students showcased their musical and dance talents in a colorful celebration of Kenyan and international cultural expressions.',
                        image: './images/activities/activities-page/music-kigarama-traditional-dance_orig.jpg'
                    },
                    {
                        category: 'community',
                        date: 'July 5, 2024',
                        title: 'Community Service Day',
                        description: 'Our students participated in various community service projects, including environmental cleanup and mentorship programs.',
                        image: './images/activities/activities-page/community-volunteer-opportunities-for-kids-header-1024x682.jpg'
                    }
                ];
                
                // Create and append new activity cards
                newActivities.forEach((activity, index) => {
                    const delay = index * 100;
                    const activityHTML = `
                        <div class="col-md-6 col-lg-4 mb-4 activity-item" data-category="${activity.category}">
                            <div class="activity-card" data-aos="fade-up" data-aos-delay="${delay}">
                                <img src="${activity.image}" class="card-img-top" alt="${activity.title}">
                                <div class="card-body">
                                    <div class="activity-date">${activity.date}</div>
                                    <h5 class="activity-title">${activity.title}</h5>
                                    <p class="activity-description">${activity.description}</p>
                                    <a href="#" class="btn btn-sm" style="background-color: var(--deep-blue); color: white;">View Details</a>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    activitiesContainer.insertAdjacentHTML('beforeend', activityHTML);
                });
                
                // Refresh AOS animations
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
                
                // Apply current filter
                const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter');
                if (activeFilter && activeFilter !== 'all') {
                    document.querySelectorAll('.activity-item').forEach(item => {
                        if (item.getAttribute('data-category') !== activeFilter) {
                            item.style.display = 'none';
                        }
                    });
                }
                
                // Change button text
                this.textContent = 'All Activities Loaded';
                isMoreLoaded = true;
            }
        });
    }

    // Smooth scroll for buttons
    const heroButton = document.querySelector('.hero-section .btn');
    if (heroButton) {
        heroButton.addEventListener('click', function(e) {
            e.preventDefault();
            const upcomingEvents = document.querySelector('.upcoming-events');
            if (upcomingEvents) {
                upcomingEvents.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Simple animation for statistics
    const animateStats = () => {
        // Example statistics that could be animated
        const stats = [
            { element: '.total-activities', value: 45 },
            { element: '.total-participants', value: 820 },
            { element: '.awards-won', value: 32 }
        ];
        
        // Check if stats elements exist
        stats.forEach(stat => {
            const el = document.querySelector(stat.element);
            if (el) {
                let current = 0;
                const increment = stat.value / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= stat.value) {
                        current = stat.value;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current);
                }, 20);
            }
        });
    };

    // Animate statistics when in viewport
    // Check if browser supports Intersection Observer
    if ('IntersectionObserver' in window) {
        // Create observer for stats section
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        });
        
        // Observe stats section if it exists
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }
    
    // Enable tooltips if used
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        if (tooltipTriggerList.length > 0) {
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    // Handle form submissions if any exist
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success mt-3';
                successMsg.textContent = 'Thank you for subscribing to our updates!';
                this.appendChild(successMsg);
                
                // Clear form
                emailInput.value = '';
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    this.removeChild(successMsg);
                }, 3000);
            }
        });
    }

    // Dynamic content loading for upcoming events
    const loadEvents = (month) => {
        // This would normally fetch data from an API
        const eventsByMonth = {
            'april': [
                { date: '10', title: 'International Cultural Day', description: 'A celebration of global cultures represented in our diverse student body.' },
                { date: '15', title: 'Regional Mathematics Competition', description: 'Our top math students will represent the school in this prestigious competition.' },
                { date: '22', title: 'Earth Day Environmental Project', description: 'A school-wide initiative to promote environmental awareness and conservation.' }
            ],
            'may': [
                { date: '05', title: 'Annual Sports Day', description: 'A full day of athletic competitions across all age groups and sports categories.' },
                { date: '18', title: 'Science Exhibition', description: 'Showcasing innovative projects from our young scientists across all grades.' },
                { date: '25', title: 'End of Term Concert', description: 'A musical celebration featuring performances from our talented students.' }
            ],
            'june': [
                { date: '12', title: 'Graduation Ceremony', description: 'A special ceremony honoring our graduating students as they move to their next educational journey.' },
                { date: '20', title: 'Parents Appreciation Day', description: 'A day dedicated to acknowledging the support and partnership of our parent community.' }
            ]
        };
        
        return eventsByMonth[month] || [];
    };

    // Initialize month tabs if they exist
    const monthTabs = document.querySelectorAll('.month-tab');
    if (monthTabs.length > 0) {
        monthTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                monthTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                const month = this.getAttribute('data-month');
                const events = loadEvents(month);
                
                // Update events in the DOM
                const eventsContainer = document.querySelector('.events-list');
                if (eventsContainer) {
                    eventsContainer.innerHTML = '';
                    
                    events.forEach(event => {
                        const eventHTML = `
                            <div class="calendar-event">
                                <div class="calendar-date">
                                    <div>${month.toUpperCase().slice(0, 3)}</div>
                                    <div>${event.date}</div>
                                </div>
                                <div class="calendar-details">
                                    <h6 class="calendar-title">${event.title}</h6>
                                    <p class="mb-0">${event.description}</p>
                                </div>
                            </div>
                        `;
                        
                        eventsContainer.insertAdjacentHTML('beforeend', eventHTML);
                    });
                }
            });
        });
    }
});