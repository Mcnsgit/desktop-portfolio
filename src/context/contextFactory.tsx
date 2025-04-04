import React, { createContext, memo, useContext } from "react";

/**
 * Factory function to create context providers and hooks
 * @param useContextState Hook that provides the state
 * @param ContextComponent Optional component to render inside the provider
 * @returns Provider component and useContext hook
 */
const contextFactory = <T,>(
    useContextState: () => T,
    ContextComponent?: React.ReactNode
): {
    Provider: React.FC<{ children: React.ReactNode }>;
    useContext: () => T;
} => {
    const Context = createContext<T>(null as unknown as T);

    // Create a Provider component with display name for better debugging
    const Provider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
        const state = useContextState();

        return (
            <Context.Provider value={state}>
                {children}
                {ContextComponent}
            </Context.Provider>
        );
    });

    // Set display name for better debugging
    Provider.displayName = 'ContextProvider';

    // Return the components and hooks
    return {
        Provider,
        useContext: () => useContext(Context),
    };
};

export default contextFactory;