(function () {
  'use strict';

  var body = document.body;
  var themeBtn = document.querySelector('.theme-toggle');
  var stored = localStorage.getItem('theme');
  if (stored === 'light') body.classList.add('light');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      body.classList.toggle('light');
      localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
    });
  }

  var siteContent = window.SITE_CONTENT || {};

  function getContentValue(path) {
    return path.split('.').reduce(function (value, key) {
      return value && value[key] !== undefined ? value[key] : undefined;
    }, siteContent);
  }

  function applySiteContent() {
    if (siteContent.meta && siteContent.meta.title) document.title = siteContent.meta.title;
    if (siteContent.meta && siteContent.meta.description) {
      var metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', siteContent.meta.description);
    }

    document.querySelectorAll('[data-content]').forEach(function (element) {
      var value = getContentValue(element.dataset.content);
      if (value !== undefined && value !== null) element.textContent = value;
    });

    document.querySelectorAll('[data-list]').forEach(function (element) {
      var values = getContentValue(element.dataset.list);
      if (!Array.isArray(values)) return;
      element.replaceChildren();
      values.forEach(function (value) {
        var span = document.createElement('span');
        span.textContent = value;
        element.appendChild(span);
      });
    });

    document.querySelectorAll('[data-list-profile]').forEach(function (element) {
      var values = getContentValue(element.dataset.listProfile);
      if (!Array.isArray(values)) return;
      element.replaceChildren();
      values.forEach(function (item) {
        var wrapper = document.createElement('div');
        var label = document.createElement('dt');
        var value = document.createElement('dd');
        label.textContent = item.label;
        value.textContent = item.value;
        wrapper.append(label, value);
        element.appendChild(wrapper);
      });
    });

    document.querySelectorAll('[data-list-tools]').forEach(function (element) {
      var values = getContentValue(element.dataset.listTools);
      if (!Array.isArray(values)) return;
      element.replaceChildren();
      values.forEach(function (item) {
        var article = document.createElement('article');
        var title = document.createElement('h3');
        var desc = document.createElement('p');
        article.className = 'tool-group';
        desc.className = 'tool-lead';
        title.textContent = item.title;
        desc.textContent = item.desc;
        article.append(title, desc);
        element.appendChild(article);
      });
    });

    document.querySelectorAll('[data-list-contact]').forEach(function (element) {
      var values = getContentValue(element.dataset.listContact);
      if (!Array.isArray(values)) return;
      element.replaceChildren();
      values.forEach(function (item) {
        var link = document.createElement('a');
        var label = document.createElement('span');
        var value = document.createElement('strong');
        link.className = 'contact-pill';
        link.href = item.href || '#';
        label.textContent = item.label;
        value.textContent = item.value;
        if (/^https?:\/\//.test(link.href)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        if (item.qr) {
          var qr = document.createElement('img');
          qr.src = item.qr;
          qr.alt = item.label + '二维码';
          qr.loading = 'lazy';
          link.classList.add('contact-qr-pill');
          link.append(label, value, qr);
        } else {
          link.append(label, value);
        }
        element.appendChild(link);
      });
    });
  }

  applySiteContent();

  var glow = document.getElementById('glow');
  if (glow) {
    window.addEventListener('mousemove', function (e) {
      glow.style.transform = 'translate(' + (e.clientX - 380) + 'px,' + (e.clientY - 380) + 'px)';
    }, { passive: true });
  }

  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('show', window.scrollY > 520);
    }, { passive: true });
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  function buildChars(container, isHero) {
    var text = container.textContent;
    container.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = isHero ? 'hero-char' : 'char';
      span.textContent = text[i] === ' ' ? '\u00a0' : text[i];
      if (isHero) span.style.setProperty('--char-delay', (0.22 + i * 0.09).toFixed(3) + 's');
      container.appendChild(span);
    }
  }

  function bindJumpText(el, hot, warm) {
    hot = hot || 34;
    warm = warm || 78;
    el.addEventListener('mousemove', function (e) {
      Array.from(el.children).forEach(function (child) {
        var box = child.getBoundingClientRect();
        var dx = e.clientX - (box.left + box.width / 2);
        var dy = e.clientY - (box.top + box.height / 2);
        var dist = Math.hypot(dx, dy);
        child.classList.toggle('hot', dist < hot);
        child.classList.toggle('warm', dist >= hot && dist < warm);
      });
    });
    el.addEventListener('mouseleave', function () {
      Array.from(el.children).forEach(function (child) {
        child.classList.remove('hot', 'warm');
      });
    });
  }

  var heroTitle = document.querySelector('.hero .gradient');
  if (heroTitle) {
    buildChars(heroTitle, true);
    bindJumpText(heroTitle, 120, 230);
    setTimeout(function () {
      var h1 = heroTitle.closest('h1');
      if (h1) h1.classList.add('hero-ready');
    }, 1800);
  }
  document.querySelectorAll('.title, .tools-title, .works-title, .pd-title').forEach(function (el) {
    if (el.classList.contains('gradient')) return;
    buildChars(el);
    bindJumpText(el);
  });

  var allProjects = (window.SITE_DATA && window.SITE_DATA.projects) || [];
  var allCategories = (window.SITE_DATA && window.SITE_DATA.categories) || [];
  var longformItems = (window.SITE_DATA && window.SITE_DATA.longform) || [];
  var longformCopyItems = siteContent.longform && Array.isArray(siteContent.longform.items)
    ? siteContent.longform.items
    : [];

  if (longformCopyItems.length) {
    longformItems = longformItems.map(function (item) {
      var copy = longformCopyItems.find(function (entry) { return entry.id === item.id; });
      return copy ? Object.assign({}, item, copy) : item;
    });
  }

  if (window.SITE_PAGES) {
    allCategories.forEach(function (category) {
      if (Array.isArray(window.SITE_PAGES[category.id]) && window.SITE_PAGES[category.id].length) {
        category.pages = window.SITE_PAGES[category.id];
      }
    });
  }

  function projectImage(project) {
    return project.image || ('assets/' + project.id + '/cover.svg');
  }

  function projectById(id) {
    return allProjects.find(function (project) { return project.id === id; });
  }

  var sliceLightbox = document.getElementById('sliceLightbox');
  var sliceImage = document.getElementById('sliceLightboxImage');
  var sliceCaption = document.getElementById('sliceLightboxCaption');
  var sliceItems = allProjects.map(function (project) {
    return {
      image: projectImage(project),
      label: project.title,
      caption: project.client + ' · ' + project.year
    };
  });
  var sliceIndex = 0;

  function renderSliceLightbox() {
    var item = sliceItems[sliceIndex];
    if (!item) return;
    sliceImage.src = item.image;
    sliceImage.alt = item.label;
    sliceCaption.textContent = item.label;
  }

  function openSliceLightbox(items, index) {
    if (!items || !items.length || !items[index]) return;
    sliceItems = items;
    sliceIndex = index;
    renderSliceLightbox();
    sliceLightbox.classList.add('open');
    sliceLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSliceLightbox() {
    sliceLightbox.classList.remove('open');
    sliceLightbox.setAttribute('aria-hidden', 'true');
    if (!pd || !pd.classList.contains('open')) document.body.style.overflow = '';
  }

  function moveSliceLightbox(step) {
    if (!sliceItems.length) return;
    sliceIndex = (sliceIndex + step + sliceItems.length) % sliceItems.length;
    renderSliceLightbox();
  }

  if (sliceLightbox) {
    document.getElementById('sliceLightboxClose').addEventListener('click', closeSliceLightbox);
    document.getElementById('sliceLightboxPrev').addEventListener('click', function () { moveSliceLightbox(-1); });
    document.getElementById('sliceLightboxNext').addEventListener('click', function () { moveSliceLightbox(1); });
    sliceLightbox.addEventListener('click', function (e) {
      if (e.target === sliceLightbox) closeSliceLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!sliceLightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeSliceLightbox();
      if (e.key === 'ArrowLeft') moveSliceLightbox(-1);
      if (e.key === 'ArrowRight') moveSliceLightbox(1);
    });
  }

  var sphereTrack = document.getElementById('sphereTrack');
  if (sphereTrack) {
    var sphereSources = [];
    var sphereSourceKeys = new Set();

    function addSphereSource(image, label, caption, preview) {
      if (!image || sphereSourceKeys.has(image)) return;
      sphereSourceKeys.add(image);
      sphereSources.push({
        image: image,
        preview: preview || image,
        label: label,
        caption: caption || ''
      });
    }

    allCategories.forEach(function (category) {
      if (category.id === 'practice') return;
      (category.pages || []).forEach(function (page) {
        if (page.type === 'video') return;
        addSphereSource(page.image, page.title, page.meta || category.title, page.preview);
      });
    });

    var baseTiles = sphereSources.map(function (source, index) {
      var fig = document.createElement('figure');
      fig.className = 'sphere-tile';
      fig.dataset.sliceIndex = index;
      fig.dataset.label = source.label;
      var img = document.createElement('img');
      img.src = source.preview;
      img.alt = source.label;
      var cap = document.createElement('figcaption');
      cap.textContent = source.label;
      fig.append(img, cap);
      return fig;
    });

    function seededShuffle(values, seed) {
      var result = values.slice();
      var state = seed * 9301 + 49297;
      for (var i = result.length - 1; i > 0; i--) {
        state = (state * 9301 + 49297) % 233280;
        var j = Math.floor((state / 233280) * (i + 1));
        var temp = result[i];
        result[i] = result[j];
        result[j] = temp;
      }
      return result;
    }

    var sphereStage = sphereTrack.parentElement;
    var rotX = -4;
    var rotY = 0;
    var velocity = 0;
    var dragging = false;
    var hovering = false;
    var moved = 0;
    var suppressClick = false;
    var lastX = 0;
    var lastY = 0;
    var lastFrame = performance.now();

    function renderSphereRotation() {
      sphereTrack.style.transform = 'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
    }

    function buildSphere() {
      var mobile = window.innerWidth < 640;
      var tablet = window.innerWidth < 980;
      var rows = mobile ? 4 : 5;
      var radius = mobile ? 360 : tablet ? 650 : 900;
      var tileW = mobile ? 92 : tablet ? 120 : 160;
      var tileH = Math.round(tileW * 0.58);
      var rowGap = mobile ? 66 : tablet ? 81 : 103;
      var targetCount = mobile ? 21 : tablet ? 30 : 32;
      var rowOffset = (rows - 1) / 2;
      sphereTrack.innerHTML = '';

      for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
        var row = document.createElement('div');
        row.className = 'sphere-row';
        row.setAttribute('aria-hidden', 'true');
        var step = 360 / targetCount;
        var phase = rowIndex % 2 === 1 ? step / 2 : 0;
        var rowY = (rowIndex - rowOffset) * rowGap;
        var rowRadius = radius * (1 - Math.abs(rowIndex - rowOffset) * 0.018);
        var rowOrder = seededShuffle(baseTiles.map(function (_, index) { return index; }), rowIndex + 11);

        for (var t = 0; t < targetCount; t++) {
          var source = baseTiles[rowOrder[t % rowOrder.length]];
          var clone = source.cloneNode(true);
          var finalWidth = tileW;
          clone.style.setProperty('--angle', (t * step + phase) + 'deg');
          clone.style.setProperty('--row-y', rowY + 'px');
          clone.style.setProperty('--radius', rowRadius + 'px');
          clone.style.setProperty('--tile-w', finalWidth + 'px');
          clone.style.setProperty('--tile-x', (-finalWidth / 2) + 'px');
          clone.style.setProperty('--tile-h', tileH + 'px');
          row.appendChild(clone);
        }
        sphereTrack.appendChild(row);
      }
      renderSphereRotation();
    }

    buildSphere();
    window.addEventListener('resize', buildSphere);

    function animateSphere(now) {
      var delta = Math.min(40, now - lastFrame);
      lastFrame = now;
      if (!dragging) {
        rotY -= (hovering ? 0.45 : 4.2) * delta / 1000;
        if (Math.abs(velocity) > 0.001) {
          rotY += velocity * delta / 16.67;
          velocity *= 0.94;
        }
        renderSphereRotation();
      }
      requestAnimationFrame(animateSphere);
    }
    requestAnimationFrame(animateSphere);

    sphereStage.addEventListener('pointerenter', function () { hovering = true; });
    sphereStage.addEventListener('pointerleave', function () { hovering = false; });
    sphereStage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      moved = 0;
      velocity = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      sphereStage.classList.add('dragging');
    });
    sphereStage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      if (e.pointerType === 'mouse' || Math.abs(dx) > Math.abs(dy)) e.preventDefault();
      rotY += dx * 0.28;
      rotX = Math.max(-34, Math.min(26, rotX - dy * 0.09));
      velocity = dx * 0.28;
      moved += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX;
      lastY = e.clientY;
      renderSphereRotation();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      sphereStage.classList.remove('dragging');
      suppressClick = moved > 8;
      setTimeout(function () { suppressClick = false; }, 0);
    }
    sphereStage.addEventListener('pointerup', endDrag);
    sphereStage.addEventListener('pointercancel', endDrag);

    sphereTrack.addEventListener('click', function (e) {
      var tile = e.target.closest('.sphere-tile');
      if (tile && !suppressClick) {
        openSliceLightbox(sphereSources, parseInt(tile.dataset.sliceIndex, 10));
      }
    });
  }

  var longformTrack = document.getElementById('longformTrack');
  var longformViewer = document.getElementById('longformViewer');
  var longformImage = document.getElementById('longformImage');
  var longformTitle = document.getElementById('longformTitle');
  var longformMeta = document.getElementById('longformMeta');

  function renderLongformGallery() {
    if (!longformTrack) return;
    longformTrack.innerHTML = longformItems.map(function (item, index) {
      var displayTitle = item.title || '运营长图';
      return '<article class="longform-card" role="button" tabindex="0" data-longform="' + item.id + '" aria-label="查看长图：' + displayTitle + '">' +
        '<img src="' + (item.preview || item.image) + '" alt="' + displayTitle + '" loading="lazy" decoding="async" />' +
        '<div class="lf-card-copy">' +
          '<h3>' + displayTitle + '</h3>' +
        '</div>' +
      '</article>';
    }).join('');

    longformTrack.querySelectorAll('.longform-card').forEach(function (card) {
      card.addEventListener('click', function () { openLongformViewer(card.dataset.longform); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLongformViewer(card.dataset.longform);
        }
      });
    });
  }

  function openLongformViewer(id) {
    var item = longformItems.find(function (entry) { return entry.id === id; });
    if (!item || !longformViewer) return;
    longformTitle.textContent = item.title || '运营长图';
    longformMeta.textContent = item.desc || '';
    longformImage.src = item.image;
    longformImage.alt = item.title;
    longformViewer.classList.add('open');
    longformViewer.setAttribute('aria-hidden', 'false');
    document.getElementById('longformScroll').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeLongformViewer() {
    if (!longformViewer) return;
    longformViewer.classList.remove('open');
    longformViewer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (longformViewer) {
    document.getElementById('longformClose').addEventListener('click', closeLongformViewer);
    longformViewer.addEventListener('click', function (e) {
      if (e.target === longformViewer) closeLongformViewer();
    });
    document.addEventListener('keydown', function (e) {
      if (longformViewer.classList.contains('open') && e.key === 'Escape') closeLongformViewer();
    });
  }
  renderLongformGallery();

  var workGroups = document.getElementById('workGroups');

  function categoryPages(category) {
    if (category.pages && category.pages.length) return category.pages;
    return allProjects.filter(function (project) {
      return project.cat === category.id;
    }).map(function (project) {
      return {
        image: projectImage(project),
        title: project.title,
        meta: project.client + ' · ' + project.year,
        desc: project.desc
      };
    });
  }

  function workCategoryCardTemplate(category) {
    var pages = categoryPages(category);
    var cover = pages[0];
    if (!pages.length || !cover) return '';
    var unit = pages.some(function (page) { return page.type === 'video'; }) ? 'MEDIA' : 'PAGES';
    var media = cover.type === 'video'
      ? '<video src="' + cover.image + '" muted autoplay loop playsinline preload="metadata"></video>'
      : '<img src="' + (cover.preview || cover.image) + '" alt="' + category.title + '" loading="lazy" />';
    return '<button class="work-category-card" type="button" data-category="' + category.id + '" aria-label="打开' + category.title + '作品演示">' +
      media +
      '<span class="wc-index">' + category.index + '</span>' +
      '<span class="wc-count">' + String(pages.length).padStart(2, '0') + ' ' + unit + '</span>' +
      '<div class="wc-copy"><h3>' + category.title + '</h3></div>' +
    '</button>';
  }

  function renderWorkGroups() {
    if (!workGroups) return;
    workGroups.innerHTML = allCategories.map(function (category) {
      return workCategoryCardTemplate(category);
    }).join('');

    workGroups.querySelectorAll('.work-category-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openCategoryViewer(card.dataset.category, 0);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCategoryViewer(card.dataset.category, 0);
        }
      });
    });
  }

  var categoryViewer = document.getElementById('categoryViewer');
  var cvTitle = document.getElementById('cvTitle');
  var cvKicker = document.getElementById('cvKicker');
  var cvDesc = document.getElementById('cvDesc');
  var cvMedia = document.getElementById('cvMedia');
  var cvPageTitle = document.getElementById('cvPageTitle');
  var cvPageMeta = document.getElementById('cvPageMeta');
  var cvPageDesc = document.getElementById('cvPageDesc');
  var cvCounter = document.getElementById('cvCounter');
  var cvStage = document.getElementById('cvStage');
  var cvPages = [];
  var cvIndex = 0;
  var cvPointerStart = null;
  var cvWheelLock = 0;

  function renderCategoryPage() {
    var page = cvPages[cvIndex];
    if (!page) return;
    cvMedia.classList.add('switching');
    cvMedia.replaceChildren();
    if (page.type === 'video') {
      var video = document.createElement('video');
      video.src = page.image;
      video.controls = true;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-label', page.title);
      cvMedia.appendChild(video);
    } else {
      var image = document.createElement('img');
      image.src = page.image;
      image.alt = page.title;
      cvMedia.appendChild(image);
    }
    cvPageTitle.textContent = page.title;
    cvPageMeta.textContent = '';
    cvPageDesc.textContent = page.desc || '';
    cvCounter.textContent = String(cvIndex + 1).padStart(2, '0') + ' / ' + String(cvPages.length).padStart(2, '0');
    setTimeout(function () { cvMedia.classList.remove('switching'); }, 140);
  }

  function openCategoryViewer(categoryId, startIndex) {
    var category = allCategories.find(function (item) { return item.id === categoryId; });
    if (!category) return;
    cvPages = categoryPages(category);
    if (!cvPages.length) return;
    cvIndex = Number.isInteger(startIndex) ? Math.max(0, Math.min(startIndex, cvPages.length - 1)) : 0;
    cvKicker.textContent = category.en;
    cvTitle.textContent = category.title;
    cvDesc.textContent = category.desc;
    renderCategoryPage();
    categoryViewer.classList.add('open');
    categoryViewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCategoryViewer() {
    categoryViewer.classList.remove('open');
    categoryViewer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function moveCategoryPage(step) {
    if (!cvPages.length) return;
    cvIndex = (cvIndex + step + cvPages.length) % cvPages.length;
    renderCategoryPage();
  }

  if (categoryViewer) {
    document.getElementById('cvClose').addEventListener('click', closeCategoryViewer);
    document.getElementById('cvPrev').addEventListener('click', function () { moveCategoryPage(-1); });
    document.getElementById('cvNext').addEventListener('click', function () { moveCategoryPage(1); });
    categoryViewer.addEventListener('click', function (e) {
      if (e.target === categoryViewer) closeCategoryViewer();
    });

    cvStage.addEventListener('pointerdown', function (e) {
      cvPointerStart = { x: e.clientX, y: e.clientY };
    });
    cvStage.addEventListener('pointerup', function (e) {
      if (!cvPointerStart) return;
      var dx = e.clientX - cvPointerStart.x;
      var dy = e.clientY - cvPointerStart.y;
      cvPointerStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 48) return;
      if (Math.abs(dx) > Math.abs(dy)) moveCategoryPage(dx < 0 ? 1 : -1);
      else moveCategoryPage(dy < 0 ? 1 : -1);
    });
    cvStage.addEventListener('pointercancel', function () { cvPointerStart = null; });
    cvStage.addEventListener('wheel', function (e) {
      if (Math.max(Math.abs(e.deltaX), Math.abs(e.deltaY)) < 18) return;
      e.preventDefault();
      if (Date.now() < cvWheelLock) return;
      cvWheelLock = Date.now() + 360;
      moveCategoryPage((e.deltaY || e.deltaX) > 0 ? 1 : -1);
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
      if (!categoryViewer.classList.contains('open')) return;
      if (e.key === 'Escape') closeCategoryViewer();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        moveCategoryPage(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        moveCategoryPage(-1);
      }
    });
  }

  var pd = document.getElementById('projectDetail');
  var pdTitle = document.getElementById('pdTitle');
  var pdClient = document.getElementById('pdClient');
  var pdDesc = document.getElementById('pdDesc');
  var pdTags = document.getElementById('pdTags');
  var pdMain = document.getElementById('pdMain');
  var pdCounter = document.getElementById('pdCounter');
  var currentIndex = 0;

  function renderDetail(project) {
    pdTags.innerHTML = project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('');
    pdTitle.textContent = project.title;
    pdClient.textContent = project.client + ' — ' + project.year;
    pdDesc.textContent = project.desc || '';
    pdMain.innerHTML = '<img src="' + projectImage(project) + '" alt="' + project.title + '" />';
    pdCounter.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(allProjects.length).padStart(2, '0');
  }

  function openProject(id) {
    var index = allProjects.findIndex(function (project) { return project.id === id; });
    if (index < 0) return;
    currentIndex = index;
    renderDetail(allProjects[currentIndex]);
    pd.classList.add('open');
    pd.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    if (!pd) return;
    pd.classList.remove('open');
    pd.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function moveDetail(step) {
    if (!allProjects.length) return;
    currentIndex = (currentIndex + step + allProjects.length) % allProjects.length;
    renderDetail(allProjects[currentIndex]);
  }

  if (pd) {
    document.getElementById('pdClose').addEventListener('click', closeDetail);
    pd.addEventListener('click', function (e) {
      if (e.target === pd) closeDetail();
    });
    document.querySelector('.pd-prev').addEventListener('click', function () { moveDetail(-1); });
    document.querySelector('.pd-next').addEventListener('click', function () { moveDetail(1); });
    document.addEventListener('keydown', function (e) {
      if (!pd.classList.contains('open')) return;
      if (e.key === 'Escape') closeDetail();
      if (e.key === 'ArrowRight') moveDetail(1);
      if (e.key === 'ArrowLeft') moveDetail(-1);
    });
  }

  renderWorkGroups();

  function bindMagnetic(selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (matchMedia('(pointer:coarse)').matches) return;
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.transform = 'translate(' +
          ((e.clientX - rect.left - rect.width / 2) * 0.035) + 'px,' +
          ((e.clientY - rect.top - rect.height / 2) * 0.035) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }
  bindMagnetic('.btn, .contact-pill, .project-card');

  var sections = ['top', 'about', 'work', 'sphere', 'contact'].map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);
  var navLinks = document.querySelectorAll('.nav a');
  window.addEventListener('scroll', function () {
    var current = '';
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.4) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  var progress = document.createElement('div');
  progress.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--text);width:0;z-index:9999;transition:width .1s linear;';
  document.body.appendChild(progress);
  window.addEventListener('scroll', function () {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (total > 0 ? window.scrollY / total * 100 : 0) + '%';
  }, { passive: true });
})();
