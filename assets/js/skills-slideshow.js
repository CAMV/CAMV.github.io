document.addEventListener('DOMContentLoaded', function () {
  var roots = document.querySelectorAll('[data-skills-slideshow]');

  roots.forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-skill-slide]'));
    var prevButton = root.querySelector('[data-slide-prev]');
    var nextButton = root.querySelector('[data-slide-next]');
    var status = root.querySelector('[data-slide-status]');
    var dotsContainer = root.querySelector('[data-slide-dots]');
    var count = slides.length;

    if (count < 2) return;

    var desktopWindowSize = parseInt(root.dataset.windowSize, 10) || 3;
    var stepSize = parseInt(root.dataset.stepSize, 10) || 1;

    var currentStart = 0;
    var currentWindowSize = desktopWindowSize;
    var dotButtons = [];

    // Helper to calculate active window size depending on viewport width
    function getActiveWindowSize() {
      // Matches the mobile CSS breakpoint (740px)
      if (window.matchMedia('(max-width: 740px)').matches) {
        return 1; // Display 1 item on mobile
      }
      return Math.min(desktopWindowSize, count);
    }

    // Re-builds dot controls when window size changes (desktop <-> mobile)
    function rebuildDots() {
      if (!dotsContainer) return;

      dotsContainer.innerHTML = '';
      dotButtons = [];

      var totalSteps = Math.max(1, Math.ceil((count - currentWindowSize) / stepSize) + 1);

      for (var i = 0; i < totalSteps; i++) {
        (function (stepIndex) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'skills-dot' + (stepIndex === 0 ? ' is-active' : '');
          dot.setAttribute('aria-label', 'Go to step ' + (stepIndex + 1));

          dot.addEventListener('click', function () {
            goTo(stepIndex * stepSize);
          });

          dotsContainer.appendChild(dot);
          dotButtons.push(dot);
        })(i);
      }
    }

    function renderSlide() {
      currentWindowSize = getActiveWindowSize();
      root.style.setProperty('--slide-window-size', currentWindowSize);

      var visibleIndexes = [];
      for (var offset = 0; offset < currentWindowSize; offset += 1) {
        visibleIndexes.push((currentStart + offset) % count);
      }

      slides.forEach(function (slide, slideIndex) {
        var isVisible = visibleIndexes.indexOf(slideIndex) !== -1;
        slide.classList.toggle('is-active', isVisible);
        if (isVisible) {
          slide.removeAttribute('hidden');
        } else {
          slide.setAttribute('hidden', '');
        }
      });

      // Update active state on dots
      if (dotButtons.length > 0) {
        var activeStep = Math.floor(currentStart / stepSize);
        dotButtons.forEach(function (dot, idx) {
          dot.classList.toggle('is-active', idx === activeStep);
        });
      }

      if (status) {
        var startIndex = currentStart + 1;
        var endIndex = Math.min(currentStart + currentWindowSize, count);
        status.textContent = startIndex + '–' + endIndex + ' of ' + count;
      }
    }

    function goTo(index) {
      var maxStartIndex = Math.max(0, count - currentWindowSize);
      if (index > maxStartIndex) {
        currentStart = 0;
      } else if (index < 0) {
        currentStart = maxStartIndex;
      } else {
        currentStart = index;
      }
      renderSlide();
    }

    // Re-evaluate bounds and breadcrumbs on browser resize
    window.addEventListener('resize', function () {
      var newWindowSize = getActiveWindowSize();
      if (newWindowSize !== currentWindowSize) {
        currentWindowSize = newWindowSize;
        rebuildDots();
        renderSlide();
      }
    });

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        goTo(currentStart - stepSize);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        goTo(currentStart + stepSize);
      });
    }

    // Initial load setup
    rebuildDots();
    renderSlide();
  });
});