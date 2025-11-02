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
    if (path === window.location.pathname) return; // Already on this route
    
    this.isNavigating = true;
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute() {
    if (this.isNavigating && this.currentRoute === window.location.pathname) {
      this.isNavigating = false;
      return; // Prevent re-rendering the same route
    }
    
    const path = window.location.pathname;
    const handler = this.findRoute(path);
    
    if (handler) {
      this.currentRoute = path;
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
      return this.routes[path];
    }
    
    // Try pattern matching
    for (const route in this.routes) {
      const pattern = route.replace(/:[^/]+/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) {
        return this.routes[route];
      }
    }
    
    return null;
  }
}

const router = new Router();

export default router;

