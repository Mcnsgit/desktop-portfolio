// src/hooks/useTouchSupport.ts
import { useEffect, useRef, useCallback } from "react";

export interface TouchOptions {
  swipeThreshold?: number;
  tapThreshold?: number;
  longPressThreshold?: number;
  doubleTapThreshold?: number;
  preventScrollOnSwipeHorizontal?: boolean;
  preventAllScrolling?: boolean;
}

export interface TouchHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: (e: TouchEvent) => void;
  onDoubleTap?: (e: TouchEvent) => void;
  onLongPress?: (e: TouchEvent) => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onPan?: (deltaX: number, deltaY: number) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  lastTap: number;
  lastTapX: number;
  lastTapY: number;
  longPressTimer: NodeJS.Timeout | null;
  isPanning: boolean;
  previousTouchesDistance: number | null;
}

export const useTouchSupport = (
  elementRef: React.RefObject<HTMLElement>,
  handlers: TouchHandlers = {},
  options: TouchOptions = {}
) => {
  // Default options
  const {
    swipeThreshold = 50,
    tapThreshold = 10,
    longPressThreshold = 500,
    doubleTapThreshold = 300,
    preventScrollOnSwipeHorizontal = false,
    preventAllScrolling = false,
  } = options;

  // Touch state ref to prevent recreating the object on each render
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    lastTap: 0,
    lastTapX: 0,
    lastTapY: 0,
    longPressTimer: null,
    isPanning: false,
    previousTouchesDistance: null,
  });

  // Clear the long press timer
  const clearLongPressTimer = useCallback(() => {
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }
  }, []);

  // Calculate distance between two touch points (for pinch)
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventAllScrolling) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      touchState.current.startX = touch.clientX;
      touchState.current.startY = touch.clientY;
      touchState.current.isPanning = true;

      // Handle multi-touch (pinch) initialization
      if (e.touches.length === 2) {
        touchState.current.previousTouchesDistance = getTouchDistance(
          e.touches
        );
      }

      // Set up long press timer
      if (handlers.onLongPress) {
        clearLongPressTimer();
        touchState.current.longPressTimer = setTimeout(() => {
          if (handlers.onLongPress) {
            handlers.onLongPress(e);
          }
          touchState.current.isPanning = false;
        }, longPressThreshold);
      }
    },
    [handlers, longPressThreshold, preventAllScrolling, clearLongPressTimer]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current.isPanning) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;

      // If we're significantly moving, cancel the long press timer
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        clearLongPressTimer();
      }

      // Prevent default to stop scrolling when swiping horizontally
      if (
        preventScrollOnSwipeHorizontal &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        e.preventDefault();
      }

      // Handle pinch gesture
      if (
        e.touches.length === 2 &&
        (handlers.onPinchIn || handlers.onPinchOut)
      ) {
        const currentDistance = getTouchDistance(e.touches);
        const previousDistance = touchState.current.previousTouchesDistance;

        if (
          previousDistance &&
          Math.abs(currentDistance - previousDistance) > 10
        ) {
          if (currentDistance < previousDistance && handlers.onPinchIn) {
            handlers.onPinchIn();
          } else if (
            currentDistance > previousDistance &&
            handlers.onPinchOut
          ) {
            handlers.onPinchOut();
          }

          touchState.current.previousTouchesDistance = currentDistance;
        }
      }

      // Handle pan gesture
      if (handlers.onPan && touchState.current.isPanning) {
        handlers.onPan(deltaX, deltaY);
      }
    },
    [handlers, preventScrollOnSwipeHorizontal, clearLongPressTimer]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      clearLongPressTimer();

      if (!touchState.current.isPanning) return;
      touchState.current.isPanning = false;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;

      // Handle swipe gestures
      if (
        Math.abs(deltaX) > swipeThreshold ||
        Math.abs(deltaY) > swipeThreshold
      ) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          } else if (deltaY < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          }
        }
      }
      // Handle tap gestures
      else if (
        Math.abs(deltaX) < tapThreshold &&
        Math.abs(deltaY) < tapThreshold &&
        handlers.onTap
      ) {
        const now = Date.now();
        const isDoubleTap =
          now - touchState.current.lastTap < doubleTapThreshold &&
          Math.abs(touch.clientX - touchState.current.lastTapX) < 20 &&
          Math.abs(touch.clientY - touchState.current.lastTapY) < 20;

        if (isDoubleTap && handlers.onDoubleTap) {
          handlers.onDoubleTap(e);
          // Reset last tap time to prevent triple tap being detected as another double tap
          touchState.current.lastTap = 0;
        } else {
          handlers.onTap(e);
          touchState.current.lastTap = now;
          touchState.current.lastTapX = touch.clientX;
          touchState.current.lastTapY = touch.clientY;
        }
      }

      // Reset pinch state
      touchState.current.previousTouchesDistance = null;
    },
    [
      handlers,
      swipeThreshold,
      tapThreshold,
      doubleTapThreshold,
      clearLongPressTimer,
    ]
  );

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, {
      passive: !preventAllScrolling,
    });
    element.addEventListener("touchmove", handleTouchMove, {
      passive: !preventScrollOnSwipeHorizontal,
    });
    element.addEventListener("touchend", handleTouchEnd);

    // Cleanup
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      clearLongPressTimer();
    };
  }, [
    elementRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    preventAllScrolling,
    preventScrollOnSwipeHorizontal,
    clearLongPressTimer,
  ]);

  // Nothing to return - this is a side effect hook
};

// Example implementation for Window component:
/*
// In your Window component
const windowRef = useRef<HTMLDivElement>(null);

useTouchSupport(windowRef, {
  onSwipeLeft: () => {
    // Handle swipe left on window
  },
  onSwipeRight: () => {
    // Handle swipe right on window
  },
  onPan: (deltaX, deltaY) => {
    // Update window position based on pan
    if (windowRef.current && !isMaximized) {
      windowRef.current.style.left = `${initialPosition.current.x + deltaX}px`;
      windowRef.current.style.top = `${initialPosition.current.y + deltaY}px`;
    }
  },
  onDoubleTap: () => {
    // Toggle maximize on double tap
    handleMaximize();
  }
}, {
  preventScrollOnSwipeHorizontal: true
});
*/
