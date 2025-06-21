const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static filesn
const staticPath = path.join(__dirname);
console.log('📂 staticPath:', staticPath); // ← đặt ở đây
app.use(express.static(staticPath));
// Cho phép truy cập thư mục Admin qua /Admin
app.use('/Admin', express.static(path.join(__dirname, 'Admin')));
// Route test
app.get('/test', (req, res) => {
    res.sendFile(path.join(staticPath, 'Admin/quanlytruyenchuong.html'));
});

// Kết nối MongoDB
mongoose.connect('mongodb+srv://Pegatoon:Pegatoon123@pegatoon.pbnmuen.mongodb.net/myDB?retryWrites=true&w=majority&appName=Pegatoon')
    .then(() => console.log('✅ Kết nối MongoDB thành công'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Schema User
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String
});
const User = mongoose.model('User', UserSchema);

// API lấy danh sách user MongoDB
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// API Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });

        if (user) {
            res.json({ success: true, role: user.role });
        } else {
            res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
        }
    } catch (err) {
        console.error('❌ Lỗi API /login:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Tạo OTP random
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// API lấy mã OTP
app.get('/generate-otp', (req, res) => {
    const otp = generateOTP();
    console.log('📨 Mã OTP:', otp);
    res.json({ success: true, otp });
});

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('./datn-1fc4c-firebase-adminsdk-fbsvc-0d68c27dc6.json')),
    databaseURL: 'https://datn-1fc4c-default-rtdb.asia-southeast1.firebasedatabase.app'
});
console.log('✅ Firebase Admin đã kết nối thành công');

// Khởi tạo Realtime Database
const db = admin.database();

// API lấy danh sách user Firebase
app.get('/api/firebase-users', async (req, res) => {
    try {
        const listUsers = await admin.auth().listUsers();
        res.json(listUsers.users);
    } catch (err) {
        console.error('❌ Lỗi API /api/firebase-users:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
// API lấy danh sách mangas
app.get('/api/mangas', async (req, res) => {
    try {
        const snapshot = await db.ref('mangas').once('value');
        const mangasData = snapshot.val();

        // Chuyển dữ liệu từ object sang mảng
        const mangas = [];
        for (let id in mangasData) {
            mangas.push({ id, ...mangasData[id] });
        }

        res.json(mangas);
    } catch (err) {
        console.error('❌ Lỗi lấy danh sách manga:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// API lấy danh sách truyện
app.post('/api/mangas', async (req, res) => {
    try {
        const newManga = req.body;
        const ref = db.ref('mangas').push();
        await ref.set(newManga);
        res.json({ success: true, id: ref.key });
    } catch (err) {
        console.error('❌ Lỗi thêm manga:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
app.delete('/api/mangas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await db.ref('mangas/' + id).remove();
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Lỗi xoá manga:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
// API cập nhật manga theo id
app.put('/api/mangas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        await db.ref('mangas/' + id).update(updatedData);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Lỗi cập nhật manga:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Server listen
app.listen(3000, () => {
    console.log('🚀 Server chạy ở cổng 3000');
});
console.log('📂 staticPath:', staticPath);

