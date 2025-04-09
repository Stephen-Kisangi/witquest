document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('leadership');
    if (!section) return;

    const cards = section.querySelectorAll('.leadership-card');
    const header = section.querySelector('.section-header');

    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            header.classList.add('reveal');
            cards.forEach((card, index) => {
                setTimeout(() => card.classList.add('reveal'), index * 150);
            });
            observer.disconnect();
        }
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    observer.observe(section);
});