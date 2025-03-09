// Navigation elements
const navToggle = document.querySelector('.nav-toggle');
const navBar = document.querySelector('.nav-bar');
const navOverlay = document.querySelector('.nav-overlay');
const navButtons = document.querySelectorAll('.nav-button');

// Toggle navigation
function toggleNavigation() {
    navBar.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navBar.classList.contains('active') ? 'hidden' : '';
}

// Close navigation
function closeNavigation() {
    navBar.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners
navToggle.addEventListener('click', toggleNavigation);
navOverlay.addEventListener('click', closeNavigation);

// Close navigation when a nav button is clicked
navButtons.forEach(button => {
    button.addEventListener('click', closeNavigation);
});

// Handle touch events for swipe to close
let touchStartX = 0;
let touchEndX = 0;

navBar.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

navBar.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    // If swiped left more than threshold, close nav
    if (swipeDistance < -swipeThreshold) {
        closeNavigation();
    }
}

// Close navigation on window resize if it would switch to desktop view
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 768) {
            closeNavigation();
        }
    }, 250);
}); 