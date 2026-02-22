// Firebase Monitoring Utilities
import { doc, getDoc, collection, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getDb } from './firebase.js';

const db = getDb();

export class FirebaseMonitor {
    static async verifyDataSaved(collectionPath, documentId, expectedData) {
        try {
            console.log(`🔍 Verifying data in ${collectionPath}/${documentId}...`);
            
            const docRef = doc(db, collectionPath, documentId);
            const snapshot = await getDoc(docRef);
            
            if (snapshot.exists()) {
                const actualData = snapshot.data();
                console.log('✅ Data found in Firebase:', actualData);
                
                // Compare with expected data
                const matches = this.compareData(expectedData, actualData);
                console.log(matches ? '✅ Data matches expected content' : '⚠️ Data differs from expected');
                
                return {
                    success: true,
                    exists: true,
                    data: actualData,
                    matches,
                    timestamp: actualData.timestamp || actualData.createdAt || 'unknown'
                };
            } else {
                console.log('❌ Data not found in Firebase');
                return {
                    success: false,
                    exists: false,
                    data: null
                };
            }
        } catch (error) {
            console.error('❌ Error verifying data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    static compareData(expected, actual) {
        try {
            return JSON.stringify(expected) === JSON.stringify(actual);
        } catch (error) {
            console.warn('⚠️ Error comparing data:', error);
            return false;
        }
    }
    
    static async listAllCollections() {
        try {
            console.log('📚 Listing all collections...');
            
            const collections = ['crew', 'logs', 'settings', 'test'];
            const results = {};
            
            for (const collectionName of collections) {
                const collectionRef = collection(db, collectionName);
                const snapshot = await getDocs(collectionRef);
                
                results[collectionName] = {
                    count: snapshot.size,
                    documents: []
                };
                
                snapshot.forEach(doc => {
                    results[collectionName].documents.push({
                        id: doc.id,
                        data: doc.data(),
                        lastModified: doc.data().timestamp || doc.data().createdAt || 'unknown'
                    });
                });
            }
            
            console.log('📊 Collections summary:', results);
            return results;
        } catch (error) {
            console.error('❌ Error listing collections:', error);
            return null;
        }
    }
    
    static async searchCrewMember(callsign) {
        try {
            console.log(`👤 Searching for crew member: ${callsign}`);
            
            const crewCollection = collection(db, 'crew');
            const snapshot = await getDocs(crewCollection);
            
            const found = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.callsign && data.callsign.toLowerCase().includes(callsign.toLowerCase())) {
                    found.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            console.log(`🔍 Found ${found.length} crew members matching "${callsign}":`, found);
            return found;
        } catch (error) {
            console.error('❌ Error searching crew:', error);
            return [];
        }
    }
    
    static async getRecentLogs(limit = 10) {
        try {
            console.log(`📝 Getting recent ${limit} log entries...`);
            
            const logsCollection = collection(db, 'logs');
            const q = query(logsCollection, orderBy('createdAt', 'desc'), limit(limit));
            const snapshot = await getDocs(q);
            
            const logs = [];
            snapshot.forEach(doc => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📊 Found ${logs.length} recent logs:`, logs);
            return logs;
        } catch (error) {
            console.error('❌ Error getting recent logs:', error);
            return [];
        }
    }
    
    static setupRealtimeListener(collectionPath, callback) {
        try {
            console.log(`👂 Setting up realtime listener for ${collectionPath}...`);
            
            const collectionRef = collection(db, collectionPath);
            const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
                const changes = [];
                
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        changes.push({
                            type: 'added',
                            id: change.doc.id,
                            data: change.doc.data()
                        });
                    } else if (change.type === 'modified') {
                        changes.push({
                            type: 'modified', 
                            id: change.doc.id,
                            data: change.doc.data()
                        });
                    } else if (change.type === 'removed') {
                        changes.push({
                            type: 'removed',
                            id: change.doc.id
                        });
                    }
                });
                
                console.log(`🔄 Realtime changes in ${collectionPath}:`, changes);
                callback(changes);
            });
            
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up listener:', error);
            return null;
        }
    }
    
    static async generateReport() {
        try {
            console.log('📈 Generating Firebase data report...');
            
            const collections = await this.listAllCollections();
            const recentLogs = await this.getRecentLogs(5);
            
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalCollections: Object.keys(collections || {}).length,
                    totalCrew: collections?.crew?.count || 0,
                    totalLogs: collections?.logs?.count || 0,
                    recentActivity: recentLogs.length
                },
                collections,
                recentLogs,
                recommendations: this.generateRecommendations(collections)
            };
            
            console.log('📊 Firebase Report:', report);
            return report;
        } catch (error) {
            console.error('❌ Error generating report:', error);
            return null;
        }
    }
    
    static generateRecommendations(collections) {
        const recommendations = [];
        
        if (!collections) return recommendations;
        
        if (collections.crew?.count === 0) {
            recommendations.push('⚠️ No crew members found - add some crew to test functionality');
        }
        
        if (collections.logs?.count === 0) {
            recommendations.push('⚠️ No log entries found - complete some missions to generate logs');
        }
        
        if (collections.test?.count > 10) {
            recommendations.push('🧹 Consider cleaning up test collection to save storage');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Everything looks good!');
        }
        
        return recommendations;
    }
}

// Export for browser console
window.FirebaseMonitor = FirebaseMonitor;
