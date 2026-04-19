const toggleButton = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

// Toggle Mobile Menu
toggleButton.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = toggleButton.querySelector('i');

    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
});

// Close Mobile Menu on Click
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = toggleButton.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    });
});

const MOBILE_BREAKPOINT = 768;
const projectCards = document.querySelectorAll('.project-card:not(.final-card)');
const projectModalOverlay = document.createElement('div');
const projectsSlider = document.querySelector('.projects-slider');
const certificationsSection = document.querySelector('#certifications');
const certificationsContainer = certificationsSection ? certificationsSection.querySelector('.container') : null;
const certGrid = certificationsSection ? certificationsSection.querySelector('.cert-grid') : null;
const certModalOverlay = document.createElement('div');
let autoSliderIntervalId = null;
let autoSliderDirection = 1;
let autoSliderIndex = 0;
let autoSliderResumeTimeoutId = null;
let sliderInteractionBound = false;
let certTopMoreButton = null;
let certBottomMoreButton = null;
let certBottomMoreWrap = null;
let certDesktopExpanded = false;

projectModalOverlay.className = 'project-modal-overlay';
projectModalOverlay.innerHTML = '<div class="project-modal" role="dialog" aria-modal="true"></div>';
document.body.appendChild(projectModalOverlay);

const projectModal = projectModalOverlay.querySelector('.project-modal');

certModalOverlay.className = 'cert-modal-overlay';
certModalOverlay.innerHTML = '<div class="cert-modal" role="dialog" aria-modal="true"></div>';
document.body.appendChild(certModalOverlay);

const certModal = certModalOverlay.querySelector('.cert-modal');

function isMobileView() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function closeProjectModal() {
    projectModalOverlay.classList.remove('active');
    projectModal.innerHTML = '';
}

function openProjectModal(card) {
    projectModal.innerHTML = '';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'modal-close-btn';
    closeBtn.setAttribute('aria-label', 'Pop-up kapat');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeProjectModal);

    const contentClone = card.querySelector('.project-content').cloneNode(true);
    contentClone.querySelectorAll('.project-toggle-btn').forEach(btn => btn.remove());
    projectModal.appendChild(closeBtn);
    projectModal.appendChild(contentClone);
    projectModalOverlay.classList.add('active');
}

function closeCertModal() {
    certModalOverlay.classList.remove('active');
    certModal.innerHTML = '';
}

function openCertModal() {
    if (!certGrid) return;

    certModal.innerHTML = '';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'modal-close-btn';
    closeBtn.setAttribute('aria-label', 'Pop-up kapat');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeCertModal);

    const certGridClone = certGrid.cloneNode(true);
    certGridClone.classList.remove('cert-grid-collapsed-mobile');
    certGridClone.classList.remove('cert-grid-collapsed-desktop');
    certGridClone.querySelectorAll('.cert-card-link.is-hidden-cert').forEach((item) => {
        item.classList.remove('is-hidden-cert');
    });
    certModal.appendChild(closeBtn);
    certModal.appendChild(certGridClone);
    certModalOverlay.classList.add('active');
}

function setCardCompact(card, compact) {
    card.classList.toggle('is-compact', compact);
    const toggleBtn = card.querySelector('.project-toggle-btn');

    if (!toggleBtn) return;

    if (isMobileView()) {
        toggleBtn.textContent = 'Daha fazla gör';
        return;
    }

    toggleBtn.textContent = compact ? 'Daha fazla gör' : 'Daha az gör';
}

function initProjectCards() {
    projectCards.forEach(card => {
        let toggleBtn = card.querySelector('.project-toggle-btn');

        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'project-toggle-btn';
            toggleBtn.textContent = 'Daha fazla gör';
            card.appendChild(toggleBtn);
        }

        setCardCompact(card, true);

        toggleBtn.onclick = () => {
            if (isMobileView()) {
                openProjectModal(card);
                return;
            }

            const shouldCompact = !card.classList.contains('is-compact');
            setCardCompact(card, shouldCompact);
        };
    });
}

function stopAutoSliderMotion() {
    if (autoSliderIntervalId !== null) {
        window.clearInterval(autoSliderIntervalId);
        autoSliderIntervalId = null;
    }

    if (autoSliderResumeTimeoutId !== null) {
        window.clearTimeout(autoSliderResumeTimeoutId);
        autoSliderResumeTimeoutId = null;
    }
}

function syncSliderIndexToNearestCard(sliderItems) {
    if (!projectsSlider || sliderItems.length === 0) return;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    sliderItems.forEach((item, index) => {
        const distance = Math.abs(projectsSlider.scrollLeft - item.offsetLeft);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
        }
    });

    autoSliderIndex = nearestIndex;
}

function restartAutoSliderAfterDelay(delayMs = 2600) {
    if (autoSliderResumeTimeoutId !== null) {
        window.clearTimeout(autoSliderResumeTimeoutId);
    }

    autoSliderResumeTimeoutId = window.setTimeout(() => {
        initAutoSliderMotion();
    }, delayMs);
}

function bindSliderInteractionPause(sliderItems) {
    if (!projectsSlider || sliderInteractionBound) return;

    const pauseAndResume = () => {
        stopAutoSliderMotion();
        syncSliderIndexToNearestCard(sliderItems);
        restartAutoSliderAfterDelay();
    };

    projectsSlider.addEventListener('pointerdown', pauseAndResume, { passive: true });
    projectsSlider.addEventListener('touchstart', pauseAndResume, { passive: true });
    projectsSlider.addEventListener('wheel', pauseAndResume, { passive: true });
    sliderInteractionBound = true;
}

