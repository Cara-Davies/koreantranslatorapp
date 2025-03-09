document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation elements
    const navToggles = document.querySelectorAll('.nav-toggle');
    const navBar = document.querySelector('.nav-bar');
    const navOverlay = document.querySelector('.nav-overlay');
    const navButtons = document.querySelectorAll('.nav-button');
    const views = document.querySelectorAll('.view');

    // Toggle navigation menu
    function toggleNav() {
        navBar.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navBar.classList.contains('active') ? 'hidden' : '';
    }

    // Close navigation menu
    function closeNav() {
        navBar.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Add click event listeners to all nav toggles
    navToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNav();
        });
    });

    // Close nav when clicking overlay
    navOverlay.addEventListener('click', closeNav);

    // Handle navigation between views
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetView = button.dataset.view;
            
            // Update active states
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetView) {
                    view.classList.add('active');
                }
            });

            // Close nav after navigation on mobile
            if (window.innerWidth < 768) {
                closeNav();
            }
        });
    });

    // Close nav when resizing to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeNav();
        }
    });
}); 