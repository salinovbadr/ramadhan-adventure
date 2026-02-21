// LocalStorage wrapper for Ramadan Mission Control
const STORAGE_PREFIX = 'rmc_';
import { initFirebase, fetchFromFirebase, pushToFirebase, resolveConflict, isFirebaseReady } from './firebase.js';

export function getData(key) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setData(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

export function removeData(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
}

export function createDefaultProfile() {
    return {
        id: 'abah',
        callsign: 'Abah',
        avatar: 'rocket',
        avatarColor: '#8A2BE2',
        difficulty: 'cadet',
        createdAt: new Date().toISOString(),
    };
}

export function createEmptyMissionLog() {
    const log = {};
    for (let day = 1; day <= 30; day++) {
        log[day] = {
            completed: false,
            missions: {},
            xpEarned: 0,
            savedAt: null,
        };
    }
    return log;
}

export function initializeApp() {
    initFirebase();
    const crew = getData('crew');
    if (!crew || crew.length === 0) {
        setData('crew', [createDefaultProfile()]);
        setData('logs', { [createDefaultProfile().id]: createEmptyMissionLog() });
        setData('settings', {
            enabledMissions: [],
            missionOverrides: {},
            customMissions: [],
        });
        setData('lastSync', null);
    }
}

export function resetAll() {
    removeData('crew');
    removeData('logs');
    removeData('settings');
    removeData('custom_missions');
    removeData('lastSync');
}

// Firebase sync functions
export async function syncFromFirebase() {
    if (!isFirebaseReady()) return false;
    try {
        const remote = await fetchFromFirebase();
        if (!remote) return false;
        const local = {
            crew: getData('crew'),
            logs: getData('logs'),
            settings: getData('settings'),
            customMissions: getData('custom_missions'),
            lastSync: getData('lastSync'),
        };
        const { merged, source } = resolveConflict(local, remote);
        if (source === 'remote') {
            setData('crew', merged.crew);
            setData('logs', merged.logs);
            setData('settings', merged.settings);
            setData('custom_missions', merged.customMissions);
            setData('lastSync', new Date().toISOString());
            console.log('Synced from remote (remote newer)');
        } else {
            console.log('Local data is newer or same age; no overwrite');
        }
        return true;
    } catch (e) {
        console.error('Sync from Firebase failed:', e);
        return false;
    }
}

export async function syncToFirebase() {
    if (!isFirebaseReady()) return false;
    try {
        const data = {
            crew: getData('crew'),
            logs: getData('logs'),
            settings: getData('settings'),
            customMissions: getData('custom_missions'),
            lastSync: new Date().toISOString(),
        };
        const ok = await pushToFirebase(data);
        if (ok) {
            setData('lastSync', data.lastSync);
        }
        return ok;
    } catch (e) {
        console.error('Sync to Firebase failed:', e);
        return false;
    }
}

export function getActiveUser() {
    const settings = getData('settings') || {};
    const crew = getData('crew') || [];
    return crew.find(m => m.id === settings.activeUser) || crew[0] || null;
}

export function getMissionLog(userId) {
    const logs = getData('logs') || {};
    return logs[userId] || createEmptyMissionLog();
}

export function saveDayMissions(userId, day, missions, xpEarned) {
    const logs = getData('logs') || {};
    if (!logs[userId]) logs[userId] = createEmptyMissionLog();
    logs[userId][day] = {
        completed: true,
        missions,
        xpEarned,
        savedAt: new Date().toISOString(),
    };
    setData('logs', logs);
}

export function getTotalStars(userId) {
    const log = getMissionLog(userId);
    let total = 0;
    for (let day = 1; day <= 30; day++) {
        total += (log[day]?.xpEarned || 0);
    }
    return total;
}

export function getPerfectStreak(userId) {
    const log = getMissionLog(userId);
    let lastSavedDay = null;
    for (let day = 30; day >= 1; day--) {
        if (log[day]?.savedAt) {
            lastSavedDay = day;
            break;
        }
    }

    if (!lastSavedDay) return 0;

    let streak = 0;
    for (let day = lastSavedDay; day >= 1; day--) {
        if (log[day]?.completed && (log[day]?.xpEarned || 0) > 0) {
            streak++;
            continue;
        }
        break;
    }
    return streak;
}

export function getCompletionPercent(userId) {
    const log = getMissionLog(userId);
    let completed = 0;
    let total = 0;
    for (let day = 1; day <= 30; day++) {
        if (log[day]?.savedAt) {
            total++;
            if (log[day]?.completed) completed++;
        }
    }
    return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function addCrewMember(member) {
    const crew = getData('crew') || [];

    const normalized = typeof member === 'string'
        ? {
            id: `${member.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Date.now()}`,
            callsign: member.trim(),
            avatar: 'rocket',
            avatarColor: '#25aff4',
            difficulty: 'cadet',
            createdAt: new Date().toISOString(),
        }
        : member;

    crew.push(normalized);
    setData('crew', crew);

    const logs = getData('logs') || {};
    logs[normalized.id] = createEmptyMissionLog();
    setData('logs', logs);

    return normalized;
}

export function removeCrewMember(memberId) {
    let crew = getData('crew') || [];
    crew = crew.filter(m => m.id !== memberId);
    setData('crew', crew);
    const logs = getData('logs') || {};
    delete logs[memberId];
    setData('logs', logs);
}

export function updateCrewMember(memberId, updates) {
    const crew = getData('crew') || [];
    const idx = crew.findIndex(m => m.id === memberId);
    if (idx >= 0) {
        crew[idx] = { ...crew[idx], ...updates };
        setData('crew', crew);
    }
}

export function getCustomMissions() {
    return getData('custom_missions') || [];
}

export function addCustomMission(mission) {
    const custom = getCustomMissions();
    custom.push(mission);
    setData('custom_missions', custom);
}

export function updateCustomMission(missionId, updates) {
    const custom = getCustomMissions();
    const idx = custom.findIndex(m => m.id === missionId);
    if (idx >= 0) {
        custom[idx] = { ...custom[idx], ...updates };
        setData('custom_missions', custom);
    }
}

export function removeCustomMission(missionId) {
    const custom = getCustomMissions();
    const updated = custom.filter(m => m.id !== missionId);
    setData('custom_missions', updated);
}

export function updateSettings(updates) {
    const settings = getData('settings') || {};
    setData('settings', { ...settings, ...updates });
}

export function getMissionOverrides() {
    return getData('mission_overrides') || {};
}

export function updateMissionOverride(missionId, updates) {
    const overrides = getMissionOverrides();
    const merged = { ...(overrides[missionId] || {}), ...updates };
    if (Array.isArray(merged.assignedTo) && merged.assignedTo.length === 0) {
        merged.assignedTo = null;
    }
    overrides[missionId] = merged;
    setData('mission_overrides', overrides);
}

export function clearMissionOverride(missionId) {
    const overrides = getMissionOverrides();
    delete overrides[missionId];
    setData('mission_overrides', overrides);
}

export function getTeamTotalStars() {
    const crew = getData('crew') || [];
    let total = 0;
    crew.forEach(member => {
        total += getTotalStars(member.id);
    });
    return total;
}

export function getTeamMaxStars() {
    // This is a simplified version - the full implementation would need mission data
    const crew = getData('crew') || [];
    return crew.length * 1000; // Placeholder calculation
}
