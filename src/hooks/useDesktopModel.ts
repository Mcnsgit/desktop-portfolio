import { useSyncExternalStore } from "react";
// import { Desktop as DesktopModel} from "../model/Desktop"

let desktopModelInstance: any = null;

const listeners = new Set<() => void>();

function emitChange() {
    for (const listener of listeners) {
    listener();
    }
}

// This function will be called by your model when it changes
export function notifyDesktopUpdate() {
  emitChange();
}

export function useDesktopModel(fsInstance: any): any {
  if (!fsInstance) return null;

  // Initialize the model only once
  if (!desktopModelInstance) {
    desktopModelInstance = new(fsInstance);
    // You might need to load initial items here if not done elsewhere
    // desktopModelInstance.loadInitialDesktopItems('/home/guest/Desktop');
  }

  // The hook subscribes to changes and returns the current state snapshot.
  const model = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => desktopModelInstance // The "snapshot" is just the model itself
  );

  return model;
}