function initAutoSliderMotion() {
    stopAutoSliderMotion();

    if (!projectsSlider) return;
    if (!isMobileView()) return;

    const sliderItems = Array.from(projectsSlider.querySelectorAll('.project-card'));
    if (sliderItems.length < 2) return;

    bindSliderInteractionPause(sliderItems);
    syncSliderIndexToNearestCard(sliderItems);

    if (autoSliderIndex <= 0) autoSliderDirection = 1;
    if (autoSliderIndex >= sliderItems.length - 1) autoSliderDirection = -1;

    const intervalMs = 3200;

    autoSliderIntervalId = window.setInterval(() => {
        if (!isMobileView()) return;

        const maxIndex = sliderItems.length - 1;
        if (autoSliderIndex >= maxIndex) autoSliderDirection = -1;
        if (autoSliderIndex <= 0) autoSliderDirection = 1;

        autoSliderIndex += autoSliderDirection;

        projectsSlider.scrollTo({
            left: sliderItems[autoSliderIndex].offsetLeft,
            behavior: 'smooth'
        });
    }, intervalMs);
}

function getCertCardLinks() {
    if (!certGrid) return [];
    return Array.from(certGrid.querySelectorAll('.cert-card-link'));
}

function ensureCertControls() {
    if (!certificationsContainer || !certGrid) return;
    const certTitle = certificationsContainer.querySelector('.section-title');

    if (!certTopMoreButton) {
        certTopMoreButton = document.createElement('button');
        certTopMoreButton.type = 'button';
        certTopMoreButton.className = 'cert-more-btn cert-more-top-btn';
        certTopMoreButton.textContent = 'Daha fazla gör';
        certTopMoreButton.addEventListener('click', openCertModal);
    }

    if (!certBottomMoreWrap) {
        certBottomMoreWrap = document.createElement('div');
        certBottomMoreWrap.className = 'cert-more-bottom-wrap';
    }

    if (!certBottomMoreButton) {
        certBottomMoreButton = document.createElement('button');
        certBottomMoreButton.type = 'button';
        certBottomMoreButton.className = 'cert-more-btn cert-more-bottom-btn';
        certBottomMoreButton.textContent = 'Daha fazla gör';
        certBottomMoreButton.addEventListener('click', () => {
            const certCards = getCertCardLinks();
            if (!certCards.length) return;

            certDesktopExpanded = !certDesktopExpanded;

            if (certDesktopExpanded) {
                certGrid.classList.remove('cert-grid-collapsed-desktop');
                certCards.forEach((item) => item.classList.remove('is-hidden-cert'));
                certBottomMoreWrap.classList.add('expanded');
                certBottomMoreButton.textContent = 'Daha az gör';
                return;
            }

            certCards.forEach((item) => item.classList.remove('is-hidden-cert'));
            certCards.slice(8).forEach((item) => item.classList.add('is-hidden-cert'));
            certGrid.classList.add('cert-grid-collapsed-desktop');
            certBottomMoreWrap.classList.remove('expanded');
            certBottomMoreButton.textContent = 'Daha fazla gör';
        });
    }

    if (!certTopMoreButton.parentElement && certTitle) {
        certTitle.insertAdjacentElement('afterend', certTopMoreButton);
    }

    if (!certBottomMoreWrap.parentElement) {
        certGrid.insertAdjacentElement('afterend', certBottomMoreWrap);
    }

    if (!certBottomMoreButton.parentElement) {
        certBottomMoreWrap.appendChild(certBottomMoreButton);
    }
}

function initCertificationsDisplay() {
    if (!certGrid || !certificationsContainer) return;

    ensureCertControls();
    const certCards = getCertCardLinks();

    certCards.forEach((item) => item.classList.remove('is-hidden-cert'));
    certGrid.classList.remove('cert-grid-collapsed-mobile', 'cert-grid-collapsed-desktop');
    certTopMoreButton.classList.remove('active');
    certBottomMoreWrap.classList.remove('active');
    certBottomMoreWrap.classList.remove('expanded');
    certDesktopExpanded = false;

    if (isMobileView()) {
        if (certCards.length > 4) {
            certCards.slice(4).forEach((item) => item.classList.add('is-hidden-cert'));
            certGrid.classList.add('cert-grid-collapsed-mobile');
            certTopMoreButton.classList.add('active');
        }
        return;
    }

    if (certCards.length > 8) {
        certCards.slice(8).forEach((item) => item.classList.add('is-hidden-cert'));
        certGrid.classList.add('cert-grid-collapsed-desktop');
        certBottomMoreWrap.classList.add('active');
        certBottomMoreButton.textContent = 'Daha fazla gör';
    }
}

projectModalOverlay.addEventListener('click', (event) => {
    if (event.target === projectModalOverlay) {
        closeProjectModal();
    }
});

certModalOverlay.addEventListener('click', (event) => {
    if (event.target === certModalOverlay) {
        closeCertModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProjectModal();
        closeCertModal();
    }
});

window.addEventListener('resize', () => {
    projectCards.forEach(card => setCardCompact(card, true));
    if (!isMobileView()) {
        closeProjectModal();
        closeCertModal();
        stopAutoSliderMotion();
    } else {
        initAutoSliderMotion();
    }
    initCertificationsDisplay();
});

initProjectCards();
initAutoSliderMotion();
initCertificationsDisplay();
