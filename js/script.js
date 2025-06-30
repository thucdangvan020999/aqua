// website/js/script.js

// --- Global State ---
let isLoading = false;

// --- Utility Functions ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '400px',
        fontFamily: 'inherit'
    });

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.onclick = () => removeNotification(notification);

    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 AquaTech Solutions - Initializing...');
    
    try {
        initializeScrollAnimations();
        setupHeaderScrollEffect();
        setupSmoothScrolling();
        setupFormSubmission();
        setupMobileMenuToggle();
        setupStatsCounterAnimation();
        setupParallaxEffect();
        setupFormValidation();
        setupTypingEffect();
        updateGreeting();
        
        console.log('✅ AquaTech Solutions - Initialized successfully!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// --- Scroll Animations ---
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add staggered animation for solution cards
                if (entry.target.classList.contains('solution-card')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    entry.target.style.animationDelay = `${delay}ms`;
                }
            }
        });
    }, observerOptions);

    // Observe all scroll-animate elements
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });

    // Observe hero elements separately
    const heroText = document.querySelector('.hero-text');
    const heroVisual = document.querySelector('.hero-visual');
    if (heroText) observer.observe(heroText);
    if (heroVisual) observer.observe(heroVisual);
}

// --- Header Scroll Effect ---
const setupHeaderScrollEffect = debounce(() => {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 100);
        }
    });
}, 10);

// --- Smooth Scrolling ---
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();
                
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// --- Form Validation ---
function setupFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Clear previous errors
    clearFieldError(field);

    // Check required fields
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Trường này là bắt buộc';
    }

    // Specific validation
    if (value) {
        switch (field.type) {
            case 'email':
                if (!validateEmail(value)) {
                    isValid = false;
                    message = 'Email không hợp lệ';
                }
                break;
            case 'tel':
                if (!validatePhone(value)) {
                    isValid = false;
                    message = 'Số điện thoại không hợp lệ';
                }
                break;
        }
    }

    if (!isValid) {
        showFieldError(field, message);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// --- Form Submission ---
function setupFormSubmission() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (isLoading) return;

        // Validate all fields
        const inputs = this.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showNotification('Vui lòng kiểm tra lại các trường bắt buộc', 'error');
            return;
        }

        // Show loading state
        setSubmitButtonLoading(true);

        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showNotification(result.message || 'Yêu cầu đã được gửi thành công!', 'success');
                this.reset();
                // Clear any remaining errors
                this.querySelectorAll('.error').forEach(el => clearFieldError(el));
            } else {
                throw new Error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
        } finally {
            setSubmitButtonLoading(false);
        }
    });
}

function setSubmitButtonLoading(loading) {
    isLoading = loading;
    const submitBtn = document.querySelector('.submit-btn');
    
    if (submitBtn) {
        const originalText = submitBtn.dataset.originalText || submitBtn.innerHTML;
        submitBtn.dataset.originalText = originalText;
        
        if (loading) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        } else {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }
}

// --- Mobile Menu ---
function setupMobileMenuToggle() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const heroContent = document.querySelector('.hero-content');
    const header = document.getElementById('header');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        
        mobileMenuToggle.addEventListener('click', () => {
            // Toggle menu state
            const isExpanded = navMenu.classList.contains('active');
            
            // Set the new state
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            document.body.classList.toggle('mobile-menu-open');
            
            // Update aria-expanded for accessibility
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Add shadow to header when menu is open
            if (!isExpanded && header) {
                header.style.boxShadow = 'none'; // Remove bottom shadow when menu is open
            } else if (header) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }
            
            // Add a small delay to ensure transform animation is smooth
            if (!isExpanded && heroContent) {
                // Slight delay to ensure menu animation starts first
                setTimeout(() => {
                    heroContent.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                }, 50);
            }
        });
        
        // Add window resize handler to close menu on larger screens
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
}

function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const heroContent = document.querySelector('.hero-content');
    const header = document.getElementById('header');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Restore header shadow
        if (header) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
        
        // Add a small delay before hero content transforms back
        if (heroContent) {
            // First set transform to ensure a smooth transition
            heroContent.style.transition = 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            heroContent.style.transform = '';
        }
    }
}

// --- Stats Counter Animation ---
function setupStatsCounterAnimation() {
    const statsSection = document.querySelector('.stats');
    if (!statsSection) return;

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const targetText = counter.textContent;
        const targetNum = parseInt(targetText.replace(/\D/g, '')) || 0;
        const suffix = targetText.replace(/\d/g, '');
        
        if (targetNum === 0) return;

        let current = 0;
        const increment = targetNum / 60; // 60 steps for smoother animation
        const duration = 2000; // 2 seconds
        const stepTime = duration / 60;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNum) {
                counter.textContent = targetNum + suffix;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + suffix;
            }
        }, stepTime);
    });
}

// --- Parallax Effect ---
const setupParallaxEffect = debounce(() => {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');

        if (heroImage) {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            heroImage.style.transform = `translateY(${yPos}px)`;
        }
    });
}, 16); // ~60fps

// --- Typing Effect ---
function setupTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.borderRight = '2px solid #0ea5e9';
    
    let index = 0;
    
    const typeWriter = () => {
        if (index < text.length) {
            heroTitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                heroTitle.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 500);
}

// --- Greeting ---
function updateGreeting() {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'sáng' : hour < 18 ? 'chiều' : 'tối';
    const greeting = `🌊 Chào buổi ${timeOfDay}! Chào mừng đến với AquaTech Solutions`;
    
    console.log(greeting);
    console.log('🐟 Chúng tôi cung cấp giải pháp công nghệ thủy sản tiên tiến');
}

// --- Page Load Event ---
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: currentColor;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        }
        
        .field-error {
            color: #ef4444;
            font-size: 14px;
            margin-top: 4px;
        }
        
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 1px #ef4444;
        }
        
        .scroll-animate {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .scroll-animate.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .solution-card {
            transition-delay: 0ms;
        }
    `;
    document.head.appendChild(style);
});

// --- Error Handling ---
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Export for potential use in other scripts
window.AquaTech = {
    showNotification,
    validateEmail,
    validatePhone,
    closeMobileMenu
};