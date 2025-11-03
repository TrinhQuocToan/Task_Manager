// Simple Router for SPA
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.isNavigating = false;
  }

  init() {
    // Listen for navigation
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]') || (e.target.matches('a[data-link]') ? e.target : null);
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href') || link.dataset.link;
        if (href && href !== window.location.pathname) {
          this.navigate(href);
        }
      }
    });
    
    // Handle initial route after a short delay to ensure routes are registered
    setTimeout(() => this.handleRoute(), 0);
  }

  route(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    if (this.isNavigating) return; // Prevent infinite loops
    // Consider query string changes as navigation too
    const current = window.location.pathname + window.location.search;
    if (path === current) return; // Already on this exact URL
    
    this.isNavigating = true;
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute() {
    const fullPath = window.location.pathname + window.location.search;
    if (this.isNavigating && this.currentRoute === fullPath) {
      this.isNavigating = false;
      return; // Prevent re-rendering the same route
    }
    
    const path = window.location.pathname;
    const handler = this.findRoute(path);
    
    if (handler) {
      this.currentRoute = fullPath;
      this.isNavigating = false;
      try {
        handler();
      } catch (error) {
        console.error('Route handler error:', error);
        this.isNavigating = false;
      }
    } else {
      // 404 - only redirect to home if not already there
      this.isNavigating = false;
      if (path !== '/' && this.routes['/']) {
        window.history.replaceState({}, '', '/');
        this.handleRoute();
      } else {
        console.warn('No route found for:', path);
      }
    }
  }

  findRoute(path) {
    // Exact match first
    if (this.routes[path]) {
      return () => this.routes[path]();
    }
    
    // Try pattern matching with params
    for (const route in this.routes) {
      const paramNames = [];
      const pattern = route.replace(/:([^/]+)/g, (match, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
      const regex = new RegExp(`^${pattern}$`);
      const match = path.match(regex);
      
      if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return () => this.routes[route](params);
      }
    }
    
    return null;
  }
}

const router = new Router();

// Expose router to window for global access
window.router = router;

export default router;

