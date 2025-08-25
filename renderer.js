class BrowserRenderer {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.mouseGesture = {
            isTracking: false,
            startX: 0,
            startY: 0,
            path: []
        };
        
        this.initializeElements();
        this.bindEvents();
        this.createInitialTab();
    }

    initializeElements() {
        this.tabPanel = document.getElementById('tabPanel');
        this.tabsContainer = document.getElementById('tabsContainer');
        this.newTabBtn = document.getElementById('newTabBtn');
        this.webview = document.getElementById('webview');
        this.urlInput = document.getElementById('urlInput');
        this.goBtn = document.getElementById('goBtn');
        this.backBtn = document.getElementById('backBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        
        // Debug webview initialization
        console.log('Webview element:', this.webview);
        if (this.webview) {
            console.log('Webview src:', this.webview.src);
            console.log('Webview readyState:', this.webview.readyState);
        }
    }

    bindEvents() {
        this.newTabBtn.addEventListener('click', () => this.createNewTab());
        this.goBtn.addEventListener('click', () => this.navigateToUrl());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigateToUrl();
        });
        
        this.backBtn.addEventListener('click', () => this.goBack());
        this.forwardBtn.addEventListener('click', () => this.goForward());
        this.refreshBtn.addEventListener('click', () => this.handleRefreshOrStop());
        
        // Mouse gesture tracking - add to both tab panel and document for global gesture support
        this.tabPanel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.tabPanel.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.tabPanel.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.tabPanel.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Global mouse gesture tracking (works over webview)
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle right-click + left-click for back navigation
        let rightMouseDown = false;
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) rightMouseDown = true;
        });
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0 && rightMouseDown) { // Left click while right mouse is down
                console.log('Right-click + Left-click detected - Going back');
                this.goBack();
                rightMouseDown = false;
            }
        });
        
        // Webview events
        this.webview.addEventListener('did-start-loading', () => {
            console.log('Webview started loading');
            this.updateNavigationButtons();
            this.updateTabTitle('Loading...');
        });
        
        this.webview.addEventListener('did-finish-load', () => {
            console.log('Webview finished loading');
            this.updateNavigationButtons();
            // Get the actual title from the webview
            if (this.webview.getTitle()) {
                this.updateTabTitle(this.webview.getTitle());
            }
            // Capture preview after page loads with a longer delay for better rendering
            setTimeout(() => this.captureTabPreview(), 500);
        });
        
        this.webview.addEventListener('page-title-updated', (e) => {
            console.log('Page title updated:', e.title);
            this.updateTabTitle(e.title);
        });
        
        this.webview.addEventListener('page-favicon-updated', (e) => this.updateTabFavicon(e.favicons[0]));
        
        this.webview.addEventListener('did-navigate', (e) => {
            console.log('Webview navigated to:', e.url);
            this.updateTabUrl(e.url);
        });
        
        // Handle webview errors
        this.webview.addEventListener('did-fail-load', (e) => {
            console.error('Webview failed to load:', e);
            this.updateTabTitle('Failed to load');
        });
        
        // Handle when loading is stopped
        this.webview.addEventListener('did-stop-loading', () => {
            console.log('Webview loading stopped');
            // Reset refresh button if it was in loading state
            if (this.refreshBtn.classList.contains('loading')) {
                this.refreshBtn.textContent = '↻';
                this.refreshBtn.title = 'Refresh';
                this.refreshBtn.classList.remove('loading');
            }
        });
        
        // Add console message event listener
        this.webview.addEventListener('console-message', (e) => {
            console.log('Webview console:', e.message);
        });
    }

    createInitialTab() {
        const tab = {
            id: Date.now(),
            url: 'speed-dial.html',
            title: 'Speed Dial',
            favicon: null,
            previewImage: null,
            previewText: 'Speed Dial'
        };
        
        this.tabs.push(tab);
        this.activeTabId = tab.id;
        this.renderTabs();
        this.updateActiveTab();
    }

    async createNewTab() {
        try {
            const result = await window.electronAPI.createNewTab();
            const tab = {
                id: result.id,
                url: result.url,
                title: result.title,
                favicon: null,
                previewImage: null,
                previewText: result.title
            };
            
            this.tabs.push(tab);
            this.activeTabId = tab.id;
            this.renderTabs();
            this.updateActiveTab();
            this.webview.src = tab.url;
        } catch (error) {
            console.error('Error creating new tab:', error);
        }
    }

    renderTabs() {
        this.tabsContainer.innerHTML = '';
        
        this.tabs.forEach(tab => {
            const tabElement = this.createTabElement(tab);
            this.tabsContainer.appendChild(tabElement);
        });
    }

    createTabElement(tab) {
        const tabDiv = document.createElement('div');
        tabDiv.className = `tab-item ${tab.id === this.activeTabId ? 'active' : ''}`;
        tabDiv.dataset.tabId = tab.id;
        
        // Determine preview content
        let previewContent = '';
        if (tab.previewImage) {
            // Show actual website preview image
            previewContent = `<img src="${tab.previewImage}" alt="Website Preview" class="tab-preview-image">`;
        } else if (tab.favicon) {
            // Show favicon if no preview image
            previewContent = `<img src="${tab.favicon}" alt="Favicon" class="tab-favicon">`;
        } else if (tab.previewText) {
            // Show text preview as fallback
            previewContent = `<div class="tab-preview-text">${tab.previewText}</div>`;
        } else if (tab.url === 'speed-dial.html') {
            // Special case for Speed Dial
            previewContent = '<div class="tab-preview-text speed-dial">Speed Dial</div>';
        } else {
            previewContent = '<div class="tab-preview-text">Loading...</div>';
        }
        
        tabDiv.innerHTML = `
            <div class="tab-preview">
                ${previewContent}
            </div>
            <div class="tab-info">
                <div class="tab-title">${tab.title}</div>
                <div class="tab-url">${tab.url}</div>
            </div>
        `;
        
        tabDiv.addEventListener('click', () => this.switchToTab(tab.id));
        
        return tabDiv;
    }

    switchToTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            this.activeTabId = tabId;
            this.webview.src = tab.url;
            this.urlInput.value = tab.url;
            this.renderTabs();
            this.updateActiveTab();
        }
    }

    updateActiveTab() {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
            this.urlInput.value = activeTab.url;
        }
    }

    updateTabTitle(title) {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
            activeTab.title = title;
            this.renderTabs();
        }
    }

    updateTabUrl(url) {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
            activeTab.url = url;
            this.renderTabs();
        }
    }

    updateTabFavicon(favicon) {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
            activeTab.favicon = favicon;
            this.renderTabs();
        }
    }

    // Capture webview content for tab preview
    async captureTabPreview() {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab && this.webview.src !== 'speed-dial.html') {
            try {
                // Capture a screenshot of the webview content
                const dataUrl = await this.webview.capturePage();
                if (dataUrl) {
                    activeTab.previewImage = dataUrl;
                    activeTab.previewText = null; // Clear text preview since we have image
                    this.renderTabs();
                }
            } catch (error) {
                console.log('Could not capture preview image:', error);
                // Fallback to text preview
                activeTab.previewText = this.webview.getTitle() || 'Website';
                this.renderTabs();
            }
        }
    }

    navigateToUrl() {
        let url = this.urlInput.value.trim();
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            }
        }
        
        console.log('Navigating to:', url);
        
        // Update the active tab's URL
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
            activeTab.url = url;
            activeTab.title = 'Loading...';
            activeTab.previewImage = null; // Clear old preview image
            activeTab.previewText = 'Loading...';
            this.renderTabs();
        }
        
        // Show loading state
        this.showLoadingState();
        
        // Navigate the webview
        try {
            this.webview.src = url;
            console.log('Webview src set to:', this.webview.src);
        } catch (error) {
            console.error('Error setting webview src:', error);
        }
    }

    showLoadingState() {
        const refreshBtn = this.refreshBtn;
        const originalText = refreshBtn.textContent;
        const originalTitle = refreshBtn.title;
        
        // Change refresh button to stop button
        refreshBtn.textContent = '⏹';
        refreshBtn.title = 'Stop loading';
        refreshBtn.classList.add('loading');
        
        // Remove loading state when page finishes loading
        const removeLoading = () => {
            refreshBtn.textContent = originalText;
            refreshBtn.title = originalTitle;
            refreshBtn.classList.remove('loading');
        };
        
        // Listen for page load completion
        const onLoadFinish = () => {
            removeLoading();
            this.webview.removeEventListener('did-finish-load', onLoadFinish);
            this.webview.removeEventListener('did-fail-load', onLoadFinish);
        };
        
        this.webview.addEventListener('did-finish-load', onLoadFinish);
        this.webview.addEventListener('did-fail-load', onLoadFinish);
    }

    goBack() {
        if (this.webview.canGoBack()) {
            this.webview.goBack();
        }
    }

    goForward() {
        if (this.webview.canGoForward()) {
            this.webview.goForward();
        }
    }

    refresh() {
        this.webview.reload();
    }

    handleRefreshOrStop() {
        if (this.refreshBtn.classList.contains('loading')) {
            // Currently loading - stop the page
            this.stopLoading();
        } else {
            // Not loading - refresh the page
            this.refresh();
        }
    }

    stopLoading() {
        if (this.webview) {
            this.webview.stop();
            console.log('Page loading stopped');
            
            // Reset the refresh button to normal state
            this.refreshBtn.textContent = '↻';
            this.refreshBtn.title = 'Refresh';
            this.refreshBtn.classList.remove('loading');
        }
    }

    updateNavigationButtons() {
        this.backBtn.disabled = !this.webview.canGoBack();
        this.forwardBtn.disabled = !this.webview.canGoForward();
    }

    // Mouse Gesture Handling
    handleMouseDown(e) {
        if (e.button === 2) { // Right mouse button
            this.mouseGesture.isTracking = true;
            this.mouseGesture.startX = e.clientX;
            this.mouseGesture.startY = e.clientY;
            this.mouseGesture.path = [];
            console.log('Mouse gesture tracking started at:', e.clientX, e.clientY);
            
            // Add visual feedback
            document.body.style.cursor = 'crosshair';
        }
    }

    handleMouseMove(e) {
        if (this.mouseGesture.isTracking) {
            this.mouseGesture.path.push({
                x: e.clientX - this.mouseGesture.startX,
                y: e.clientY - this.mouseGesture.startY
            });
        }
    }

    async handleMouseUp(e) {
        if (this.mouseGesture.isTracking && e.button === 2) {
            this.mouseGesture.isTracking = false;
            console.log('Mouse gesture tracking ended');
            
            // Remove visual feedback
            document.body.style.cursor = 'default';
            
            this.processMouseGesture();
        }
    }

    processMouseGesture() {
        if (this.mouseGesture.path.length < 2) return;
        
        const path = this.mouseGesture.path;
        const startPoint = path[0];
        const endPoint = path[path.length - 1];
        
        // Calculate gesture direction
        const deltaX = endPoint.x - startPoint.x;
        const deltaY = endPoint.y - startPoint.y;
        
        console.log('Mouse gesture detected:', { deltaX, deltaY, pathLength: path.length });
        
        // Check for specific gestures with more lenient thresholds
        if (Math.abs(deltaY) > 30) { // Vertical movement threshold (reduced from 50)
            if (deltaY > 0) { // Down movement
                console.log('Gesture: Down - Creating new tab');
                this.createNewTab();
            } else { // Up movement
                console.log('Gesture: Up - Creating new window');
                this.createNewWindow();
            }
        } else if (Math.abs(deltaX) > 30 && Math.abs(deltaY) > 20) { // Diagonal movement (reduced thresholds)
            if (deltaX > 0 && deltaY > 0) { // Down-right (L shape) - Close tab
                console.log('Gesture: Down-right (L) - Closing tab');
                this.closeCurrentTab();
            } else if (deltaX > 0 && deltaY < 0) { // Up-right (upside down L) - Reopen tab
                console.log('Gesture: Up-right (inverted L) - Reopening tab');
                this.reopenTab();
            }
        }
        
        this.mouseGesture.path = [];
    }

    async createNewWindow() {
        try {
            await window.electronAPI.createNewWindow();
        } catch (error) {
            console.error('Error creating new window:', error);
        }
    }

    async closeCurrentTab() {
        if (this.tabs.length > 1) {
            try {
                await window.electronAPI.closeTab(this.activeTabId);
                this.tabs = this.tabs.filter(t => t.id !== this.activeTabId);
                
                if (this.tabs.length > 0) {
                    this.activeTabId = this.tabs[this.tabs.length - 1].id;
                    this.switchToTab(this.activeTabId);
                }
            } catch (error) {
                console.error('Error closing tab:', error);
            }
        }
    }

    async reopenTab() {
        try {
            const result = await window.electronAPI.reopenTab();
            if (result.success) {
                const tab = {
                    id: result.tab.id,
                    url: result.tab.url || 'speed-dial.html',
                    title: result.tab.title || 'Speed Dial',
                    favicon: null,
                    previewImage: null,
                    previewText: result.tab.title || 'Speed Dial'
                };
                
                this.tabs.push(tab);
                this.activeTabId = tab.id;
                this.renderTabs();
                this.updateActiveTab();
                this.webview.src = tab.url;
            }
        } catch (error) {
            console.error('Error reopening tab:', error);
        }
    }
}

// Initialize the browser when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BrowserRenderer();
});
