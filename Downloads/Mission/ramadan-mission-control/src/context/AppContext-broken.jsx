import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
    getData,
    setData,
    createDefaultProfile,
    createEmptyMissionLog,
    initializeApp,
    resetAll,
    getActiveUser,
    getMissionLog,
    saveMissionLog,
    getPerfectStreak,
    getTotalStars,
    getTeamTotalStars,
    getTeamMaxStars,
    syncFromFirebase,
    syncToFirebase,
    isFirebaseReady,
} from '../utils/storage';
import { MISSIONS, calculateMissionXP } from '../utils/missions';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [crew, setCrew] = useState([]);
    const [logs, setLogs] = useState({});
    const [settings, setSettings] = useState({});
    const [customMissions, setCustomMissions] = useState([]);
    const [missionOverrides, setMissionOverrides] = useState({});
    const [activeUser, setActiveUserState] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Initialize on mount
    // Sync on app load and on changes
    useEffect(() => {
        initializeApp();
        loadState();
        // Try to sync from Firebase on load
        if (isFirebaseReady()) {
            syncFromFirebase().then(ok => {
                if (ok) loadState(); // Reload if remote was newer
            });
        }
        setInitialized(true);
    }, []);

    // Auto-sync to Firebase on changes (debounced)
    useEffect(() => {
        if (!isFirebaseReady()) return;
        const timeout = setTimeout(() => {
            syncToFirebase();
        }, 2000); // 2 seconds debounce
        return () => clearTimeout(timeout);
    }, [crew, logs, settings, customMissions, missionOverrides]);

    const reloadState = useCallback(() => {
        const c = getData('crew') || [];
        const l = getData('logs') || {};
        const s = getData('settings') || {};
        const cm = getData('custom_missions') || [];
        const mo = s.missionOverrides || {};
        
        setCrew(c);
        setLogs(l);
        setSettings(s);
        setCustomMissions(cm);
        setMissionOverrides(mo);
        setActiveUserState(getActiveUser());
    }, []);

    const allMissions = useMemo(() => {
        const defaultWithOverrides = MISSIONS.map(m => ({ ...m, ...(missionOverrides[m.id] || {}) }));
        return [...defaultWithOverrides, ...customMissions];
    }, [customMissions, missionOverrides]);

    const updateDefaultMission = useCallback((missionId, updates) => {
        const current = getData('settings')?.missionOverrides || {};
        const updated = { ...current, [missionId]: { ...current[missionId], ...updates } };
        setData('settings', { ...getData('settings'), missionOverrides: updated });
        reloadState();
    }, [reloadState]);

    const clearDefaultMissionOverride = useCallback((missionId) => {
        const current = getData('settings')?.missionOverrides || {};
        const { [missionId]: _, ...rest } = current;
        setData('settings', { ...getData('settings'), missionOverrides: rest });
        reloadState();
    }, [reloadState]);

    const setActiveUser = useCallback((userId) => {
        setData('settings', { ...getData('settings'), activeUser: userId });
        reloadState();
    }, [reloadState]);

    const isMissionActiveOnDay = useCallback((mission, day) => {
        if (!mission?.activeDays) return true;
        if (Array.isArray(mission.activeDays) && mission.activeDays.length === 0) return true;
        if (!Array.isArray(mission.activeDays)) return true;
        return mission.activeDays.includes(day);
    }, []);

    const saveDayLog = useCallback((userId, day, missionValues) => {
        const logs = getData('logs') || {};
        const userLog = logs[userId] || createEmptyMissionLog();
        const user = crew.find(m => m.id === userId);
        const diff = user?.difficulty || 'cadet';
        const enabledMissions = settings.enabledMissions;

        let totalXP = 0;
        const missionData = {};

        const applicableMissions = allMissions.filter(m => {
            if (settings.enabledMissions && !settings.enabledMissions.includes(m.id)) return false;
            if (!isMissionActiveOnDay(m, day)) return false;
            if (m.assignedTo && !m.assignedTo.includes(userId)) return false;
            return true;
        });
        applicableMissions.forEach(mission => {
            const val = missionValues[mission.id];
            const xp = calculateMissionXP(mission, val, diff);
            missionData[mission.id] = { value: val, xp };
            totalXP += xp;
        });
        userLog[day] = { completed: false, missions: missionData, xpEarned: totalXP, savedAt: new Date().toISOString() };
        setData('logs', { ...logs, [userId]: userLog });
        reloadState();
    }, [crew, settings, allMissions, reloadState]);

    const addMember = useCallback((member) => {
        const current = getData('crew') || [];
        const exists = current.some(m => m.id === member.id);
        if (exists) return null;
        const updated = [...current, member];
        setData('crew', updated);
        reloadState();
        return member;
    }, [reloadState]);

    const createFirstMember = useCallback((member) => {
        const created = addCrewMember(member);
        return created;
    }, [addCrewMember]);

    const resetAllData = useCallback(() => {
        resetAll();
        reloadState();
    }, [reloadState]);

    const removeMember = useCallback((memberId) => {
        const current = getData('crew') || [];
        const filtered = current.filter(m => m.id !== memberId);
        setData('crew', filtered);
        reloadState();
    }, [reloadState]);

    const updateCrewMember = useCallback((memberId, updates) => {
        const current = getData('crew') || [];
        const idx = current.findIndex(m => m.id === memberId);
        if (idx === -1) return;
        const updated = [...current];
        updated[idx] = { ...updated[idx], ...updates };
        setData('crew', updated);
        reloadState();
    }, [reloadState]);

    const updateAppSettings = useCallback((updates) => {
        setData('settings', { ...getData('settings'), ...updates });
        reloadState();
    }, [reloadState]);

    const addCustomMission = useCallback((mission) => {
        const current = getData('custom_missions') || [];
        setData('custom_missions', [...current, mission]);
        reloadState();
    }, [reloadState]);

    const updateCustomMission = useCallback((missionId, updates) => {
        const current = getData('custom_missions') || [];
        const idx = current.findIndex(m => m.id === missionId);
        if (idx === -1) return;
        const updated = [...current];
        updated[idx] = { ...updated[idx], ...updates };
        setData('custom_missions', updated);
        reloadState();
    }, [reloadState]);

    const removeCustomMission = useCallback((missionId) => {
        const current = getData('custom_missions') || [];
        const filtered = current.filter(m => m.id !== missionId);
        setData('custom_missions', filtered);
        reloadState();
    }, [reloadState]);

    const getTotalStars = useCallback((userId) => {
        return storage.getTotalStars(userId);
    }, [logs]);

    const getPerfectStreak = useCallback((userId) => {
        return storage.getPerfectStreak(userId);
    }, [logs]);

    const getEfficiency = useCallback((userId) => {
        return storage.getCompletionPercent(userId);
    }, [logs]);

    const getUserLog = useCallback((userId) => {
        return logs[userId] || storage.createEmptyMissionLog();
    }, [logs]);

    const getTeamTotalStars = useCallback(() => {
        let total = 0;
        crew.forEach(member => {
            total += storage.getTotalStars(member.id);
        });
        return total;
    }, [crew, logs]);

    const getTeamMaxStars = useCallback(() => {
        const enabledMissions = settings.enabledMissions;

        const isApplicable = (mission, userId, day) => {
            if (enabledMissions && !enabledMissions.includes(mission.id)) return false;
            if (!isMissionActiveOnDay(mission, day)) return false;
            if (mission.assignedTo === undefined || mission.assignedTo === null) return true;
            if (Array.isArray(mission.assignedTo)) return mission.assignedTo.includes(userId);
            return true;
        };

        let total = 0;
        crew.forEach(member => {
            const diff = member.difficulty || 'cadet';
            let memberTotal = 0;
            for (let day = 1; day <= 30; day++) {
                const memberMissions = allMissions.filter(m => isApplicable(m, member.id, day));
                const perDayMax = memberMissions.reduce((sum, m) => {
                    const perCrew = m.perCrew?.[member.id];
                    const defaultTarget = perCrew?.defaultTarget ?? m.defaultTarget;
                    const fullValue = m.type === 'boolean'
                        ? true
                        : { achieved: defaultTarget || 1, target: defaultTarget || 1 };
                    return sum + calculateMissionXP(m, fullValue, diff);
                }, 0);
                memberTotal += perDayMax;
            }
        });

    const value = {
        crew,
        logs,
        settings,
        customMissions,
        missionOverrides,
        activeUser,
        initialized,
        allMissions,
        getTotalStars,
        getPerfectStreak,
        getTeamTotalStars,
        getTeamMaxStars,
        saveDayLog,
        addMember,
        createFirstMember,
        removeMember,
        updateCrewMember,
        updateDefaultMission,
        clearDefaultMissionOverride,
        setActiveUser,
        updateAppSettings,
        addCustomMission,
        updateCustomMission,
        removeCustomMission,
        resetAllData,
        isFirebaseReady,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
