// Custom cursor with rainbow liquid flame trail
const cursor = document.querySelector('.cursor');
const trailContainer = document.querySelector('.cursor-trail');

let mouseX = 0;
let mouseY = 0;
let lastX = 0;
let lastY = 0;
let trailParticles = [];
let animationFrame = null;

// Track mouse movement
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor position immediately
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    
    // Create trail particles
    createTrailParticle(mouseX, mouseY);
    
    lastX = mouseX;
    lastY = mouseY;
});

// Create a trail particle at the cursor position
function createTrailParticle(x, y) {
    // Create multiple particles for denser trail
    const particleCount = 3;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        
        // Randomize size for more organic look
        const size = Math.random() * 0.5 + 0.5;
        if (size > 0.8) {
            particle.classList.add('large');
        } else if (size > 0.65) {
            particle.classList.add('medium');
        }
        
        // Add slight random offset for more natural trail
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        
        // Randomize animation duration for variation
        const duration = 0.6 + Math.random() * 0.4;
        particle.style.animationDuration = duration + 's';
        
        // Add rainbow color variation
        const hue = (Date.now() * 0.1 + i * 60) % 360;
        particle.style.background = `radial-gradient(circle, 
            hsla(${hue}, 100%, 60%, 0.9) 0%,
            hsla(${(hue + 60) % 360}, 100%, 60%, 0.7) 25%,
            hsla(${(hue + 120) % 360}, 100%, 60%, 0.5) 50%,
            hsla(${(hue + 180) % 360}, 100%, 60%, 0.4) 75%,
            hsla(${(hue + 240) % 360}, 100%, 60%, 0.3) 100%
        )`;
        
        trailContainer.appendChild(particle);
        trailParticles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            trailParticles = trailParticles.filter(p => p !== particle);
        }, duration * 1000);
    }
}

// Continuous trail creation for smooth effect
let lastTrailTime = 0;
function createContinuousTrail() {
    const now = Date.now();
    if (now - lastTrailTime > 16) { // ~60fps
        createTrailParticle(mouseX, mouseY);
        lastTrailTime = now;
    }
    requestAnimationFrame(createContinuousTrail);
}

// Start continuous trail animation
createContinuousTrail();

// Hide cursor when mouse leaves window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});

// Clean up particles on page unload
window.addEventListener('beforeunload', () => {
    trailParticles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
});

// Awaken button functionality
const awakenBtn = document.getElementById('awakenBtn');
const videoOverlay = document.getElementById('videoOverlay');
const awakenVideo = document.getElementById('awakenVideo');
const flashOverlay = document.getElementById('flashOverlay');

// Ensure video is loaded and ready
awakenVideo.load();

// Wait for video to be ready
awakenVideo.addEventListener('loadeddata', () => {
    console.log('Video loaded and ready');
});

awakenVideo.addEventListener('error', (e) => {
    console.error('Video error:', e);
    console.error('Video error details:', awakenVideo.error);
});

awakenBtn.addEventListener('click', () => {
    // Flash white
    flashOverlay.classList.add('active');
    
    setTimeout(() => {
        flashOverlay.classList.remove('active');
        
        // Show video overlay first
        videoOverlay.classList.add('active');
        
        // Hide main page elements
        document.body.style.overflow = 'hidden';
        
        // Reset video to start
        awakenVideo.currentTime = 0;
        
        // Play video
        const playPromise = awakenVideo.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video playing');
                // Video is playing, now try fullscreen on the overlay container
                setTimeout(() => {
                    if (videoOverlay.requestFullscreen) {
                        videoOverlay.requestFullscreen().catch(err => {
                            console.log('Fullscreen error:', err);
                        });
                    } else if (videoOverlay.webkitRequestFullscreen) {
                        videoOverlay.webkitRequestFullscreen();
                    } else if (videoOverlay.mozRequestFullScreen) {
                        videoOverlay.mozRequestFullScreen();
                    } else if (videoOverlay.msRequestFullscreen) {
                        videoOverlay.msRequestFullscreen();
                    }
                }, 200);
            }).catch(err => {
                console.error('Error playing video:', err);
                // Video overlay is already shown, user can manually play if needed
            });
        } else {
            // Fallback: try to play anyway
            awakenVideo.play().catch(err => {
                console.error('Play failed:', err);
            });
        }
    }, 300);
});

// When video ends, return to main page
awakenVideo.addEventListener('ended', () => {
    // Exit fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    
    // Hide video overlay
    videoOverlay.classList.remove('active');
    
    // Reset video
    awakenVideo.pause();
    awakenVideo.currentTime = 0;
    
    // Show main page elements
    document.body.style.overflow = 'auto';
});
