// THE LEO PRODUCTION - CORE JAVASCRIPT

/**
 * =========================================================================
 * PORTFOLIO CONFIGURATION - UPLOAD / EDIT YOUR WORKS HERE
 * =========================================================================
 * 
 * To add, change, or remove works on your website, edit this array of items.
 * 
 * For each work item, provide:
 *   - id: A unique name (e.g. 'work-1', 'work-2')
 *   - title: The name of the video displayed on hover and in theater mode.
 *   - category: Must be one of: 'reels', 'weddings', 'music', or 'events'.
 *   - videoUrl: The link to your video (YouTube, Vimeo, or direct MP4 link).
 *   - thumbUrl: An image link for the thumbnail. (Leave blank or empty string
 *               for YouTube links - the site will automatically fetch the cover!)
 *   - desc: A short paragraph describing your editing style or project context.
 */
const PORTFOLIO_WORKS = [
    {
        id: 'work-1',
        title: 'Cinematic Wedding Highlight',
        category: 'weddings',
        videoUrl: 'https://www.youtube.com/watch?v=2K4VbApyqfI',
        thumbUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        desc: 'A gorgeous, slow-motion wedding cinematic trailer shot on anamorphic lenses. Focused on dynamic color grading, emotional pacing, and romantic soundscapes.'
    },
    {
        id: 'work-2',
        title: 'Fast-Paced Urban Streetwear Reel',
        category: 'reels',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbUrl: '', // Auto-resolves YouTube cover image automatically!
        desc: 'High-energy retail advertisement featuring rhythmic cuts, speed ramps, and customized kinetic typography for social platforms.'
    },
    {
        id: 'work-3',
        title: 'Electric Music Festival Aftermovie',
        category: 'events',
        videoUrl: 'https://www.youtube.com/watch?v=tgbNymZ7vqY',
        thumbUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
        desc: 'A massive sound and visual synchronization highlighting the energy of the crowd, pyrotechnics, and DJ sets.'
    },
    {
        id: 'work-4',
        title: 'Hyped Hip-Hop Music Video Edit',
        category: 'music',
        videoUrl: 'https://www.youtube.com/watch?v=C3s3E0062iU',
        thumbUrl: '', // Auto-resolves YouTube cover image automatically!
        desc: 'Stylistic trippy overlays, glitch edits, beat matchmaking, and complex visual transitions matching the trap music theme.'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE ICONS
    lucide.createIcons();

    // 2. CANVAS EMBER PARTICLES
    initEmbersEffect();

    // 3. NAVIGATION & MOBILE DRAWER
    initNavigation();

    // 4. PORTFOLIO LOGIC
    initPortfolio();

    // 5. CONTACT FORM SUBMISSION
    initContactForm();

    // 6. SCROLL REVEAL EFFECTS
    initScrollReveal();
});

/* ==========================================
   2. CANVAS EMBER PARTICLES
   ========================================== */
function initEmbersEffect() {
    const canvas = document.getElementById('embers-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const maxParticles = 65;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.size = Math.random() * 2.5 + 0.8;
            this.speedY = -(Math.random() * 1.5 + 0.5);
            this.speedX = Math.random() * 0.8 - 0.4;
            this.alpha = Math.random() * 0.5 + 0.4;
            this.decay = Math.random() * 0.003 + 0.0015;
            
            // Fiery colors (orange, red, yellow glowing embers)
            const r = Math.floor(Math.random() * 55) + 200; // 200-255
            const g = Math.floor(Math.random() * 100) + 50;  // 50-150
            const b = 0;
            this.color = `rgba(${r}, ${g}, ${b}, `;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y / 30) * 0.15; // Swirling drift
            this.alpha -= this.decay;
            
            if (this.alpha <= 0 || this.y < -10) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            
            // Subtle glowing effect
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
            
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Render embers
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animate);
    }

    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

/* ==========================================
   3. NAVIGATION & MOBILE DRAWER
   ========================================== */
function initNavigation() {
    const header = document.querySelector('.main-header');
    
    // JS Fallback for shrinking header on scroll (for browsers without CSS Scroll Timeline)
    if (header && !CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
        const scrollDistance = 120;
        const initialHeight = 90;
        const finalHeight = 65;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const scrollPercent = Math.min(1, scrollY / scrollDistance);
            const currentHeight = initialHeight - (initialHeight - finalHeight) * scrollPercent;
            header.style.height = `${currentHeight}px`;
            
            if (scrollY > 50) {
                header.style.background = 'rgba(2, 2, 2, 0.92)';
                header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            } else {
                header.style.background = 'rgba(2, 2, 2, 0.6)';
                header.style.boxShadow = 'none';
            }
        });
    }

    // Drawer references
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileDrawerClose = document.getElementById('mobile-drawer-close');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock scroll
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        document.body.style.overflow = ''; // Unlock scroll
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
    if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
    
    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });
}

/* ==========================================
   4. PORTFOLIO LOGIC
   ========================================== */
function initPortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const emptyState = document.getElementById('portfolio-empty-state');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Use the core static config array directly
    const works = PORTFOLIO_WORKS;

    // Helper: Parse YouTube ID
    function getYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Helper: Parse Vimeo ID
    function getVimeoId(url) {
        const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }

    // Helper: Generate embed URL & Thumbnail resolution
    function resolveMediaDetails(item) {
        const ytId = getYoutubeId(item.videoUrl);
        const vimeoId = getVimeoId(item.videoUrl);
        
        let embedUrl = item.videoUrl;
        let resolvedThumb = item.thumbUrl || '';

        if (ytId) {
            embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
            if (!resolvedThumb) {
                resolvedThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
            }
        } else if (vimeoId) {
            embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
            if (!resolvedThumb) {
                // Fallback thumbnail for vimeo if not provided
                resolvedThumb = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80';
            }
        }

        return { embedUrl, resolvedThumb, isYtOrVimeo: !!(ytId || vimeoId) };
    }

    // RENDER WORKS GRID
    function renderPortfolio(categoryFilter = 'all') {
        portfolioGrid.innerHTML = '';
        const filteredWorks = categoryFilter === 'all' 
            ? works 
            : works.filter(w => w.category === categoryFilter);

        if (filteredWorks.length === 0) {
            emptyState.classList.add('visible');
            portfolioGrid.style.display = 'none';
            return;
        }

        emptyState.classList.remove('visible');
        portfolioGrid.style.display = 'grid';

        filteredWorks.forEach(item => {
            const card = document.createElement('div');
            card.className = 'portfolio-card';
            card.setAttribute('data-category', item.category);
            
            const { resolvedThumb } = resolveMediaDetails(item);
            
            card.innerHTML = `
                <div class="portfolio-thumbnail-wrapper">
                    <img src="${resolvedThumb}" alt="${item.title}" class="portfolio-thumbnail" onerror="this.src='https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80'">
                    <div class="play-button-overlay">
                        <i data-lucide="play"></i>
                    </div>
                    <div class="portfolio-overlay">
                        <span class="portfolio-card-category">${item.category}</span>
                        <h3 class="portfolio-card-title">${item.title}</h3>
                        <p class="portfolio-card-desc">${item.desc}</p>
                    </div>
                </div>
            `;
            
            // Modal play click trigger
            card.addEventListener('click', () => openTheaterModal(item));
            portfolioGrid.appendChild(card);
        });

        // Trigger Lucide updates for play icons
        lucide.createIcons();
    }

    // THEATER MODAL DETAILS
    const theaterModal = document.getElementById('theater-modal');
    const theaterBackdrop = document.getElementById('theater-backdrop');
    const theaterClose = document.getElementById('theater-close');
    const theaterVideoContainer = document.getElementById('theater-video-container');
    const theaterTitle = document.getElementById('theater-title');
    const theaterCategory = document.getElementById('theater-category');
    const theaterDesc = document.getElementById('theater-desc');

    function openTheaterModal(item) {
        theaterTitle.textContent = item.title;
        theaterCategory.textContent = item.category;
        theaterDesc.textContent = item.desc;
        
        const { embedUrl, isYtOrVimeo } = resolveMediaDetails(item);
        
        if (isYtOrVimeo) {
            theaterVideoContainer.innerHTML = `
                <iframe src="${embedUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
            `;
        } else {
            // Direct video link (e.g. MP4)
            theaterVideoContainer.innerHTML = `
                <video src="${item.videoUrl}" controls autoplay></video>
            `;
        }

        theaterModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeTheaterModal() {
        theaterModal.classList.remove('open');
        theaterVideoContainer.innerHTML = ''; // Stop video immediately
        document.body.style.overflow = '';
    }

    if (theaterClose) theaterClose.addEventListener('click', closeTheaterModal);
    if (theaterBackdrop) theaterBackdrop.addEventListener('click', closeTheaterModal);

    // FILTER BUTTONS CLICK HANDLERS
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            // Add subtle fade out/in effect
            portfolioGrid.style.opacity = 0;
            setTimeout(() => {
                renderPortfolio(filter);
                portfolioGrid.style.opacity = 1;
            }, 180);
        });
    });

    // INITIAL INITIALIZATION
    renderPortfolio('all');
}

/* ==========================================
   5. CONTACT FORM SUBMISSION
   ========================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successOverlay = document.getElementById('form-success-overlay');
    const closeSuccessBtn = document.getElementById('close-success-btn');
    const submitBtn = document.getElementById('form-submit-btn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show loading state on submit button
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Message...</span> <div class="loader"></div>';
        
        // Mock Form Submission delay
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            
            // Show Success Screen overlay
            successOverlay.classList.add('visible');
        }, 1200);
    });

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            successOverlay.classList.remove('visible');
            form.reset();
        });
    }
}

/* ==========================================
   6. SCROLL REVEAL EFFECTS
   ========================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('[data-reveal]');
    
    // Add fade class
    reveals.forEach(el => {
        el.classList.add('reveal-element');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        observer.observe(el);
    });
}
