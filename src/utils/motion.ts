interface Transition {
  type: string;
  delay?: number;
  duration?: number;
  ease?: string;
}
export const textVariant = (delay: number) => {
  return {
    hidden: {
      y: -50,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 1.25,
        delay: delay,
      },
    },
  };
};

export const fadeIn = (direction: "left" | "right" | "up" | "down", type: string, delay: number, duration: number): { hidden: { x: number; y: number; opacity: number }; show: { x: number; y: number; opacity: number; transition: Transition } } => {
  return {
    hidden: {
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: "easeOut",
      },
    },
  };
};
export const zoomIn = (delay: number, duration: number): { hidden: { scale: number; opacity: number }; show: { scale: number; opacity: number; transition: Transition } } => {
  return {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween",
        delay: delay,
        duration: duration,
        ease: "easeOut",
      },
    },
  };
};
export const slideIn = (direction: "left" | "right" | "up" | "down", type: string, delay: number, duration: number): { hidden: { x: string; y: string }; show: { x: number; y: number; transition: Transition } } => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : "0", // Ensure all values are strings
      y: direction === "up" ? "100%" : direction === "down" ? "100%" : "0", // Ensure all values are strings
    },
    show: {
      x: 0, // This can remain a number since it's in the 'show' object
      y: 0, // This can remain a number since it's in the 'show' object
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: "easeOut",
      },
    },
  };
};
export const staggerContainer = (staggerChildren: number, delayChildren?: number): { hidden: {}; show: { transition: { staggerChildren: number; delayChildren?: number } } } => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren || 0,
      },
    },
  };
};