    // Loaded model data, kept around so Save/Publish can serialize the
    // current DOM state (rates/tours) or pass through untouched data
    // (posts, which now has a full edit form).
    let loadedRates = null;
    let loadedTours = null;
    let loadedPosts = null;
    let loadedGallery = null;
    let loadedServices = null;

    // Every stored value (titles, blurbs, etc.) gets interpolated into
    // innerHTML strings below. Without escaping, a literal " in content
    // (e.g. a post titled `What is "The good stuff"?`) closes the HTML
    // attribute early and truncates/corrupts the rendered form.
    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
        e.target.classList.add('active');
        const tabId = e.target.dataset.tab;
        const pane = document.getElementById('tab-' + tabId);
        if (pane) {
          pane.classList.add('active');
          pane.style.display = 'block';
          // Load dynamic content for tabs that need it
          if (tabId === 'rates' && document.getElementById('rates-loading')) loadRates();
          if (tabId === 'tours' && document.getElementById('tours-loading')) loadTours();
          if (tabId === 'posts' && document.getElementById('posts-loading')) loadPosts();
          if (tabId === 'gallery' && document.getElementById('gallery-loading')) loadGallery();
          if (tabId === 'services' && document.getElementById('services-loading')) loadServices();
        }
      });
    });

    async function loadRates() {
      const container = document.getElementById('rates-loading');
      if (!container || container.dataset.loaded) return;
      container.innerHTML = '<p>Loading rates...</p>';
      try {
        const res = await fetch('/api/admin?model=rates');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        loadedRates = data;
        container.innerHTML = '';
        container.dataset.loaded = 'true';
        // Render editable rates tables
        renderRatesTable(container, data.local, 'local', 'Local Rates');
        renderRatesTable(container, data.touring, 'touring', 'Touring Rates');
        renderRatesTable(container, data.addons, 'addons', 'Add-Ons');
      } catch (err) {
        container.innerHTML = '<p style="color:var(--error);">Failed to load rates: ' + err.message + '</p>';
      }
    }

    async function loadTours() {
      const container = document.getElementById('tours-loading');
      if (!container || container.dataset.loaded) return;
      container.innerHTML = '<p>Loading tours...</p>';
      try {
        const res = await fetch('/api/admin?model=tours');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        loadedTours = data;
        container.innerHTML = '';
        container.dataset.loaded = 'true';
        renderToursList(container, data);
      } catch (err) {
        container.innerHTML = '<p style="color:var(--error);">Failed to load tours: ' + err.message + '</p>';
      }
    }

    async function loadPosts() {
      const container = document.getElementById('posts-loading');
      if (!container || container.dataset.loaded) return;
      container.innerHTML = '<p>Loading posts...</p>';
      try {
        const res = await fetch('/api/admin?model=posts');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        loadedPosts = data;
        container.innerHTML = '';
        container.dataset.loaded = 'true';
        renderPostsList(container, data.posts, data.categories);
      } catch (err) {
        container.innerHTML = '<p style="color:var(--error);">Failed to load posts: ' + err.message + '</p>';
      }
    }

    async function loadGallery() {
      const container = document.getElementById('gallery-loading');
      if (!container || container.dataset.loaded) return;
      container.innerHTML = '<p>Loading gallery...</p>';
      try {
        const res = await fetch('/api/admin?model=gallery');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        loadedGallery = data;
        container.innerHTML = '';
        container.dataset.loaded = 'true';
        renderGalleryList(container, data);
      } catch (err) {
        container.innerHTML = '<p style="color:var(--error);">Failed to load gallery: ' + err.message + '</p>';
      }
    }

    function renderRatesTable(container, items, kind, title) {
      const section = document.createElement('div');
      section.style.marginBottom = '2rem;';
      section.innerHTML = '<h3 style="margin-bottom:1rem;">' + title + '</h3>';
      const table = document.createElement('div');
      table.style.display = 'grid';
      table.style.gap = '0.75rem';
      table.dataset.kind = kind;
      items.forEach(([name, price], idx) => {
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '3fr 1fr auto';
        row.style.gap = '0.5rem';
        row.innerHTML =
          '<input name="rates.' + kind + '.' + idx + '.name" value="' + escapeHtml(name) + '" placeholder="Name" />' +
          '<input name="rates.' + kind + '.' + idx + '.price" value="' + escapeHtml(price) + '" placeholder="$" />' +
          '<button type="button" class="btn-remove" style="padding:0.4rem 0.8rem; font-size:0.85rem;">&times;</button>';
        table.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn';
      addBtn.textContent = '+ Add Row';
      addBtn.style.marginTop = '0.75rem';
      addBtn.addEventListener('click', () => {
        const newIdx = table.children.length;
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '3fr 1fr auto';
        row.style.gap = '0.5rem';
        row.innerHTML =
          '<input name="rates.' + kind + '.' + newIdx + '.name" placeholder="Name" />' +
          '<input name="rates.' + kind + '.' + newIdx + '.price" placeholder="$" />' +
          '<button type="button" class="btn-remove" style="padding:0.4rem 0.8rem; font-size:0.85rem;">&times;</button>';
        table.appendChild(row);
        row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
      });
      section.appendChild(table);
      section.appendChild(addBtn);
      container.appendChild(section);
      // Wire remove buttons
      table.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => btn.parentElement.remove());
      });
    }

    function renderGalleryList(container, items) {
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
      grid.style.gap = '1rem';
      grid.setAttribute('data-gallery-container', 'true');

      function addPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.style.position = 'relative';
        card.style.border = '1px solid var(--grey-line)';
        card.style.borderRadius = '4px';
        card.style.overflow = 'hidden';
        card.innerHTML =
          '<img class="gallery-thumb" src="' + escapeHtml(photo.img || '') + '" alt="" style="width:100%; aspect-ratio:9/16; object-fit:cover; display:block; ' + (photo.img ? '' : 'background:#eee;') + '" />' +
          '<button type="button" class="gallery-remove" title="Delete photo" style="position:absolute; top:0.35rem; right:0.35rem; width:1.75rem; height:1.75rem; border-radius:50%; border:none; background:rgba(0,0,0,0.65); color:#fff; cursor:pointer; font-size:1rem; line-height:1;">&times;</button>' +
          '<input type="text" class="gallery-alt-input" value="' + escapeHtml(photo.alt || '') + '" placeholder="Alt text" style="width:100%; box-sizing:border-box; border:none; border-top:1px solid var(--grey-line); padding:0.35rem; font-size:0.75rem;" />' +
          '<input type="hidden" class="gallery-img-input" value="' + escapeHtml(photo.img || '') + '" />';
        card.querySelector('.gallery-remove').addEventListener('click', () => card.remove());
        grid.appendChild(card);
        return card;
      }

      items.forEach((photo) => addPhotoCard(photo));
      container.appendChild(grid);

      // Upload: pick one or more photos, each becomes a new card (data URL
      // now, converted to a real /images/gallery/*.jpg file by the publish
      // pipeline).
      const uploadWrap = document.createElement('div');
      uploadWrap.style.marginTop = '1.25rem';
      uploadWrap.innerHTML =
        '<label style="display:block; font-size:0.85rem; color:var(--ink-soft); margin-bottom:0.4rem;">Add photo(s)</label>' +
        '<input type="file" accept="image/*" multiple class="gallery-upload-input" />';
      const uploadInput = uploadWrap.querySelector('.gallery-upload-input');
      uploadInput.addEventListener('change', (e) => {
        const files = [...(e.target.files || [])];
        files.forEach((file) => {
          const card = addPhotoCard({ img: '', alt: '' });
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result;
            if (typeof dataUrl === 'string') {
              card.querySelector('.gallery-img-input').value = dataUrl;
              card.querySelector('.gallery-thumb').src = dataUrl;
              card.querySelector('.gallery-thumb').style.background = '';
            }
          };
          reader.readAsDataURL(file);
        });
        uploadInput.value = '';
      });
      container.appendChild(uploadWrap);
    }

    function renderToursList(container, items) {
      const list = document.createElement('div');
      list.style.display = 'grid';
      list.style.gap = '1.25rem';
      items.forEach((tour, idx) => {
        const card = document.createElement('div');
        card.style.border = '1px solid var(--grey-line)';
        card.style.padding = '1.25rem';
        card.style.borderRadius = '4px';
        card.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">' +
            '<h4 style="margin:0;">' + escapeHtml(tour.city) + '</h4>' +
            '<button type="button" class="btn-remove" style="padding:0.3rem 0.6rem; font-size:0.85rem;">&times;</button>' +
          '</div>' +
          '<div style="display:grid; gap:0.75rem;">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Dates</label>' +
              '<input name="tours.' + idx + '.dates" value="' + escapeHtml(tour.dates) + '" />' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Blurb</label>' +
              '<textarea name="tours.' + idx + '.blurb" rows="2">' + escapeHtml(tour.blurb) + '</textarea>' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Status</label>' +
              '<select name="tours.' + idx + '.status">' +
                '<option value="upcoming" ' + (tour.status === 'upcoming' ? 'selected' : '') + '>Upcoming</option>' +
                '<option value="past" ' + (tour.status === 'past' ? 'selected' : '') + '>Past</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">City</label>' +
              '<input name="tours.' + idx + '.city" value="' + escapeHtml(tour.city) + '" />' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo</label>' +
              '<input type="file" class="tour-photo-input" accept="image/*" />' +
              '<input type="hidden" name="tours.' + idx + '.img" value="' + escapeHtml(tour.img || '') + '" />' +
              (tour.img ? '<img src="' + escapeHtml(tour.img) + '" alt="Tour photo" class="tour-preview" />' : '') +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo Alt Text</label>' +
              '<input name="tours.' + idx + '.imgAlt" value="' + escapeHtml(tour.imgAlt || '') + '" placeholder="Describe the photo" />' +
            '</div>' +
          '</div>';
        card.querySelector('.btn-remove').addEventListener('click', () => card.remove());
        // Wire photo upload: read file, convert to data URL, store in hidden input, show preview
        const photoInput = card.querySelector('.tour-photo-input');
        const hiddenImgInput = card.querySelector('input[name="tours.' + idx + '.img"]');
        let previewImg = card.querySelector('img.tour-preview');
        photoInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result;
            if (typeof dataUrl === 'string') {
              hiddenImgInput.value = dataUrl;
              if (!previewImg) {
                previewImg = document.createElement('img');
                previewImg.className = 'tour-preview';
                previewImg.alt = 'Tour photo';
                photoInput.parentElement.appendChild(previewImg);
              }
              previewImg.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
        });
        list.appendChild(card);
      });
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn';
      addBtn.textContent = '+ Add Tour';
      addBtn.style.marginTop = '0.75rem';
      addBtn.addEventListener('click', () => {
        const newIdx = list.children.length;
        const card = document.createElement('div');
        card.style.border = '1px solid var(--grey-line)';
        card.style.padding = '1.25rem';
        card.style.borderRadius = '4px';
        card.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">' +
            '<h4 style="margin:0;">New Tour</h4>' +
            '<button type="button" class="btn-remove" style="padding:0.3rem 0.6rem; font-size:0.85rem;">&times;</button>' +
          '</div>' +
          '<div style="display:grid; gap:0.75rem;">' +
            '<div><label style="font-size:0.8rem; color:var(--ink-soft);">City</label><input name="tours.' + newIdx + '.city" /></div>' +
            '<div><label style="font-size:0.8rem; color:var(--ink-soft);">Dates</label><input name="tours.' + newIdx + '.dates" /></div>' +
            '<div><label style="font-size:0.8rem; color:var(--ink-soft);">Blurb</label><textarea name="tours.' + newIdx + '.blurb" rows="2"></textarea></div>' +
            '<div><label style="font-size:0.8rem; color:var(--ink-soft);">Status</label><select name="tours.' + newIdx + '.status"><option value="upcoming">Upcoming</option><option value="past">Past</option></select></div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo</label>' +
              '<input type="file" class="tour-photo-input" accept="image/*" />' +
              '<input type="hidden" name="tours.' + newIdx + '.img" value="" />' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo Alt Text</label>' +
              '<input name="tours.' + newIdx + '.imgAlt" />' +
            '</div>' +
          '</div>';
        card.querySelector('.btn-remove').addEventListener('click', () => card.remove());
        // Wire photo upload for new tour
        const photoInput = card.querySelector('.tour-photo-input');
        const hiddenImgInput = card.querySelector('input[name="tours.' + newIdx + '.img"]');
        let previewImg = null;
        photoInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result;
            if (typeof dataUrl === 'string') {
              hiddenImgInput.value = dataUrl;
              if (!previewImg) {
                previewImg = document.createElement('img');
                previewImg.className = 'tour-preview';
                previewImg.alt = 'Tour photo';
                photoInput.parentElement.appendChild(previewImg);
              }
              previewImg.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
        });
        list.appendChild(card);
      });
      container.appendChild(list);
      container.appendChild(addBtn);
    }
    function slugify(title) {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    function renderPostsList(container, items, categories) {
      const list = document.createElement('div');
      list.style.display = 'grid';
      list.style.gap = '1.5rem';
      list.setAttribute('data-posts-container', 'true');

      // Render existing posts with edit toggle
      items.forEach((post, idx) => {
        const card = document.createElement('div');
        card.style.border = '1px solid var(--grey-line)';
        card.style.padding = '1.25rem';
        card.style.borderRadius = '4px';
        
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'post-summary';
        summaryDiv.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">' +
            '<div>' +
              '<strong class="post-title-display" style="font-size:1.1rem;">' + escapeHtml(post.title) + '</strong>' +
              '<div class="post-meta" style="font-size:0.8rem; color:var(--ink-soft); margin-top:0.25rem;">' +
                escapeHtml(post.date) + ' &middot; ' + escapeHtml(categories[post.category] || post.category) +
              '</div>' +
            '</div>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<button type="button" class="post-edit-btn btn" style="font-size:0.85rem;">Edit</button>' +
              '<button type="button" class="btn-remove" style="font-size:0.85rem;">&times;</button>' +
            '</div>' +
          '</div>';
        
        const formDiv = document.createElement('div');
        formDiv.className = 'post-form';
        formDiv.style.display = 'none';
        formDiv.innerHTML =
          '<div class="post-form-row two-col">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Title</label>' +
              '<input class="post-title-input" value="' + escapeHtml(post.title) + '" placeholder="Post title" />' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Slug</label>' +
              '<input class="post-slug-input" value="' + escapeHtml(post.slug) + '" placeholder="post-slug" />' +
            '</div>' +
          '</div>' +
          '<div class="post-form-row two-col">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Date (YYYY-MM-DD)</label>' +
              '<input type="date" class="post-date-input" value="' + escapeHtml(post.date) + '" />' +
            '</div>' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Category</label>' +
              '<select class="post-category-input">' +
                Object.entries(categories).map(([slug, label]) =>
                  '<option value="' + escapeHtml(slug) + '" ' + (post.category === slug ? 'selected' : '') + '>' + escapeHtml(label) + '</option>'
                ).join('') +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="post-form-row">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Answer / Summary</label>' +
              '<input class="post-answer-input" value="' + escapeHtml(post.answer || '') + '" placeholder="Short summary" />' +
            '</div>' +
          '</div>' +
          '<div class="post-form-row">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Body (one paragraph per line)</label>' +
              '<textarea class="post-body-input" rows="6" placeholder="Paragraph 1&#10;Paragraph 2&#10;Paragraph 3">' + escapeHtml((post.body || []).join('\n')) + '</textarea>' +
            '</div>' +
          '</div>' +
          '<div class="post-form-row">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo</label>' +
              '<input type="file" class="post-photo-input" accept="image/*" />' +
              '<input type="hidden" class="post-img-input" value="' + escapeHtml(post.img || '') + '" />' +
              (post.img ? '<img src="' + escapeHtml(post.img) + '" alt="Post photo" class="post-preview" />' : '') +
            '</div>' +
          '</div>' +
          '<div class="post-form-row">' +
            '<div>' +
              '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo Alt Text</label>' +
              '<input class="post-imgalt-input" value="' + escapeHtml(post.imgAlt || '') + '" placeholder="Describe the photo" />' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:0.5rem; margin-top:1rem;">' +
            '<button type="button" class="post-save-btn btn btn-pink" style="font-size:0.85rem;">Save</button>' +
            '<button type="button" class="post-cancel-btn btn" style="font-size:0.85rem;">Cancel</button>' +
          '</div>';
        
        card.appendChild(summaryDiv);
        card.appendChild(formDiv);
        
        // Wire up edit toggle
        summaryDiv.querySelector('.post-edit-btn').addEventListener('click', () => {
          summaryDiv.style.display = 'none';
          formDiv.style.display = 'block';
        });
        
        formDiv.querySelector('.post-cancel-btn').addEventListener('click', () => {
          formDiv.style.display = 'none';
          summaryDiv.style.display = 'block';
        });

        formDiv.querySelector('.post-save-btn').addEventListener('click', () => {
          // Refresh the summary row from the form's current values and collapse
          // back to summary view. The actual data is always re-read live from
          // the DOM by serializePosts() when the page-level Save/Publish button
          // is clicked — this just gives visible confirmation the edit "took".
          const t = formDiv.querySelector('.post-title-input');
          const d = formDiv.querySelector('.post-date-input');
          const c = formDiv.querySelector('.post-category-input');
          const titleEl = summaryDiv.querySelector('.post-title-display');
          const metaEl = summaryDiv.querySelector('.post-meta');
          if (titleEl && t) titleEl.textContent = t.value || '(untitled)';
          if (metaEl && d && c) {
            const catLabel = categories[c.value] || c.value;
            metaEl.innerHTML = (d.value || '') + ' &middot; ' + catLabel;
          }
          formDiv.style.display = 'none';
          summaryDiv.style.display = 'block';
        });

        summaryDiv.querySelector('.btn-remove').addEventListener('click', () => card.remove());

        // Wire photo upload for existing post
        const photoInput = formDiv.querySelector('.post-photo-input');
        const hiddenImgInput = formDiv.querySelector('.post-img-input');
        let previewImg = formDiv.querySelector('img.post-preview');
        photoInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result;
            if (typeof dataUrl === 'string') {
              hiddenImgInput.value = dataUrl;
              if (!previewImg) {
                previewImg = document.createElement('img');
                previewImg.className = 'post-preview';
                previewImg.alt = 'Post photo';
                photoInput.parentElement.appendChild(previewImg);
              }
              previewImg.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
        });
        
        // Wire title → slug auto-update (slug still editable)
        const titleInput = formDiv.querySelector('.post-title-input');
        const slugInput = formDiv.querySelector('.post-slug-input');
        titleInput.addEventListener('blur', () => {
          if (!slugInput.value) {
            slugInput.value = slugify(titleInput.value);
          }
        });
        
        list.appendChild(card);
      });

      // Add "New Post" button
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn btn-pink';
      addBtn.textContent = '+ New Post';
      addBtn.style.marginBottom = '1.5rem';
      addBtn.addEventListener('click', () => {
        const newIdx = items.length + list.querySelectorAll('.post-form').length; // Estimate index
        const newCard = document.createElement('div');
        newCard.style.border = '1px solid var(--grey-line)';
        newCard.style.padding = '1.25rem';
        newCard.style.borderRadius = '4px';
        newCard.innerHTML =
          '<div class="post-form" style="display: block;">' +
            '<h4 style="margin:0 0 1rem 0;">New Post</h4>' +
            '<div class="post-form-row two-col">' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Title</label>' +
                '<input class="post-title-input" placeholder="Post title" />' +
              '</div>' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Slug</label>' +
                '<input class="post-slug-input" placeholder="post-slug" />' +
              '</div>' +
            '</div>' +
            '<div class="post-form-row two-col">' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Date (YYYY-MM-DD)</label>' +
                '<input type="date" class="post-date-input" />' +
              '</div>' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Category</label>' +
                '<select class="post-category-input">' +
                  Object.entries(categories).map(([slug, label]) =>
                    '<option value="' + escapeHtml(slug) + '">' + escapeHtml(label) + '</option>'
                  ).join('') +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="post-form-row">' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Answer / Summary</label>' +
                '<input class="post-answer-input" placeholder="Short summary" />' +
              '</div>' +
            '</div>' +
            '<div class="post-form-row">' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Body (one paragraph per line)</label>' +
                '<textarea class="post-body-input" rows="6" placeholder="Paragraph 1&#10;Paragraph 2&#10;Paragraph 3"></textarea>' +
              '</div>' +
            '</div>' +
            '<div class="post-form-row">' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo</label>' +
                '<input type="file" class="post-photo-input" accept="image/*" />' +
                '<input type="hidden" class="post-img-input" value="" />' +
              '</div>' +
            '</div>' +
            '<div class="post-form-row">' +
              '<div>' +
                '<label style="font-size:0.8rem; color:var(--ink-soft);">Photo Alt Text</label>' +
                '<input class="post-imgalt-input" placeholder="Describe the photo" />' +
              '</div>' +
            '</div>' +
            '<div style="display:flex; gap:0.5rem; margin-top:1rem;">' +
              '<button type="button" class="post-save-btn btn btn-pink" style="font-size:0.85rem;">Save</button>' +
              '<button type="button" class="post-cancel-btn btn" style="font-size:0.85rem;">Cancel</button>' +
            '</div>' +
          '</div>';
        
        // Wire photo upload for new post
        const photoInput = newCard.querySelector('.post-photo-input');
        const hiddenImgInput = newCard.querySelector('.post-img-input');
        let previewImg = null;
        photoInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result;
            if (typeof dataUrl === 'string') {
              hiddenImgInput.value = dataUrl;
              if (!previewImg) {
                previewImg = document.createElement('img');
                previewImg.className = 'post-preview';
                previewImg.alt = 'Post photo';
                photoInput.parentElement.appendChild(previewImg);
              }
              previewImg.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
        });
        
        // Wire title → slug
        const titleInput = newCard.querySelector('.post-title-input');
        const slugInput = newCard.querySelector('.post-slug-input');
        titleInput.addEventListener('blur', () => {
          if (!slugInput.value) {
            slugInput.value = slugify(titleInput.value);
          }
        });
        
        // Wire cancel button to remove new post card
        newCard.querySelector('.post-cancel-btn').addEventListener('click', () => {
          newCard.remove();
        });

        // New posts have no summary view to collapse to (they're not saved
        // to the server yet — that only happens via the page-level Save /
        // Save & Publish button, which reads live DOM via serializePosts()).
        // Give visible confirmation so this doesn't look like a dead button.
        const newSaveBtn = newCard.querySelector('.post-save-btn');
        newSaveBtn.addEventListener('click', () => {
          const original = newSaveBtn.textContent;
          newSaveBtn.textContent = 'Added ✓ (click page Save below to publish)';
          newSaveBtn.disabled = true;
          setTimeout(() => {
            newSaveBtn.textContent = original;
            newSaveBtn.disabled = false;
          }, 2000);
        });

        list.insertBefore(newCard, list.firstChild);
      });

      container.appendChild(addBtn);
      container.appendChild(list);
    }

    // Save / Publish

    // Set obj.a.b.c = value given a dotted path like "a.b.c".
    function setPath(obj, path, value) {
      const parts = path.split('.');
      let cur = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!(key in cur) || typeof cur[key] !== 'object' || cur[key] === null) {
          cur[key] = {};
        }
        cur = cur[key];
      }
      cur[parts[parts.length - 1]] = value;
    }

    // Site tab -> nested object matching src/data/site.json shape.
    async function loadServices() {
      const container = document.getElementById('services-loading');
      if (!container || container.dataset.loaded) return;
      container.innerHTML = '<p>Loading services...</p>';
      try {
        const res = await fetch('/api/admin?model=services');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        loadedServices = data;
        container.innerHTML = '';
        container.dataset.loaded = 'true';
        renderServicesList(container, Array.isArray(data) ? data : []);
      } catch (err) {
        container.innerHTML = '<p style="color:var(--error);">Failed to load services: ' + err.message + '</p>';
      }
    }

    function makeServiceRow(list, value) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '0.5rem';
      row.style.marginBottom = '0.6rem';
      row.innerHTML =
        '<input class="service-input" style="flex:1;" value="' + escapeHtml(value) + '" placeholder="Service name" />' +
        '<button type="button" class="btn-remove" style="padding:0.3rem 0.7rem; font-size:0.9rem;">&times;</button>';
      row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
      list.appendChild(row);
    }

    function renderServicesList(container, items) {
      const list = document.createElement('div');
      list.setAttribute('data-services-container', 'true');
      items.forEach((s) => makeServiceRow(list, s));
      container.appendChild(list);
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn';
      addBtn.textContent = '+ Add Service';
      addBtn.style.marginTop = '0.75rem';
      addBtn.addEventListener('click', () => makeServiceRow(list, ''));
      container.appendChild(addBtn);
    }

    function serializeServices() {
      const container = document.querySelector('[data-services-container]');
      if (!container) return null;
      const out = [];
      container.querySelectorAll('.service-input').forEach((inp) => {
        const v = inp.value.trim();
        if (v) out.push(v);
      });
      return out;
    }

    function serializeSite() {
      const formEl = document.getElementById('form-site');
      if (!formEl) return null;
      const formData = new FormData(formEl);
      const out = {};
      for (const [key, value] of formData.entries()) {
        setPath(out, key, value);
      }
      return out;
    }

    // Rates tab -> { wishlistUrl, wishlistLabel, local, touring, addons }.
    // wishlistUrl/wishlistLabel aren't editable in the current UI, so we
    // carry them through unchanged from whatever was last loaded.
    function serializeRates() {
      const container = document.getElementById('rates-loading');
      if (!container || !container.dataset.loaded) return null;
      const out = {
        wishlistUrl: (loadedRates && loadedRates.wishlistUrl) || '',
        wishlistLabel: (loadedRates && loadedRates.wishlistLabel) || '',
      };
      for (const kind of ['local', 'touring', 'addons']) {
        const table = container.querySelector(`[data-kind="${kind}"]`);
        const rows = [];
        if (table) {
          table.querySelectorAll(':scope > div').forEach(row => {
            const nameInput = row.querySelector(`input[name^="rates.${kind}."][name$=".name"]`);
            const priceInput = row.querySelector(`input[name^="rates.${kind}."][name$=".price"]`);
            const name = nameInput ? nameInput.value.trim() : '';
            const price = priceInput ? priceInput.value.trim() : '';
            if (name || price) rows.push([name, price]);
          });
        }
        out[kind] = rows;
      }
      return out;
    }

    // Tours tab -> array of { city, dates, blurb, status, img?, imgAlt? }.
    function serializeTours() {
      const container = document.getElementById('tours-loading');
      const tours = [];
      if (!container || !container.dataset.loaded) return null;
      container.querySelectorAll('input[name$=".city"]').forEach(cityInput => {
        const m = cityInput.name.match(/^tours\.(\d+)\.city$/);
        if (!m) return;
        const idx = m[1];
        const fieldset = cityInput.closest('div').parentElement;
        const dates = fieldset.querySelector(`[name="tours.${idx}.dates"]`);
        const blurb = fieldset.querySelector(`[name="tours.${idx}.blurb"]`);
        const status = fieldset.querySelector(`[name="tours.${idx}.status"]`);
        const img = fieldset.querySelector(`[name="tours.${idx}.img"]`);
        const imgAlt = fieldset.querySelector(`[name="tours.${idx}.imgAlt"]`);
        const tour = {
          city: cityInput.value.trim(),
          dates: dates ? dates.value.trim() : '',
          blurb: blurb ? blurb.value.trim() : '',
          status: status ? status.value : 'upcoming',
        };
        if (img && img.value) tour.img = img.value;
        if (imgAlt && imgAlt.value) tour.imgAlt = imgAlt.value;
        tours.push(tour);
      });
      return tours;
    }

    // Posts tab -> { posts: [...], categories }.
    // Walk the DOM for each post form and extract fields.
    function serializePosts() {
      const container = document.getElementById('posts-loading');
      if (!container || !container.dataset.loaded || !loadedPosts) return null;
      
      const posts = [];
      container.querySelectorAll('[data-posts-container] > div').forEach((card) => {
        const form = card.querySelector('.post-form');
        if (!form) return;
        
        const titleInput = form.querySelector('.post-title-input');
        const slugInput = form.querySelector('.post-slug-input');
        const dateInput = form.querySelector('.post-date-input');
        const categoryInput = form.querySelector('.post-category-input');
        const answerInput = form.querySelector('.post-answer-input');
        const bodyInput = form.querySelector('.post-body-input');
        const imgInput = form.querySelector('.post-img-input');
        const imgAltInput = form.querySelector('.post-imgalt-input');
        
        const title = titleInput ? titleInput.value.trim() : '';
        let slug = slugInput ? slugInput.value.trim() : '';
        if (!slug && title) slug = slugify(title);
        const date = dateInput ? dateInput.value.trim() : '';
        const category = categoryInput ? categoryInput.value : '';
        const answer = answerInput ? answerInput.value.trim() : '';
        const bodyText = bodyInput ? bodyInput.value.trim() : '';
        const img = imgInput ? imgInput.value : '';
        const imgAlt = imgAltInput ? imgAltInput.value.trim() : '';
        
        // Parse body: one paragraph per line (split on newline, filter empty)
        const body = bodyText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (title) { // Only include posts with a title
          const post = {
            title,
            slug,
            date,
            category,
            answer,
            body,
          };
          if (img) post.img = img;
          if (imgAlt) post.imgAlt = imgAlt;
          posts.push(post);
        }
      });

      // Guard against duplicate/blank slugs -- the [slug].astro route breaks
      // (silent collision) if two posts share one.
      const seenSlugs = {};
      posts.forEach((post) => {
        let base = post.slug || 'post';
        let candidate = base;
        let n = 2;
        while (seenSlugs[candidate]) {
          candidate = base + '-' + n;
          n++;
        }
        seenSlugs[candidate] = true;
        post.slug = candidate;
      });

      return {
        posts,
        categories: loadedPosts.categories || {},
      };
    }

    // Gallery tab -> array of { img, alt }, in the order the cards appear
    // (i.e. respects photos deleted or newly added in this session).
    function serializeGallery() {
      const container = document.getElementById('gallery-loading');
      if (!container || !container.dataset.loaded) return null;
      const photos = [];
      container.querySelectorAll('[data-gallery-container] > .gallery-card').forEach((card) => {
        const imgInput = card.querySelector('.gallery-img-input');
        const altInput = card.querySelector('.gallery-alt-input');
        const img = imgInput ? imgInput.value.trim() : '';
        const alt = altInput ? altInput.value.trim() : '';
        if (img) photos.push({ img, alt });
      });
      return photos;
    }

    function buildPayload() {
      const data = {};
      const site = serializeSite();
      if (site) data.site = site;
      const rates = serializeRates();
      if (rates) data.rates = rates;
      const tours = serializeTours();
      if (tours) data.tours = tours;
      const posts = serializePosts();
      if (posts) data.posts = posts;
      const gallery = serializeGallery();
      if (gallery) data.gallery = gallery;
      const services = serializeServices();
      if (services) data.services = services;
      return data;
    }

    async function submitAdmin(action) {
      const data = buildPayload();
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');
      return result;
    }

    const statusEl = document.getElementById('save-status');
    document.getElementById('btn-save').addEventListener('click', async () => {
      statusEl.textContent = 'Saving...';
      statusEl.style.color = 'var(--ink-soft)';
      try {
        await submitAdmin('save');
        statusEl.textContent = 'Saved.';
        statusEl.style.color = 'green';
      } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.style.color = 'var(--error)';
      }
    });

    document.getElementById('btn-publish').addEventListener('click', async () => {
      if (!confirm('Save and rebuild + deploy? This takes 30-60 seconds.')) return;
      statusEl.textContent = 'Saving and publishing...';
      statusEl.style.color = 'var(--ink-soft)';
      try {
        await submitAdmin('publish');
        statusEl.textContent = 'Published! Site rebuilt and deployed.';
        statusEl.style.color = 'green';
      } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.style.color = 'var(--error)';
      }
    });
