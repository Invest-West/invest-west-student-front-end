const fallbackStore = new Map<string, string>();
function safeGetItem(sKey: string) {
    const localStoreWorks = !!localStorage;

    if (localStoreWorks) {
        return localStorage.getItem(sKey);
    } else {
        if (!sKey || !fallbackStore.has(sKey)) {
            return null;
        }

        return fallbackStore.get(sKey);
    }
}
function safeKey(nKeyId: number) {
    const localStoreWorks = !!localStorage;

    if (localStoreWorks) {
        return localStorage.key(nKeyId);
    } else {
        return Array.from(fallbackStore.keys())[nKeyId];
    }
}
function safeSetItem(sKey: string, sValue: string) {
    const localStoreWorks = !!localStorage;

    if (localStoreWorks) {
        localStorage.setItem(sKey, sValue);
    } else {
        if (!sKey) {
            return;
        }

        fallbackStore.set(sKey, sValue);
    }
}
function safeGetLength() {
    const localStoreWorks = !!localStorage;

    if (localStoreWorks) {
        return localStorage.length;
    } else {
        return fallbackStore.size;
    }
}
function safeRemoveItem(sKey: string) {
    const localStoreWorks = !!localStorage;

    if (localStoreWorks) {
        localStorage.removeItem(sKey);
    } else {
        if (!sKey || !fallbackStore.has(sKey)) {
            return;
        }

        fallbackStore['delete'](sKey);
    }
}

export { safeGetItem, safeGetLength, safeKey, safeRemoveItem, safeSetItem };
