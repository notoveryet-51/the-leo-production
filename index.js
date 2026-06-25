// THE LEO PRODUCTION - CORE JAVASCRIPT

/**
 * =========================================================================
 * DYNAMIC DATABASE CONFIGURATION (GOOGLE SHEETS)
 * =========================================================================
 * 
 * You can manage all videos and photos dynamically using a Google Sheet!
 * 
 * 1. Create a Google Sheet with two tabs/sheets named exactly: "Videos" and "Photos".
 * 2. In the "Videos" sheet, create these headers in Row 1:
 *    - Title | Category | VideoUrl | ThumbUrl | Description | Featured
 * 3. In the "Photos" sheet, create these headers in Row 1:
 *    - Title | ImageUrl | Description
 * 4. Share the spreadsheet so that "Anyone with the link can view".
 * 5. Paste the Spreadsheet ID from the URL below (between /d/ and /edit).
 * 
 * Example URL: https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F/edit
 * SPREADSHEET_ID would be: '1A2B3C4D5E6F'
 */
const SPREADSHEET_ID = '1S7_R6rgADlEDCcDoabMjM6E0QSM4T6Mtfjk8trTvcos'; // Enter your Google Sheet ID here to activate dynamic updates!

/**
 * =========================================================================
 * DEFAULT FALLBACK DATA (Used if no Google Sheet is connected yet)
 * =========================================================================
 */
const DEFAULT_VIDEOS = [];

const DEFAULT_PHOTOS = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE ICONS
    lucide.createIcons();

    // 2. CANVAS EMBER PARTICLES
    initEmbersEffect();

    // 3. NAVIGATION & MOBILE DRAWER
    initNavigation();

    // 4. LOAD CONTENT (Sheets or Fallback)
    loadDatabase();

    // 5. FAQ ACCORDION SETUP
    initFaq();

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
            
            const r = Math.floor(Math.random() * 55) + 200; // 200-255
            const g = Math.floor(Math.random() * 100) + 50;  // 50-150
            const b = 0;
            this.color = `rgba(${r}, ${g}, ${b}, `;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y / 30) * 0.15;
            this.alpha -= this.decay;
            
            if (this.alpha <= 0 || this.y < -10) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
            
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }

    animate();

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

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileDrawerClose = document.getElementById('mobile-drawer-close');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
    if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
    
    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });
}

/* ==========================================
   4. DYNAMIC DATABASE FETCHING & PARSING
   ========================================== */

