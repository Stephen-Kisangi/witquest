/**
 * Witquest Castle School - Facilities Page JavaScript
 * Enhances the interactivity and functionality of the facilities page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize facility data
    const facilityData = {
        'library': {
            title: 'Modern Library',
            description: 'Our state-of-the-art library is designed to inspire a love of reading and learning. With over 25,000 books spanning various genres and subjects, digital resources, and comfortable reading areas, it provides an ideal environment for research and quiet study.',
            features: [
                'Over 25,000 books, periodicals, and digital resources',
                'Dedicated quiet study areas',
                'Digital catalog system',
                'Reading nooks for younger students',
                'Multimedia section with educational videos and resources',
                'Regular book clubs and reading events'
            ],
            image: '../images/facilities/science-experiments-with-kids.png'
        },
        'science-labs': {
            title: 'Science Laboratories',
            description: 'Our eight fully-equipped science laboratories provide hands-on learning experiences in physics, chemistry, biology, and environmental science. Each lab is designed to foster curiosity and scientific inquiry, allowing students to conduct experiments and develop critical thinking skills.',
            features: [
                'Separate labs for physics, chemistry, biology, and environmental science',
                'Safety equipment and protocols',
                'Digital microscopes and scientific instruments',
                'Interactive smart boards for demonstrations',
                'Sustainable design features',
                'Outdoor experimental areas'
            ],
            image: '/api/placeholder/600/400'
        },
        'computer-lab': {
            title: 'Computer Labs',
            description: 'Our modern computer labs are equipped with the latest technology to develop digital literacy skills. Students learn programming, digital design, and responsible use of technology in a supervised environment.',
            features: [
                'High-performance computers with educational software',
                'Coding and robotics equipment',
                'High-speed internet access',
                'Interactive learning software',
                'Digital design tools',
                'Cybersecurity education resources'
            ],
            image: '/api/placeholder/600/400'
        },
        'sports-complex': {
            title: 'Sports Complex',
            description: 'Our comprehensive sports facilities promote physical fitness, teamwork, and a healthy lifestyle. From team sports to individual activities, we offer diverse options to develop athletic skills and sportsmanship.',
            features: [
                'Full-size football field with running track',
                'Indoor multipurpose court for basketball, volleyball, and badminton',
                'Swimming pool with trained lifeguards',
                'Tennis courts',
                'Gymnastics equipment',
                'Changing rooms and shower facilities'
            ],
            image: '/api/placeholder/600/400'
        },
        'art-studio': {
            title: 'Art Studios',
            description: 'Our dedicated art studios provide space and resources for students to express their creativity through various visual arts and crafts. These studios are equipped with materials and tools to support diverse artistic expressions.',
            features: [
                'Well-lit workspaces with natural lighting',
                'Pottery wheels and kiln',
                'Painting and drawing supplies',
                'Sculpture materials',
                'Digital art equipment',
                'Exhibition space for student work'
            ],
            image: '/api/placeholder/600/400'
        },
        'music-room': {
            title: 'Music Rooms',
            description: 'Our soundproof music rooms allow students to learn and practice various instruments and vocal techniques. From individual practice to group ensembles, our facilities support comprehensive musical education.',
            features: [
                'Soundproof practice rooms',
                'Variety of musical instruments',
                'Recording equipment',
                'Music theory learning resources',
                'Performance space for recitals',
                'Digital composition tools'
            ],
            image: '/api/placeholder/600/400'
        },
        'cafeteria': {
            title: 'Dining Hall',
            description: 'Our spacious dining hall serves nutritious, balanced meals prepared by our in-house chefs. We cater to various dietary requirements and teach healthy eating habits as part of our holistic education approach.',
            features: [
                'Spacious seating areas',
                'In-house kitchen with qualified chefs',
                'Fresh, locally-sourced ingredients',
                'Special dietary options available',
                'Sustainable practices (composting, minimal waste)',
                'Student garden for farm-to-table learning'
            ],
            image: '/api/placeholder/600/400'
        },
        'health-center': {
            title: 'Health Center',
            description: 'Our fully-equipped health center ensures the wellbeing of all students and staff. Qualified medical professionals are available during school hours to handle emergencies and provide routine healthcare.',
            features: [
                'Qualified nurse on duty during school hours',
                'Regular doctor visits',
                'First aid facilities',
                'Isolation area for contagious illnesses',
                'Health education programs',
                'Mental health support resources'
            ],
            image: '/api/placeholder/600/400'
        },
        'outdoor-learning': {
            title: 'Outdoor Learning Areas',
            description: 'Our outdoor learning spaces connect students with nature and facilitate experiential learning. These areas include gardens, outdoor classrooms, and environmental observation stations that enhance our curriculum.',
            features: [
                'Outdoor classroom with seating',
                'School garden for hands-on learning',
                'Weather station',
                'Butterfly garden',
                'Nature trail with indigenous plants',
                'Outdoor amphitheater for performances and gatherings'
            ],
            image: '/api/placeholder/600/400'
        }
    };

    // Initialize AOS animations
    AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-in-out'
    });

    // Animate counters on scroll
    const counterSection = document.querySelector('.facilities-counter-wrapper');
    const counters = document.querySelectorAll('.counter');
    
    if (counterSection && counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-count'));
                    let count = 0;
                    const updateCounter = () => {
                        if (count < target) {
                            count += Math.ceil(target / 50);
                            if (count > target) count = target;
                            counter.innerText = count;
                            setTimeout(updateCounter, 30);
                        }
                    };
                    updateCounter();
                });
                counterObserver.unobserve(counterSection);
            }
        }, { threshold: 0.5 });
        
        counterObserver.observe(counterSection);
    }

    // Facility filtering functionality
    const filterButtons = document.querySelectorAll('.btn-filter');
    const facilityItems = document.querySelectorAll('.facility-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter facilities
            if (filterValue === 'all') {
                facilityItems.forEach(item => {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = 1;
                        item.style.transform = 'translateY(0)';
                    }, 100);
                });
            } else {
                facilityItems.forEach(item => {
                    if (item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = 1;
                            item.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        item.style.opacity = 0;
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            }
        });
    });

    // Handle facility modal
    const facilityModal = document.getElementById('facilityModal');
    if (facilityModal) {
        facilityModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const facilityId = button.getAttribute('data-facility');
            
            if (facilityData[facilityId]) {
                const facility = facilityData[facilityId];
                
                // Update modal content
                const modalTitle = this.querySelector('#modal-facility-title');
                const modalDescription = this.querySelector('#modal-facility-description');
                const modalFeatures = this.querySelector('#modal-facility-features');
                const modalImage = this.querySelector('.facility-modal-image img');
                
                if (modalTitle) modalTitle.textContent = facility.title;
                if (modalDescription) modalDescription.textContent = facility.description;
                if (modalImage) modalImage.src = facility.image;
                
                // Clear and populate features list
                if (modalFeatures) {
                    modalFeatures.innerHTML = '';
                    facility.features.forEach(feature => {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fas fa-check-circle"></i> ${feature}`;
                        modalFeatures.appendChild(li);
                    });
                }
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effect to facility cards
    const facilityCards = document.querySelectorAll('.facility-card');
    facilityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
            
            const icon = this.querySelector('.facility-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
            }
            
            const facilityHover = this.querySelector('.facility-hover');
            if (facilityHover) {
                facilityHover.style.bottom = '0';
                facilityHover.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            
            const icon = this.querySelector('.facility-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
            
            const facilityHover = this.querySelector('.facility-hover');
            if (facilityHover) {
                facilityHover.style.bottom = '-50px';
                facilityHover.style.opacity = '0';
            }
        });
    });

    // Add parallax effect to hero section
    const heroSection = document.querySelector('.facilities-hero');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            heroSection.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
        });
    }

    // Initialize testimonial carousel with autoplay
    const testimonialCarousel = document.getElementById('testimonialCarousel');
    if (testimonialCarousel) {
        const carousel = new bootstrap.Carousel(testimonialCarousel, {
            interval: 5000,
            wrap: true
        });
    }
});