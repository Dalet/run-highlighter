import { AuthProvider } from ".";

export type AuthProviderFactory = () => AuthProvider;

const authProviders: Record<string, AuthProviderFactory> = {};

export const registerAuthProvider = function(name: string, providerGetter: AuthProviderFactory) {
    authProviders[name] = providerGetter;
}

export function getAuthProvider(providerName: string): AuthProviderFactory {
    const factoryFunc = authProviders[providerName];
    console.assert(factoryFunc, `Auth provider "${providerName}" is not registered.`);
    return factoryFunc;
}