// Helper: Parse Google Drive file ID
function getGoogleDriveFileId(url) {
    if (!url) return null;
    // Handles sharing URL, direct download, embed, view
    const regExp = /(?:https?:\/\/)?(?:drive\.google\.com\/)(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// Helper: Convert Google Drive Link to Playback Link
function resolveGoogleDriveUrl(url, type = 'video') {
    const driveId = getGoogleDriveFileId(url);
    if (!driveId) return url; // Return raw if not a GDrive link

    if (type === 'image') {
        // High-speed cached image display proxy link from Google User Content
        return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
    }
    // Direct stream link
    return `https://docs.google.com/uc?export=download&id=${driveId}`;
}

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

// Resolve Media URLs and Thumbnails
function resolveMediaDetails(item) {
    const ytId = getYoutubeId(item.videoUrl);
    const vimeoId = getVimeoId(item.videoUrl);
    const driveId = getGoogleDriveFileId(item.videoUrl);
    
    let embedUrl = item.videoUrl;
    let resolvedThumb = item.thumbUrl || '';
    let isYtOrVimeo = !!(ytId || vimeoId);

    // Resolve custom thumbnail if hosted on Google Drive
    if (resolvedThumb) {
        resolvedThumb = resolveGoogleDriveUrl(resolvedThumb, 'image');
    }

    if (ytId) {
        embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
        if (!resolvedThumb) {
            resolvedThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        }
    } else if (vimeoId) {
        embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
        if (!resolvedThumb) {
            resolvedThumb = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80';
        }
    } else if (driveId) {
        embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        isYtOrVimeo = true; // Use iframe player for Google Drive video preview modal
        if (!resolvedThumb) {
            resolvedThumb = `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
        }
    }

    return { embedUrl, resolvedThumb, isYtOrVimeo };
}

// Helper: Get header key matching keywords
function getHeaderKey(cellText) {
    const text = String(cellText).toLowerCase().trim().replace(/\s+/g, '');
    if (text.startsWith('title')) return 'title';
    if (text.startsWith('category')) return 'category';
    if (text.startsWith('videourl')) return 'videourl';
    if (text.startsWith('imageurl')) return 'imageurl';
    if (text.startsWith('thumburl')) return 'thumburl';
    if (text.startsWith('description') || text.startsWith('desc')) return 'description';
    if (text.startsWith('featured')) return 'featured';
    return null;
}

// Helper: Extract data from header cell if the user typed it there
function getValueFromHeaderCell(headerText, key) {
    const lowerText = headerText.toLowerCase();
    let prefixLength = 0;
    
    if (key === 'title' && lowerText.startsWith('title')) prefixLength = 5;
    else if (key === 'category' && lowerText.startsWith('category')) prefixLength = 8;
    else if (key === 'videourl' && lowerText.startsWith('videourl')) prefixLength = 8;
    else if (key === 'imageurl' && lowerText.startsWith('imageurl')) prefixLength = 8;
    else if (key === 'thumburl' && lowerText.startsWith('thumburl')) prefixLength = 8;
    else if (key === 'description' && (lowerText.startsWith('description') || lowerText.startsWith('desc'))) {
        prefixLength = lowerText.startsWith('description') ? 11 : 4;
    }
    else if (key === 'featured' && lowerText.startsWith('featured')) prefixLength = 8;
    
    if (prefixLength > 0) {
        return headerText.substring(prefixLength).trim();
    }
    return '';
}

// Fetch spreadsheet JSON data
async function fetchSheetData(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    const response = await fetch(url);
    const text = await response.text();
    
    // Parse Google visualization JSON wrapper
    const jsonStr = text.substring(47, text.length - 2);
    const data = JSON.parse(jsonStr);
    
    const rows = data.table.rows;
    
    // Step 1: Build a raw 2D grid of values
    const rawGrid = [];
    const headerLabels = data.table.cols.map(c => c.label ? String(c.label).trim() : '');
    rawGrid.push(headerLabels);
    
    rows.forEach(r => {
        if (r && r.c) {
            const rowVals = r.c.map(cell => {
                if (!cell) return '';
                if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
                return '';
            });
            rawGrid.push(rowVals);
        }
    });
    
    // Step 2: Locate the header row by searching for matching keywords
    let headerRowIdx = 0;
    for (let r = 0; r < rawGrid.length; r++) {
        let matchCount = 0;
        rawGrid[r].forEach(cell => {
            if (getHeaderKey(cell)) matchCount++;
        });
        if (matchCount >= 2) {
            headerRowIdx = r;
            break;
        }
    }
    
    const headerRow = rawGrid[headerRowIdx];
    const colMapping = [];
    
    headerRow.forEach((cell, idx) => {
        const key = getHeaderKey(cell);
        if (key) {
            colMapping.push({ colIdx: idx, key, headerText: cell });
        }
    });
    
    // Step 3: Parse the records
    const parsedItems = [];
    const startDataRow = headerRowIdx + 1;
    
    if (startDataRow >= rawGrid.length) {
        // Only header row exists. Check if we can extract an item from it.
        const item = {};
        let hasEmbeddedData = false;
        colMapping.forEach(({ key, headerText }) => {
            const val = getValueFromHeaderCell(headerText, key);
            if (val !== '') {
                hasEmbeddedData = true;
            }
            item[key] = val;
        });
        if (hasEmbeddedData) {
            parsedItems.push(item);
        }
    } else {
        // Standard case: Parse all rows after the header row
        for (let r = startDataRow; r < rawGrid.length; r++) {
            const item = {};
            
            // Initialize with values extracted from the header row (if any)
            colMapping.forEach(({ key, headerText }) => {
                item[key] = getValueFromHeaderCell(headerText, key);
            });
            
            // Overwrite with values from the current row
            let rowFeatured = false;
            colMapping.forEach(({ colIdx, key }) => {
                const cellVal = rawGrid[r][colIdx];
                if (cellVal !== undefined && cellVal !== '') {
                    const cleanedVal = String(cellVal).trim();
                    if (key === 'featured' && (cleanedVal.toLowerCase() === 'true' || cleanedVal.toLowerCase() === 'yes')) {
                        rowFeatured = true;
                    }
                    
                    // Do not overwrite a text key (like title, url) with a boolean value
                    const isBoolString = cleanedVal.toLowerCase() === 'true' || cleanedVal.toLowerCase() === 'false' || cleanedVal.toLowerCase() === 'yes' || cleanedVal.toLowerCase() === 'no';
                    if (isBoolString && (key === 'title' || key === 'videourl' || key === 'imageurl' || key === 'thumburl')) {
                        // Keep header-derived value or previous value
                    } else {
                        item[key] = cleanedVal;
                    }
                }
            });
            
            if (rowFeatured) {
                item['featured'] = 'true';
            }
            
            parsedItems.push(item);
        }
    }
    
    return parsedItems;
}

// MAIN DATABASE LOAD
async function loadDatabase() {
    let videos = [];
    let photos = [];

    if (SPREADSHEET_ID) {
        console.log('Loading database from Google Sheets...');
        
        // Load Videos
        try {
            videos = await fetchSheetData('Videos');
            videos = videos.map((v, idx) => ({
                id: v.id || `sheet-v-${idx}`,
                title: v.title || 'Untitled Video',
                category: (v.category || 'reels').toLowerCase(),
                videoUrl: v.videourl || v.video_url || '',
                thumbUrl: v.thumburl || v.thumb_url || '',
                desc: v.description || '',
                featured: String(v.featured).toLowerCase() === 'true' || String(v.featured).toLowerCase() === 'yes'
            }));
        } catch (error) {
            console.error('Failed to load Videos sheet, using fallback:', error);
            videos = DEFAULT_VIDEOS;
        }

        // Load Photos
        try {
            photos = await fetchSheetData('Photos');
            photos = photos.map(p => ({
                title: p.title || 'Cinematic Shot',
                imageUrl: p.imageurl || p.image_url || '',
                desc: p.description || ''
            }));
        } catch (error) {
            console.error('Failed to load Photos sheet, using fallback:', error);
            photos = DEFAULT_PHOTOS;
        }
        
    } else {
        console.log('No Spreadsheet ID connected. Rendering local fallback templates.');
        videos = DEFAULT_VIDEOS;
        photos = DEFAULT_PHOTOS;
    }

    // Build website components with loaded data
    setupSliders(videos, photos);
    setupPortfolioGrid(videos);
}

/* ==========================================
   CAROUSEL SLIDERS COMPONENT SETUP
   ========================================== */
function setupSliders(videos, photos) {
    const videoTrack = document.getElementById('video-slider-track');
    const videoDots = document.getElementById('video-slider-dots');
    const photoTrack = document.getElementById('photo-slider-track');
    const photoDots = document.getElementById('photo-slider-dots');
    
    let featuredVideos = videos.filter(v => v.featured);
    if (featuredVideos.length === 0 && videos.length > 0) {
        // Fallback: If no videos are marked as featured, use the first 5 videos
        featuredVideos = videos.slice(0, 5);
    }
    
    // 1. POPULATE VIDEO CAROUSEL
    if (featuredVideos.length > 0) {
        videoTrack.innerHTML = '';
        videoDots.innerHTML = '';
        
        featuredVideos.forEach((item, idx) => {
            const { resolvedThumb } = resolveMediaDetails(item);
            const slide = document.createElement('div');
            slide.className = 'slider-slide';
            slide.innerHTML = `
                <div class="slide-video-preview">
                    <img src="${resolvedThumb}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80'">
                    <div class="slide-play-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                    </div>
                </div>
                <div class="slide-video-info">
                    <span class="slide-category">${item.category}</span>
                    <h3 class="slide-title">${item.title}</h3>
                    <p class="slide-desc">${item.desc}</p>
                    <button class="btn btn-outline btn-sm play-slide-trigger">
                        <span>Play Video</span>
                    </button>
                </div>
            `;
            
            // Event listeners to play video
            const playAction = () => openTheaterModal(item);
            slide.querySelector('.slide-video-preview').addEventListener('click', playAction);
            slide.querySelector('.play-slide-trigger').addEventListener('click', playAction);
            
            videoTrack.appendChild(slide);
            
            // Add Dot
            const dot = document.createElement('span');
            dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
            dot.setAttribute('data-index', idx);
            videoDots.appendChild(dot);
        });

        // Initialize Slider Engine for Videos
        initializeSliderEngine(
            videoTrack, 
            document.getElementById('video-prev-btn'), 
            document.getElementById('video-next-btn'), 
            videoDots, 
            featuredVideos.length
        );
    }

    // 2. POPULATE PHOTO CAROUSEL
    if (photos.length > 0) {
        photoTrack.innerHTML = '';
        photoDots.innerHTML = '';
        
        photos.forEach((item, idx) => {
            const resolvedImg = resolveGoogleDriveUrl(item.imageUrl, 'image');
            const slide = document.createElement('div');
            slide.className = 'slider-slide photo-slide';
            slide.innerHTML = `
                <img src="${resolvedImg}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80'">
                <div class="photo-slide-overlay">
                    <h3 class="photo-slide-title">${item.title}</h3>
                    <p class="photo-slide-desc">${item.desc}</p>
                </div>
            `;
            
            photoTrack.appendChild(slide);
            
            // Add Dot
            const dot = document.createElement('span');
            dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
            dot.setAttribute('data-index', idx);
            photoDots.appendChild(dot);
        });

        // Initialize Slider Engine for Photos
        initializeSliderEngine(
            photoTrack, 
            document.getElementById('photo-prev-btn'), 
            document.getElementById('photo-next-btn'), 
            photoDots, 
            photos.length
        );
    }
}

// SLIDER LOGIC CAROUSEL CONTROLLER
function initializeSliderEngine(track, prevBtn, nextBtn, dotsContainer, count) {
    if (count <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }

    let currentIndex = 0;
    let autoInterval;
    const scrollTimer = 6000;

    function shiftToSlide(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Update dots active class
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        currentIndex = index;
    }

    function slideNext() {
        let targetIndex = currentIndex + 1;
        if (targetIndex >= count) {
            targetIndex = 0; // Loop back to start!
        }
        shiftToSlide(targetIndex);
    }

    function slidePrev() {
        let targetIndex = currentIndex - 1;
        if (targetIndex < 0) {
            targetIndex = count - 1; // Loop back to end!
        }
        shiftToSlide(targetIndex);
    }

    function resetAutoplay() {
        clearInterval(autoInterval);
        autoInterval = setInterval(slideNext, scrollTimer);
    }

    // Attach button listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            slidePrev();
            resetAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            slideNext();
            resetAutoplay();
        });
    }

    // Attach dot listeners
    dotsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('slider-dot')) {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            shiftToSlide(index);
            resetAutoplay();
        }
    });

    // Start Autoplay loop
    resetAutoplay();
}

/* ==========================================
   PORTFOLIO GALLERY GRID CONTROLLER
   ========================================== */
function setupPortfolioGrid(works) {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const emptyState = document.getElementById('portfolio-empty-state');
    const filterButtons = document.querySelectorAll('.filter-btn');

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
            
            card.addEventListener('click', () => openTheaterModal(item));
            portfolioGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    // Filter bindings
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            
            portfolioGrid.style.opacity = 0;
            setTimeout(() => {
                renderPortfolio(filter);
                portfolioGrid.style.opacity = 1;
            }, 180);
        });
    });

    renderPortfolio('all');
}

/* ==========================================
   THEATER MODE MODAL PLAYER
   ========================================== */
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
        // Plays direct MP4 and Google Drive stream links natively inside the browser modal!
        theaterVideoContainer.innerHTML = `
            <video src="${embedUrl}" controls autoplay></video>
        `;
    }

    theaterModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeTheaterModal() {
    theaterModal.classList.remove('open');
    theaterVideoContainer.innerHTML = ''; // Stops playback instantly
    document.body.style.overflow = '';
}

if (theaterClose) theaterClose.addEventListener('click', closeTheaterModal);
if (theaterBackdrop) theaterBackdrop.addEventListener('click', closeTheaterModal);



/* ==========================================
   6. SCROLL REVEAL EFFECTS
   ========================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('[data-reveal]');
    
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

/* ==========================================
   7. FAQ ACCORDION TOGGLE CONTROLLER
   ========================================== */
function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle active class on clicked item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}
