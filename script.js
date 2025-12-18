(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    function initBurgerMenu() {
        if (__app.burgerInit) return;
        __app.burgerInit = true;

        var nav = document.querySelector('.c-nav#main-nav');
        var toggle = document.querySelector('.c-nav__toggle');
        var navList = document.querySelector('.c-nav__list');
        var body = document.body;

        if (!nav || !toggle || !navList) return;

        var isOpen = false;
        var focusableElements = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

        navList.style.height = '0';
        navList.style.overflow = 'hidden';
        navList.style.transition = 'height 350ms cubic-bezier(0.4, 0, 0.2, 1)';

        function openMenu() {
            isOpen = true;
            var calcHeight = 'calc(100vh - var(--header-h))';
            navList.style.height = calcHeight;
            navList.style.display = 'flex';
            nav.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('u-no-scroll');
            
            var firstFocusable = navList.querySelector(focusableElements);
            if (firstFocusable) {
                setTimeout(function() {
                    firstFocusable.focus();
                }, 100);
            }
        }

        function closeMenu() {
            isOpen = false;
            navList.style.height = '0';
            setTimeout(function() {
                navList.style.display = 'none';
            }, 350);
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('u-no-scroll');
        }

        function trapFocus(e) {
            if (!isOpen) return;
            
            var focusableList = navList.querySelectorAll(focusableElements);
            var firstFocusable = focusableList[0];
            var lastFocusable = focusableList[focusableList.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
                toggle.focus();
            }
            trapFocus(e);
        });

        document.addEventListener('click', function(e) {
            if (isOpen && !nav.contains(e.target)) {
                closeMenu();
            }
        });

        var navLinks = document.querySelectorAll('.c-nav__link');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                if (isOpen) {
                    closeMenu();
                }
            });
        }

        var handleResize = debounce(function() {
            if (window.innerWidth >= 1024 && isOpen) {
                closeMenu();
            }
        }, 250);

        window.addEventListener('resize', handleResize, { passive: true });
    }

    function initScrollEffects() {
        if (__app.scrollEffectsInit) return;
        __app.scrollEffectsInit = true;

        var cards = document.querySelectorAll('.c-card');
        var features = document.querySelectorAll('.feature-item');
        var sections = document.querySelectorAll('.l-section');

        var elementsToAnimate = [];
        for (var i = 0; i < cards.length; i++) {
            elementsToAnimate.push(cards[i]);
        }
        for (var j = 0; j < features.length; j++) {
            elementsToAnimate.push(features[j]);
        }

        for (var k = 0; k < elementsToAnimate.length; k++) {
            elementsToAnimate[k].style.opacity = '0';
            elementsToAnimate[k].style.transform = 'translateY(30px)';
            elementsToAnimate[k].style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        for (var l = 0; l < elementsToAnimate.length; l++) {
            observer.observe(elementsToAnimate[l]);
        }
    }

    function initMicroInteractions() {
        if (__app.microInit) return;
        __app.microInit = true;

        var buttons = document.querySelectorAll('.c-button');
        var links = document.querySelectorAll('.c-nav__link, .c-link');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            });
            buttons[i].addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            buttons[i].addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0) scale(0.98)';
            });
            buttons[i].addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            });
        }

        for (var j = 0; j < links.length; j++) {
            links[j].addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(3px)';
                this.style.transition = 'transform 0.25s ease-in-out';
            });
            links[j].addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        }
    }

    function initCountUp() {
        if (__app.countUpInit) return;
        __app.countUpInit = true;

        var statsNumbers = document.querySelectorAll('.stats-number');
        if (statsNumbers.length === 0) return;

        var animated = [];

        function animateCount(element, target) {
            var current = 0;
            var increment = target / 60;
            var timer = setInterval(function() {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current) + '+';
            }, 30);
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && animated.indexOf(entry.target) === -1) {
                    animated.push(entry.target);
                    var text = entry.target.textContent.replace(/\D/g, '');
                    var target = parseInt(text, 10);
                    if (!isNaN(target)) {
                        entry.target.textContent = '0+';
                        animateCount(entry.target, target);
                    }
                }
            });
        }, { threshold: 0.5 });

        for (var i = 0; i < statsNumbers.length; i++) {
            observer.observe(statsNumbers[i]);
        }
    }

    function initScrollSpy() {
        if (__app.scrollSpyInit) return;
        __app.scrollSpyInit = true;

        var sections = document.querySelectorAll('.l-section[id]');
        var navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');
        
        if (sections.length === 0 || navLinks.length === 0) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    for (var i = 0; i < navLinks.length; i++) {
                        navLinks[i].removeAttribute('aria-current');
                        navLinks[i].classList.remove('active');
                        if (navLinks[i].getAttribute('href') === '#' + id) {
                            navLinks[i].setAttribute('aria-current', 'page');
                            navLinks[i].classList.add('active');
                        }
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        for (var i = 0; i < sections.length; i++) {
            observer.observe(sections[i]);
        }
    }

    function initSmoothScroll() {
        if (__app.smoothScrollInit) return;
        __app.smoothScrollInit = true;

        var isHomepage = location.pathname === '/' || location.pathname.endsWith('/index.html');

        if (!isHomepage) {
            var anchorLinks = document.querySelectorAll('a[href^="#"]');
            for (var i = 0; i < anchorLinks.length; i++) {
                var href = anchorLinks[i].getAttribute('href');
                if (href !== '#' && href !== '#!') {
                    anchorLinks[i].setAttribute('href', '/' + href);
                }
            }
        }

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            var targetId = href.replace('#', '');
            var target = document.getElementById(targetId);
            
            if (target && isHomepage) {
                e.preventDefault();
                
                var header = document.querySelector('.l-header');
                var offset = header ? header.offsetHeight : 80;
                var targetPosition = target.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    function initActiveMenu() {
        if (__app.activeMenuInit) return;
        __app.activeMenuInit = true;

        var currentPath = location.pathname;
        var navLinks = document.querySelectorAll('.c-nav__link');

        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            var href = link.getAttribute('href');
            
            link.removeAttribute('aria-current');
            link.classList.remove('active');

            if (href === currentPath || 
                (currentPath === '/' && (href === '/' || href === '/index.html')) ||
                (currentPath.endsWith('/index.html') && href === '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            }
        }
    }

    function initImages() {
        if (__app.imagesInit) return;
        __app.imagesInit = true;

        var images = document.querySelectorAll('img');
        var videos = document.querySelectorAll('video');
        
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            
            if (!img.hasAttribute('loading') && 
                !img.classList.contains('c-logo__img') && 
                !img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }

            if (!img.classList.contains('img-fluid')) {
                img.classList.add('img-fluid');
            }

            img.style.opacity = '0';
            img.style.transform = 'scale(0.95)';
            img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

            img.addEventListener('load', function() {
                this.style.opacity = '1';
                this.style.transform = 'scale(1)';
            });

            img.addEventListener('error', function() {
                if (this.dataset.fallbackApplied) return;
                this.dataset.fallbackApplied = 'true';
                
                var fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAxNkwyNCAyNEwxNiAyNEwxNiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                this.src = fallbackSvg;
                this.style.objectFit = 'contain';
            });
        }

        for (var j = 0; j < videos.length; j++) {
            if (!videos[j].hasAttribute('loading')) {
                videos[j].setAttribute('loading', 'lazy');
            }
        }
    }

    function initFormValidation() {
        if (__app.formValidationInit) return;
        __app.formValidationInit = true;

        var forms = document.querySelectorAll('.c-form');
        
        var validators = {
            name: {
                test: function(value) {
                    return /^[a-zA-ZÀ-ÿ\s-']{2,50}$/.test(value);
                },
                message: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben)'
            },
            firstName: {
                test: function(value) {
                    return /^[a-zA-ZÀ-ÿ\s-']{2,50}$/.test(value);
                },
                message: 'Bitte geben Sie einen gültigen Vornamen ein'
            },
            lastName: {
                test: function(value) {
                    return /^[a-zA-ZÀ-ÿ\s-']{2,50}$/.test(value);
                },
                message: 'Bitte geben Sie einen gültigen Nachnamen ein'
            },
            email: {
                test: function(value) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
            },
            phone: {
                test: function(value) {
                    if (!value) return true;
                    return /^[\d\s+\-()]{10,20}$/.test(value);
                },
                message: 'Bitte geben Sie eine gültige Telefonnummer ein'
            },
            message: {
                test: function(value) {
                    return value.length >= 10;
                },
                message: 'Die Nachricht muss mindestens 10 Zeichen lang sein'
            }
        };

        function showError(input, message) {
            var errorDiv = input.parentNode.querySelector('.c-form__error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
            input.setAttribute('aria-invalid', 'true');
            input.classList.add('has-error');
        }

        function clearError(input) {
            var errorDiv = input.parentNode.querySelector('.c-form__error');
            if (errorDiv) {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }
            input.removeAttribute('aria-invalid');
            input.classList.remove('has-error');
        }

        function validateField(input) {
            var value = input.value.trim();
            var fieldName = input.name || input.id;
            var validator = validators[fieldName];

            clearError(input);

            if (input.hasAttribute('required') && !value) {
                showError(input, 'Dieses Feld ist erforderlich');
                return false;
            }

            if (value && validator && !validator.test(value)) {
                showError(input, validator.message);
                return false;
            }

            if (input.type === 'checkbox' && input.hasAttribute('required') && !input.checked) {
                showError(input, 'Bitte akzeptieren Sie die Datenschutzerklärung');
                return false;
            }

            return true;
        }

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            var inputs = form.querySelectorAll('input, select, textarea');

            for (var j = 0; j < inputs.length; j++) {
                inputs[j].addEventListener('blur', function() {
                    validateField(this);
                });

                inputs[j].addEventListener('input', function() {
                    if (this.classList.contains('has-error')) {
                        validateField(this);
                    }
                });
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                var formInputs = this.querySelectorAll('input, select, textarea');
                var isValid = true;

                for (var k = 0; k < formInputs.length; k++) {
                    if (!validateField(formInputs[k])) {
                        isValid = false;
                    }
                }

                if (!isValid) {
                    var firstError = this.querySelector('.has-error');
                    if (firstError) {
                        firstError.focus();
                    }
                    return;
                }

                var submitBtn = this.querySelector('button[type="submit"]');
                var originalText = submitBtn ? submitBtn.innerHTML : '';
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';
                    submitBtn.style.pointerEvents = 'none';
                }

                var style = document.createElement('style');
                style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
                document.head.appendChild(style);

                setTimeout(function() {
                    window.location.href = 'thank_you.html';
                }, 800);
            });
        }
    }

    function initScrollToTop() {
        if (__app.scrollToTopInit) return;
        __app.scrollToTopInit = true;

        var btn = document.createElement('button');
        btn.innerHTML = '↑';
        btn.className = 'scroll-to-top';
        btn.setAttribute('aria-label', 'Nach oben scrollen');
        btn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:var(--color-primary);color:white;border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease-in-out;z-index:999;box-shadow:var(--shadow-lg);';
        
        document.body.appendChild(btn);

        var handleScroll = throttle(function() {
            if (window.pageYOffset > 300) {
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-3px)';
            this.style.boxShadow = 'var(--shadow-xl)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = 'var(--shadow-lg)';
        });
    }

    function initPrivacyModal() {
        if (__app.privacyModalInit) return;
        __app.privacyModalInit = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
        
        for (var i = 0; i < privacyLinks.length; i++) {
            if (privacyLinks[i].getAttribute('href') !== 'privacy.html') continue;
            
            privacyLinks[i].addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if (href === 'privacy.html') {
                    return;
                }
            });
        }
    }

    function initCardHoverEffects() {
        if (__app.cardHoverInit) return;
        __app.cardHoverInit = true;

        var cards = document.querySelectorAll('.c-card');
        
        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = 'var(--shadow-2xl)';
            });
            
            cards[i].addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        }
    }

    function initParallax() {
        if (__app.parallaxInit) return;
        __app.parallaxInit = true;

        var parallaxElements = document.querySelectorAll('.hero-video-bg, .hero-overlay');
        
        if (parallaxElements.length === 0) return;

        var handleScroll = throttle(function() {
            var scrolled = window.pageYOffset;
            
            for (var i = 0; i < parallaxElements.length; i++) {
                var speed = 0.5;
                var yPos = scrolled * speed;
                parallaxElements[i].style.transform = 'translateY(' + yPos + 'px)';
            }
        }, 10);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    __app.init = function() {
        initBurgerMenu();
        initSmoothScroll();
        initActiveMenu();
        initScrollSpy();
        initImages();
        initScrollEffects();
        initMicroInteractions();
        initCountUp();
        initFormValidation();
        initScrollToTop();
        initPrivacyModal();
        initCardHoverEffects();
        initParallax();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __app.init);
    } else {
        __app.init();
    }
})();