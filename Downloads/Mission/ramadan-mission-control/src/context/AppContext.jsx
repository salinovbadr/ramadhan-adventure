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
    saveDayMissions,
    getPerfectStreak,
    getTotalStars,
    getTeamTotalStars,
    getTeamMaxStars,
    syncFromFirebase,
    syncToFirebase,
} from '../utils/storage';
import { isFirebaseReady } from '../utils/firebase';
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

    // Reload state function
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

    // Sync on app load and on changes
    useEffect(() => {
        initializeApp();
        reloadState();
        // Try to sync from Firebase on load
        if (isFirebaseReady()) {
            syncFromFirebase().then(ok => {
                if (ok) reloadState(); // Reload if remote was newer
            });
        }
        setInitialized(true);
    }, []); // Remove reloadState from dependency array

    // Auto-sync to Firebase on changes (debounced)
    useEffect(() => {
        if (!isFirebaseReady()) return;
        const timeout = setTimeout(() => {
            syncToFirebase();
        }, 2000); // 2 seconds debounce
        return () => clearTimeout(timeout);
    }, [crew, logs, settings, customMissions, missionOverrides]);

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
        
        // Use saveDayMissions instead of direct setData
        saveDayMissions(userId, day, missionData, totalXP);
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
        const created = addMember(member);
        return created;
    }, [addMember]);

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
        getMissionLog,
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
