// utils/browserSupport.ts - Utility functions for browser feature detection

/**
 * Comprehensive browser feature detection for 3D transform capabilities
 * @returns {boolean} Whether the browser fully supports 3D transforms
 */
export const supports3DTransforms = (): boolean => {
    if (typeof window === 'undefined') return false; // SSR check
    
    try {
      // Check for transform property support
      const hasTransform = 
        'transform' in document.documentElement.style ||
        'webkitTransform' in document.documentElement.style ||
        'MozTransform' in document.documentElement.style ||
        'msTransform' in document.documentElement.style ||
        'OTransform' in document.documentElement.style;
      
      // Check for perspective support
      const hasPerspective = 
        'perspective' in document.documentElement.style ||
        'webkitPerspective' in document.documentElement.style ||
        'MozPerspective' in document.documentElement.style ||
        'msPerspective' in document.documentElement.style ||
        'OPerspective' in document.documentElement.style;
      
      // Check for transform-style: preserve-3d support
      const hasPreserve3D = 
        'transformStyle' in document.documentElement.style ||
        'webkitTransformStyle' in document.documentElement.style ||
        'MozTransformStyle' in document.documentElement.style ||
        'msTransformStyle' in document.documentElement.style ||
        'OTransformStyle' in document.documentElement.style;
      
      // Check for touch support (useful for mobile-specific optimizations)
      const hasTouch = 
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;
      
      // Check for specific browsers that have known issues with 3D transforms
      const userAgent = window.navigator.userAgent;
      
      // Check for Internet Explorer
      const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
      
      // Check for old Edge (EdgeHTML, not Chromium-based)
      const isOldEdge = !isIE && !!(window as any).StyleMedia;
      
      // Check for old iOS (below iOS 9)
      const isOldiOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream && 
        parseInt((navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/)?.[1] || "10", 10) < 9;
      
      // Check for old Android browser (below 5.0)
      const isOldAndroid = /Android/.test(userAgent) && 
        parseFloat(userAgent.slice(userAgent.indexOf("Android") + 8)) < 5;
      
      // Old Samsung browsers can have issues with 3D transforms
      const isOldSamsung = /SamsungBrowser\/([0-9.]+)/.test(userAgent) && 
        parseFloat(userAgent.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || "9") < 9;
      
      // Check for performance capabilities - some devices technically support 3D transforms
      // but perform poorly with them
      const hasLowPerformance = () => {
        // Check for low memory devices
        if ('deviceMemory' in navigator) {
          return (navigator as any).deviceMemory < 2; // Less than 2GB RAM
        }
        
        // Check processor cores if available
        if ('hardwareConcurrency' in navigator) {
          return navigator.hardwareConcurrency < 4; // Less than 4 cores
        }
        
        return false; // Assume good performance if we can't detect
      };
  
      // Main decision - return true only if all necessary features are supported
      // and the browser is not one with known issues
      return hasTransform && hasPerspective && hasPreserve3D && 
        !isIE && !isOldEdge && !isOldiOS && !isOldAndroid && !isOldSamsung && 
        !hasLowPerformance();
        
    } catch (error) {
      console.warn('Error detecting 3D transform support:', error);
      return false; // On any error, fall back to no 3D support to be safe
    }
  };
  
  /**
   * Checks if the device has gyroscope capabilities
   * @returns {boolean} Whether the device has a gyroscope
   */
  export const hasGyroscope = (): boolean => {
    if (typeof window === 'undefined') return false; // SSR check
    
    try {
      // Check for DeviceMotionEvent support
      const hasDeviceMotion = 'DeviceMotionEvent' in window;
      
      // Check for DeviceOrientationEvent support
      const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
      
      // Check if we're on a mobile device (most likely to have gyroscope)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      return (hasDeviceMotion || hasDeviceOrientation) && isMobile;
    } catch (error) {
      console.warn('Error detecting gyroscope support:', error);
      return false;
    }
  };
  
  /**
   * Check if WebGL is supported (for more advanced visual effects)
   * @returns {boolean} Whether WebGL is supported
   */
  export const supportsWebGL = (): boolean => {
    if (typeof window === 'undefined') return false; // SSR check
    
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Determine the optimal tilt configuration based on device capabilities
   * @returns {Object} Configuration object with recommended tilt settings
   */
  export const getTiltConfiguration = () => {
    const has3D = supports3DTransforms();
    const hasGyro = hasGyroscope();
    const hasGL = supportsWebGL();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    return {
      // Base options
      enableTilt: has3D,
      perspective: has3D ? "800" : "none",
      
      // Tilt constraints
      tiltMaxAngleX: isMobile ? 10 : 15, // Reduce tilt on mobile
      tiltMaxAngleY: isMobile ? 10 : 15,
      
      // Visual effects
      glareEnable: has3D && hasGL,
      glareMaxOpacity: 0.3,
      scale: has3D ? 1.05 : 1.02, // Smaller scale if no 3D
      
      // Performance optimizations
      gyroscope: hasGyro,
      gyroscopeMinAngleX: -10,
      gyroscopeMaxAngleX: 10,
      gyroscopeMinAngleY: -10,
      gyroscopeMaxAngleY: 10,
      
      // Other settings
      reset: true,
      
      // CSS variables
      style: {
        '--tilt-transition-duration': isMobile ? '800ms' : '1500ms', // Faster on mobile
        '--tilt-glare-opacity': hasGL ? '0.3' : '0.2'
      }
    };
  };