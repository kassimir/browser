# Electron Browser

A feature-rich Electron-based web browser with advanced tab management, mouse gestures, and a custom Speed Dial page.

## Features

### 🗂️ Tab Management
- **Left Sidebar Tab Panel**: Shows small previews of all open tabs
- **Tab Previews**: Visual thumbnails of website content
- **Dynamic Tab Updates**: Title and URL updates in real-time
- **Tab Switching**: Click any tab to switch to it

### 🧭 Navigation
- **Address Bar**: Navigate to any URL or search the web
- **Navigation Buttons**: Back, forward, and refresh functionality
- **Smart URL Handling**: Automatically adds https:// for domains
- **Search Integration**: Non-URL inputs are treated as Google searches

### 🖱️ Mouse Gestures
- **Right-click + Down**: Open new tab
- **Right-click + Up**: Open new window
- **Right-click + Down-Right (L shape)**: Close current tab
- **Right-click + Up-Right (upside down L)**: Reopen closed tab
- **Right-click + Left-click**: Go back in history

### 🚀 Speed Dial
- **Category-based Organization**: Organize bookmarks by categories
- **Custom Categories**: Add your own categories
- **Bookmark Management**: Add, edit, and organize bookmarks
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive Layout**: Works on all screen sizes

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Setup
1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd electron-browser
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Usage

### Basic Navigation
- Type a URL in the address bar and press Enter or click "Go"
- Use the back/forward buttons to navigate through history
- Click the refresh button to reload the current page

### Tab Management
- Click the "+" button in the tab panel to create a new tab
- Click any tab in the left sidebar to switch to it
- New tabs automatically open to the Speed Dial page

### Mouse Gestures
- **New Tab**: Hold right mouse button and drag down
- **New Window**: Hold right mouse button and drag up
- **Close Tab**: Hold right mouse button and drag down-right (L shape)
- **Reopen Tab**: Hold right mouse button and drag up-right (upside down L)

### Speed Dial
- **Add Category**: Click the "+" button next to "Categories"
- **Add Bookmark**: Click "Add Bookmark" in the header
- **Organize**: Click on categories to filter bookmarks
- **Navigate**: Click on bookmark tiles to visit websites

## Project Structure

```
electron-browser/
├── main.js              # Main Electron process
├── preload.js           # Preload script for security
├── index.html           # Main browser interface
├── styles.css           # Browser styles
├── renderer.js          # Browser functionality
├── speed-dial.html      # Speed Dial page
├── speed-dial.css       # Speed Dial styles
├── speed-dial.js        # Speed Dial functionality
├── package.json         # Project configuration
└── README.md            # This file
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Distribution
```bash
npm run build
```

### Packaging
```bash
npm run pack
```

## Customization

### Adding Default Bookmarks
Edit `speed-dial.js` and modify the `defaultBookmarks` array in the `loadDefaultData()` method.

### Changing Default Categories
Edit `speed-dial.js` and modify the `defaultCategories` array in the `loadDefaultData()` method.

### Modifying Mouse Gesture Sensitivity
Edit `renderer.js` and adjust the threshold values in the `processMouseGesture()` method:
- `Math.abs(deltaY) > 50` for vertical gestures
- `Math.abs(deltaX) > 50 && Math.abs(deltaY) > 30` for diagonal gestures

## Browser Features

### Webview Support
- Full web compatibility
- Popup support
- JavaScript execution
- Modern web standards

### Security
- Context isolation enabled
- Node integration disabled
- Secure preload script
- Sandboxed webview

### Performance
- Efficient tab management
- Lazy loading of tab previews
- Optimized rendering
- Memory management for closed tabs

## Troubleshooting

### Common Issues

**App won't start:**
- Ensure Node.js is installed (version 16+)
- Check that all dependencies are installed
- Verify the main.js file exists

**Mouse gestures not working:**
- Make sure you're using the right mouse button
- Gestures require sufficient movement (50+ pixels)
- Try refreshing the page

**Speed Dial not loading:**
- Check that speed-dial.html exists
- Verify all CSS and JS files are present
- Check browser console for errors

### Debug Mode
Run with additional logging:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Electron
- Inspired by modern browser interfaces like Vivaldi
- Uses modern CSS features and JavaScript ES6+
- Responsive design principles

---

**Note**: This is a demonstration browser. For production use, consider additional security measures, error handling, and testing.
