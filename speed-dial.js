class SpeedDial {
    constructor() {
        this.categories = [];
        this.bookmarks = [];
        this.currentCategory = 'all';
        
        this.initializeElements();
        this.bindEvents();
        this.loadDefaultData();
        this.renderCategories();
        this.renderBookmarks();
    }

    initializeElements() {
        this.addBookmarkBtn = document.getElementById('addBookmarkBtn');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');
        this.categoriesList = document.getElementById('categoriesList');
        this.bookmarksContainer = document.getElementById('bookmarksContainer');
        this.currentCategoryTitle = document.getElementById('currentCategoryTitle');
        this.bookmarkCount = document.getElementById('bookmarkCount');
        
        // Modal elements
        this.categoryModal = document.getElementById('categoryModal');
        this.bookmarkModal = document.getElementById('bookmarkModal');
        this.categoryNameInput = document.getElementById('categoryNameInput');
        this.bookmarkTitleInput = document.getElementById('bookmarkTitleInput');
        this.bookmarkUrlInput = document.getElementById('bookmarkUrlInput');
        this.bookmarkCategorySelect = document.getElementById('bookmarkCategorySelect');
        
        // Modal buttons
        this.categoryModalCancel = document.getElementById('categoryModalCancel');
        this.categoryModalSave = document.getElementById('categoryModalSave');
        this.bookmarkModalCancel = document.getElementById('bookmarkModalCancel');
        this.bookmarkModalSave = document.getElementById('bookmarkModalSave');
    }

    bindEvents() {
        this.addBookmarkBtn.addEventListener('click', () => this.showBookmarkModal());
        this.addCategoryBtn.addEventListener('click', () => this.showCategoryModal());
        
        // Category modal events
        this.categoryModalCancel.addEventListener('click', () => this.hideCategoryModal());
        this.categoryModalSave.addEventListener('click', () => this.saveCategory());
        
        // Bookmark modal events
        this.bookmarkModalCancel.addEventListener('click', () => this.hideBookmarkModal());
        this.bookmarkModalSave.addEventListener('click', () => this.saveBookmark());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.categoryModal) this.hideCategoryModal();
            if (e.target === this.bookmarkModal) this.hideBookmarkModal();
        });
        
        // Enter key support for modals
        this.categoryNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveCategory();
        });
        
        this.bookmarkTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveBookmark();
        });
        
        this.bookmarkUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveBookmark();
        });
    }

    loadDefaultData() {
        // Load default categories
        const defaultCategories = [
            { id: 'social', name: 'Social Media', color: '#667eea' },
            { id: 'news', name: 'News & Media', color: '#764ba2' },
            { id: 'tools', name: 'Tools & Utilities', color: '#f093fb' },
            { id: 'shopping', name: 'Shopping', color: '#4facfe' },
            { id: 'entertainment', name: 'Entertainment', color: '#43e97b' }
        ];
        
        this.categories = defaultCategories;
        
        // Load default bookmarks
        const defaultBookmarks = [
            { id: 1, title: 'Google', url: 'https://www.google.com', category: 'tools', icon: 'G', previewImage: 'https://www.google.com/favicon.ico' },
            { id: 2, title: 'YouTube', url: 'https://www.youtube.com', category: 'entertainment', icon: 'Y', previewImage: 'https://www.youtube.com/favicon.ico' },
            { id: 3, title: 'Facebook', url: 'https://www.facebook.com', category: 'social', icon: 'F', previewImage: 'https://www.facebook.com/favicon.ico' },
            { id: 4, title: 'Twitter', url: 'https://twitter.com', category: 'social', icon: 'T', previewImage: 'https://twitter.com/favicon.ico' },
            { id: 5, title: 'Reddit', url: 'https://www.reddit.com', category: 'social', icon: 'R', previewImage: 'https://www.reddit.com/favicon.ico' },
            { id: 6, title: 'GitHub', url: 'https://github.com', category: 'tools', icon: 'G', previewImage: 'https://github.com/favicon.ico' },
            { id: 7, title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'tools', icon: 'S', previewImage: 'https://stackoverflow.com/favicon.ico' },
            { id: 8, title: 'Amazon', url: 'https://www.amazon.com', category: 'shopping', icon: 'A', previewImage: 'https://www.amazon.com/favicon.ico' },
            { id: 9, title: 'Netflix', url: 'https://www.netflix.com', category: 'entertainment', icon: 'N', previewImage: 'https://www.netflix.com/favicon.ico' },
            { id: 10, title: 'BBC News', url: 'https://www.bbc.com/news', category: 'news', icon: 'B', previewImage: 'https://www.bbc.com/favicon.ico' },
            { id: 11, title: 'CNN', url: 'https://www.cnn.com', category: 'news', icon: 'C', previewImage: 'https://www.cnn.com/favicon.ico' },
            { id: 12, title: 'Wikipedia', url: 'https://www.wikipedia.org', category: 'tools', icon: 'W', previewImage: 'https://www.wikipedia.org/favicon.ico' }
        ];
        
        this.bookmarks = defaultBookmarks;
    }

    renderCategories() {
        this.categoriesList.innerHTML = '';
        
        // Add "All" category
        const allCategory = document.createElement('div');
        allCategory.className = `category-item ${this.currentCategory === 'all' ? 'active' : ''}`;
        allCategory.innerHTML = `
            <span class="category-name">All Bookmarks</span>
            <span class="category-count">${this.bookmarks.length}</span>
        `;
        allCategory.addEventListener('click', () => this.selectCategory('all'));
        this.categoriesList.appendChild(allCategory);
        
        // Add other categories
        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = `category-item ${this.currentCategory === category.id ? 'active' : ''}`;
            
            const bookmarkCount = this.bookmarks.filter(b => b.category === category.id).length;
            
            categoryElement.innerHTML = `
                <span class="category-name">${category.name}</span>
                <span class="category-count">${bookmarkCount}</span>
            `;
            
            categoryElement.addEventListener('click', () => this.selectCategory(category.id));
            this.categoriesList.appendChild(categoryElement);
        });
    }

    renderBookmarks() {
        this.bookmarksContainer.innerHTML = '';
        
        let filteredBookmarks = this.bookmarks;
        if (this.currentCategory !== 'all') {
            filteredBookmarks = this.bookmarks.filter(b => b.category === this.currentCategory);
        }
        
        // Update header
        if (this.currentCategory === 'all') {
            this.currentCategoryTitle.textContent = 'All Bookmarks';
        } else {
            const category = this.categories.find(c => c.id === this.currentCategory);
            this.currentCategoryTitle.textContent = category ? category.name : 'Category';
        }
        
        this.bookmarkCount.textContent = `${filteredBookmarks.length} bookmark${filteredBookmarks.length !== 1 ? 's' : ''}`;
        
        // Render bookmark tiles
        filteredBookmarks.forEach(bookmark => {
            const bookmarkElement = this.createBookmarkElement(bookmark);
            this.bookmarksContainer.appendChild(bookmarkElement);
        });
        
        // Update category counts
        this.renderCategories();
    }

    createBookmarkElement(bookmark) {
        const bookmarkDiv = document.createElement('div');
        bookmarkDiv.className = 'bookmark-tile';
        bookmarkDiv.dataset.bookmarkId = bookmark.id;
        
        // Create preview image element
        let previewHtml = '';
        if (bookmark.previewImage) {
            previewHtml = `<img src="${bookmark.previewImage}" alt="${bookmark.title}" class="bookmark-preview-image" onerror="this.classList.add('fallback'); this.textContent='${bookmark.icon}'">`;
        } else {
            // Fallback to icon if no preview image
            previewHtml = `<div class="bookmark-preview-image fallback">${bookmark.icon}</div>`;
        }
        
        bookmarkDiv.innerHTML = `
            ${previewHtml}
            <div class="bookmark-title">${bookmark.title}</div>
            <div class="bookmark-url">${this.getDomainFromUrl(bookmark.url)}</div>
        `;
        
        bookmarkDiv.addEventListener('click', () => this.openBookmark(bookmark.url));
        
        return bookmarkDiv;
    }

    getDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url;
        }
    }

    openBookmark(url) {
        // In a real browser, this would navigate to the URL
        // For this demo, we'll just log it
        console.log('Opening bookmark:', url);
        
        // If we're in an Electron context, we could send a message to navigate
        if (window.electronAPI) {
            // This would be handled by the main process to navigate the webview
            console.log('Would navigate to:', url);
        }
    }

    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.renderCategories();
        this.renderBookmarks();
    }

    showCategoryModal() {
        this.categoryModal.style.display = 'block';
        this.categoryNameInput.value = '';
        this.categoryNameInput.focus();
    }

    hideCategoryModal() {
        this.categoryModal.style.display = 'none';
    }

    showBookmarkModal() {
        this.bookmarkModal.style.display = 'block';
        this.bookmarkTitleInput.value = '';
        this.bookmarkUrlInput.value = '';
        this.populateCategorySelect();
        this.bookmarkTitleInput.focus();
    }

    hideBookmarkModal() {
        this.bookmarkModal.style.display = 'none';
    }

    populateCategorySelect() {
        this.bookmarkCategorySelect.innerHTML = '';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            this.bookmarkCategorySelect.appendChild(option);
        });
    }

    saveCategory() {
        const name = this.categoryNameInput.value.trim();
        if (!name) return;
        
        const newCategory = {
            id: 'cat_' + Date.now(),
            name: name,
            color: this.getRandomColor()
        };
        
        this.categories.push(newCategory);
        this.renderCategories();
        this.hideCategoryModal();
    }

    saveBookmark() {
        const title = this.bookmarkTitleInput.value.trim();
        const url = this.bookmarkUrlInput.value.trim();
        const category = this.bookmarkCategorySelect.value;
        
        if (!title || !url) return;
        
        // Validate URL
        let validUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            validUrl = 'https://' + url;
        }
        
        try {
            new URL(validUrl);
        } catch {
            alert('Please enter a valid URL');
            return;
        }
        
        const newBookmark = {
            id: Date.now(),
            title: title,
            url: validUrl,
            category: category,
            icon: title.charAt(0).toUpperCase(),
            previewImage: null // Will be populated later if needed
        };
        
        this.bookmarks.push(newBookmark);
        this.renderBookmarks();
        this.hideBookmarkModal();
    }

    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#a8edea'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Initialize Speed Dial when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeedDial();
});
