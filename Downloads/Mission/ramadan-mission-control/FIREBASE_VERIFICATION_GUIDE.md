# Firebase Data Verification Guide

## 📋 Cara Memastikan Data Tersimpan di Firebase

### 🔧 Method 1: Browser Console (Recommended)

#### 1. Buka HTTPS Localhost
```
https://localhost:5173
```

#### 2. Buka Developer Console
- Tekan `F12` atau `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
- Pilih tab `Console`

#### 3. Generate Complete Report
```javascript
// Generate comprehensive Firebase report
await FirebaseMonitor.generateReport()
```

#### 4. Verifikasi Data Spesifik
```javascript
// List all collections and their data
await FirebaseMonitor.listAllCollections()

// Cari crew member tertentu
await FirebaseMonitor.searchCrewMember('nama-callsign')

// Dapatkan recent logs
await FirebaseMonitor.getRecentLogs(10)
```

#### 5. Real-time Monitoring
```javascript
// Setup real-time listener untuk crew changes
const unsubscribe = FirebaseMonitor.setupRealtimeListener('crew', (changes) => {
    console.log('🔄 Crew changes detected:', changes);
});

// Stop listening (optional)
// unsubscribe();
```

### 🔥 Method 2: Firebase Console (Web Interface)

#### 1. Buka Firebase Console
```
https://console.firebase.google.com
```

#### 2. Select Project
- Pilih project: `ramadhan-mission`

#### 3. Buka Firestore Database
- Di sidebar, klik `Firestore Database`
- Pilih tab `Data`

#### 4. Browse Collections
- **crew**: Data crew members
- **logs**: Mission completion logs
- **settings**: App settings
- **test**: Test data

### 📱 Method 3: Test Data Creation & Verification

#### 1. Create Test Data
```javascript
// Buat test data
await FirebaseTestUtils.createTestData()
```

#### 2. Verify Test Data
```javascript
// Verifikasi test data tersimpan
await FirebaseMonitor.verifyDataSaved('crew', 'test-user-123', {
    callsign: 'Test Pilot',
    avatar: 'astronaut',
    difficulty: 'cadet'
})
```

### 🔍 Method 4: Step-by-Step Verification

#### Step 1: Test Connection
```javascript
// Test koneksi Firebase
await FirebaseTestUtils.testConnection()
```

#### Step 2: Add Crew Member
```javascript
// Tambah crew member di app
// Kemudian verifikasi:
await FirebaseMonitor.listAllCollections()
```

#### Step 3: Complete Mission
```javascript
// Complete mission di app
// Kemudian check logs:
await FirebaseMonitor.getRecentLogs(5)
```

#### Step 4: Verify Settings
```javascript
// Ubah settings di app
// Kemudian verify:
await FirebaseMonitor.verifyDataSaved('settings', 'app', expectedSettings)
```

### 📊 Expected Console Output

#### Successful Connection:
```
🔥 Testing Firebase connection...
✅ Firebase connection test successful: {
  timestamp: "2026-02-22T06:10:00.000Z",
  message: "Connection test successful!",
  test: true
}
```

#### Data Verification:
```
🔍 Verifying data in crew/user-123...
✅ Data found in Firebase: {
  callsign: "Test Pilot",
  avatar: "astronaut",
  difficulty: "cadet",
  createdAt: "2026-02-22T06:10:00.000Z"
}
✅ Data matches expected content
```

#### Collections Summary:
```
📚 Listing all collections...
📊 Collections summary: {
  crew: { count: 2, documents: [...] },
  logs: { count: 5, documents: [...] },
  settings: { count: 1, documents: [...] },
  test: { count: 0, documents: [] }
}
```

### ⚠️ Troubleshooting

#### Error: "No data found"
```javascript
// Check if Firebase is initialized
await FirebaseTestUtils.testConnection()

// List all collections to see what exists
await FirebaseMonitor.listAllCollections()
```

#### Error: "Permission denied"
- Pastikan Firebase Firestore rules allow read/write
- Check Firebase Console → Firestore → Rules

#### Error: "Connection failed"
- Pastikan menggunakan HTTPS (https://localhost:5173)
- Check SSL certificate acceptance
- Verify Firebase config di firebase-config.js

### 🎯 Quick Verification Checklist

- [ ] HTTPS localhost berjalan (https://localhost:5173)
- [ ] Firebase connection test successful
- [ ] Test data creation works
- [ ] Data appears in Firebase Console
- [ ] Real-time updates work
- [ ] Collections have expected data

### 📞 Help Commands

```javascript
// Quick help - semua available commands
console.log('Available commands:');
console.log('FirebaseTestUtils:', Object.getOwnPropertyNames(FirebaseTestUtils));
console.log('FirebaseMonitor:', Object.getOwnPropertyNames(FirebaseMonitor));

// Quick status check
await FirebaseMonitor.generateReport()
```

---

**Tips**: Gunakan `await` untuk semua async operations dan buka browser console untuk melihat detailed logs!
