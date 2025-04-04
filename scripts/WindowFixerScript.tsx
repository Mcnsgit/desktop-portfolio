import React, { useEffect } from 'react';

const WindowFixerScript: React.FC = () => {
    useEffect(() => {
        // Add this script to the page to fix window positioning issues at runtime
        const script = document.createElement('script');
        script.innerHTML = `
      (function() {
        // Ensure windows appear above taskbar
        function fixWindowPositioning() {
          // Get all windows
          const windows = document.querySelectorAll('[data-window-id]');
          const taskbar = document.querySelector('.taskbar');
          
          if (!taskbar) return;
          
          const taskbarHeight = taskbar.offsetHeight || 40;
          const viewportHeight = window.innerHeight;
          
          windows.forEach(windowEl => {
            // Skip minimized windows
            if (windowEl.getAttribute('data-window-minimized') === 'true') return;
            
            const windowStyle = window.getComputedStyle(windowEl);
            const currentZIndex = parseInt(windowStyle.zIndex || '0', 10);
            
            // Make sure windows have a high z-index
            if (currentZIndex < 1000) {
              windowEl.style.zIndex = '1100';
            }
            
            // Make active windows have even higher z-index
            if (windowEl.getAttribute('data-window-active') === 'true') {
              windowEl.style.zIndex = '1200';
            }
            
            // Make sure windows are visible (not below taskbar)
            const windowRect = windowEl.getBoundingClientRect();
            const windowBottom = windowRect.top + windowRect.height;
            
            // If window is partially below taskbar, move it up
            if (windowBottom > viewportHeight - taskbarHeight) {
              const newTop = Math.max(0, viewportHeight - taskbarHeight - windowRect.height);
              windowEl.style.top = newTop + 'px';
            }
            
            // Force visibility
            windowEl.style.visibility = 'visible';
            windowEl.style.display = 'block';
          });
        }
        
        // Run initially
        fixWindowPositioning();
        
        // Set up observer to monitor windows
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList' || 
                mutation.type === 'attributes' && 
                mutation.attributeName === 'style') {
              fixWindowPositioning();
            }
          });
        });
        
        // Start observing the document
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'data-window-active', 'data-window-minimized']
        });
        
        // Also listen for window resize
        window.addEventListener('resize', fixWindowPositioning);
        
        // Run after state changes that might affect windows
        const originalPushState = history.pushState;
        history.pushState = function() {
          originalPushState.apply(this, arguments);
          setTimeout(fixWindowPositioning, 100);
        };
        
        // Fix on route changes
        window.addEventListener('popstate', () => {
          setTimeout(fixWindowPositioning, 100);
        });
        
        // Run again after full page load
        window.addEventListener('load', () => {
          setTimeout(fixWindowPositioning, 300);
        });
      })();
    `;

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default WindowFixerScript;