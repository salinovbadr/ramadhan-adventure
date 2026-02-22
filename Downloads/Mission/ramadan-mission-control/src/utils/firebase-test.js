// Firebase Testing Utilities
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getDb } from './firebase.js';

const db = getDb();

export class FirebaseTestUtils {
    static async testConnection() {
        try {
            console.log('🔥 Testing Firebase connection...');
            
            // Test write
            const testDoc = doc(db, 'test', 'connection-test');
            await setDoc(testDoc, {
                timestamp: new Date().toISOString(),
                message: 'Connection test successful!',
                test: true
            });
            
            // Test read
            const snapshot = await getDoc(testDoc);
            const data = snapshot.data();
            
            console.log('✅ Firebase connection test successful:', data);
            
            // Cleanup
            await deleteDoc(testDoc);
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Firebase connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async testCrewData() {
        try {
            console.log('👥 Testing crew data...');
            
            const crewCollection = collection(db, 'crew');
            const snapshot = await getDocs(crewCollection);
            const crewData = [];
            
            snapshot.forEach(doc => {
                crewData.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Crew data retrieved:', crewData.length, 'members');
            return { success: true, data: crewData };
        } catch (error) {
            console.error('❌ Crew data test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async testLogsData() {
        try {
            console.log('📝 Testing logs data...');
            
            const logsCollection = collection(db, 'logs');
            const snapshot = await getDocs(logsCollection);
            const logsData = [];
            
            snapshot.forEach(doc => {
                logsData.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Logs data retrieved:', logsData.length, 'entries');
            return { success: true, data: logsData };
        } catch (error) {
            console.error('❌ Logs data test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async testSettingsData() {
        try {
            console.log('⚙️ Testing settings data...');
            
            const settingsDoc = doc(db, 'settings', 'app');
            const snapshot = await getDoc(settingsDoc);
            
            if (snapshot.exists()) {
                console.log('✅ Settings data retrieved:', snapshot.data());
                return { success: true, data: snapshot.data() };
            } else {
                console.log('ℹ️ No settings data found');
                return { success: true, data: null };
            }
        } catch (error) {
            console.error('❌ Settings data test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async runAllTests() {
        console.log('🚀 Running Firebase tests...');
        
        const results = {
            connection: await this.testConnection(),
            crew: await this.testCrewData(),
            logs: await this.testLogsData(),
            settings: await this.testSettingsData()
        };
        
        const successCount = Object.values(results).filter(r => r.success).length;
        const totalTests = Object.keys(results).length;
        
        console.log(`📊 Test Results: ${successCount}/${totalTests} tests passed`);
        
        return results;
    }
    
    static async createTestData() {
        try {
            console.log('📦 Creating test data...');
            
            // Test crew member
            const testCrew = doc(db, 'crew', 'test-user-' + Date.now());
            await setDoc(testCrew, {
                callsign: 'Test Pilot',
                avatar: 'astronaut',
                difficulty: 'cadet',
                createdAt: new Date().toISOString()
            });
            
            // Test log entry
            const testLog = doc(db, 'logs', 'test-log-' + Date.now());
            await setDoc(testLog, {
                userId: 'test-user-' + Date.now(),
                date: new Date().toISOString().split('T')[0],
                missions: {
                    'test-mission': { value: true, completedAt: new Date().toISOString() }
                },
                createdAt: new Date().toISOString()
            });
            
            console.log('✅ Test data created successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Test data creation failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use in browser console
window.FirebaseTestUtils = FirebaseTestUtils;
