document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  }, { passive: true });

  /* ---------- Header shrink on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* ---------- Scroll-reveal for cards/sections ---------- */
  var revealSelectors = [
    '.card', '.step', '.split > div', '.contact-tile', '.form-card',
    '.cta-banner', '.logo-strip', '.stat-strip', '.faq-item', '.hero-photo'
  ];
  var revealEls = document.querySelectorAll(revealSelectors.join(','));
  revealEls.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 6, 6) * 60) + 'ms';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  document.querySelectorAll('.stat-num, .count-num').forEach(function (el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^([\d,]+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ''), 10);
    var suffix = match[2] || '';
    var done = false;
    function animateCount() {
      if (done) return;
      done = true;
      var start = null;
      var duration = 1100;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      cio.observe(el);
    } else {
      animateCount();
    }
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Role ticker (marquee, duplicated for seamless loop) ---------- */
  document.querySelectorAll('.ticker-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Simple form handlers -> build a WhatsApp message ---------- */
  document.querySelectorAll('form[data-whatsapp]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.getAttribute('data-whatsapp');
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (value, key) {
        if (value) lines.push(key + ': ' + value);
      });
      var text = encodeURIComponent(lines.join('\n'));
      window.open('https://wa.me/' + phone + '?text=' + text, '_blank');
    });
  });

  /* ---------- "Which plan fits you?" quiz ---------- */
  var quiz = document.querySelector('.quiz');
  if (quiz) {
    var steps = Array.from(quiz.querySelectorAll('.quiz-step'));
    var scoreEl = quiz.querySelector('.quiz-progress-fill');
    var answers = {};
    var currentStep = 0;

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      if (scoreEl) scoreEl.style.width = ((i) / (steps.length - 1) * 100) + '%';
    }

    quiz.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = btn.closest('.quiz-step').dataset.q;
        answers[q] = btn.dataset.value;
        btn.closest('.quiz-step').querySelectorAll('.quiz-option').forEach(function (b) {
          b.classList.remove('picked');
        });
        btn.classList.add('picked');
        setTimeout(function () {
          currentStep++;
          if (currentStep < steps.length) {
            showStep(currentStep);
          } else {
            showQuizResult();
          }
        }, 280);
      });
    });

    function showQuizResult() {
      var urgency = answers.urgency;
      var support = answers.support;
      var result = quiz.querySelector('.quiz-result');
      var premiumScore = 0;
      if (urgency === 'asap') premiumScore++;
      if (support === 'lots') premiumScore++;
      var isPremium = premiumScore >= 1;
      quiz.querySelector('.quiz-steps').style.display = 'none';
      result.style.display = 'block';
      result.querySelector('.quiz-result-title').textContent = isPremium
        ? 'Premium Placement Service looks like your fit'
        : 'Free Placement looks like your fit';
      result.querySelector('.quiz-result-body').textContent = isPremium
        ? 'You want speed and steady support — unlimited placement calls and priority updates for a full year will move faster for you than the free track.'
        : 'You\'re open to timing — Free Placement gets you registered and matched against live requirements at no cost, with room to upgrade any time.';
      if (scoreEl) scoreEl.style.width = '100%';
    }

    showStep(0);
  }
});
