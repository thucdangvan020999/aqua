// server/index.js
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory (not ../website)
app.use(express.static(path.join(__dirname, '..')));

// --- Admin Authentication Setup ---
const ADMIN_USERS_FILE = path.join(__dirname, 'admin_users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'aquatech_super_secret_jwt_key_2025';

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
async function ensureDataDirectory() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log('Created data directory');
    }
}

// Helper to read admin users
async function getAdminUsers() {
    try {
        const data = await fs.readFile(ADMIN_USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(ADMIN_USERS_FILE, JSON.stringify([]));
            return [];
        }
        console.error('Error reading admin users file:', error);
        return [];
    }
}

// Helper to write admin users
async function saveAdminUsers(users) {
    await fs.writeFile(ADMIN_USERS_FILE, JSON.stringify(users, null, 2));
}

// Initial admin user setup
async function setupInitialAdmin() {
    const users = await getAdminUsers();
    if (users.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        users.push({ 
            username: 'admin', 
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });
        await saveAdminUsers(users);
        console.log('✅ Initial admin user created:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   ⚠️  Please change this password after first login!');
    }
}

// Admin Login Endpoint
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        const users = await getAdminUsers();
        const user = users.find(u => u.username === username);

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { username: user.username }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );
            res.json({ success: true, token, username: user.username });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Middleware to protect admin routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// --- Form Submission Handling ---
const FORM_REQUESTS_FILE = path.join(DATA_DIR, 'form_requests.json');

// Helper to read form requests
async function getFormRequests() {
    try {
        const data = await fs.readFile(FORM_REQUESTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(FORM_REQUESTS_FILE, JSON.stringify([]));
            return [];
        }
        throw error;
    }
}

// Helper to save form requests
async function saveFormRequests(requests) {
    await fs.writeFile(FORM_REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

// Endpoint to receive form submissions
app.post('/api/submit-form', async (req, res) => {
    try {
        const formData = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'phone', 'email', 'message'];
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                return res.status(400).json({ 
                    success: false,
                    message: `Trường ${field} là bắt buộc` 
                });
            }
        }

        const timestamp = new Date().toISOString();
        const newRequest = { 
            id: Date.now(), 
            timestamp,
            status: 'new',
            ...formData 
        };

        const requests = await getFormRequests();
        requests.push(newRequest);
        await saveFormRequests(requests);

        console.log('📝 New form submission received:', {
            id: newRequest.id,
            name: newRequest.name,
            email: newRequest.email,
            service: newRequest.service
        });

        res.status(200).json({ 
            success: true,
            message: 'Yêu cầu của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.' 
        });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.' 
        });
    }
});

// Endpoint to get form requests (protected)
app.get('/api/admin/requests', authenticateToken, async (req, res) => {
    try {
        const requests = await getFormRequests();
        // Sort by timestamp, newest first
        requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Error retrieving requests:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error retrieving form requests' 
        });
    }
});

// Endpoint to update request status (protected)
app.patch('/api/admin/requests/:id', authenticateToken, async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { status } = req.body;
        
        const requests = await getFormRequests();
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
            return res.status(404).json({ 
                success: false,
                message: 'Request not found' 
            });
        }
        
        requests[requestIndex].status = status;
        requests[requestIndex].updatedAt = new Date().toISOString();
        
        await saveFormRequests(requests);
        
        res.json({ 
            success: true,
            message: 'Request status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating request' 
        });
    }
});

// Endpoint to delete a specific form request (protected)
app.delete('/api/admin/requests/:id', authenticateToken, async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        
        const requests = await getFormRequests();
        const initialLength = requests.length;
        const filteredRequests = requests.filter(req => req.id !== requestId);

        if (filteredRequests.length < initialLength) {
            await saveFormRequests(filteredRequests);
            res.json({ 
                success: true,
                message: 'Request deleted successfully' 
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: 'Request not found' 
            });
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting request' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0' 
    });
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Fallback route - serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
    });
});




// Function to send message via Telegram
async function sendTelegramNotification(message) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('Telegram credentials not configured');
        return;
    }
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML' // Allows HTML formatting
            })
        });
        
        if (response.ok) {
            console.log('Telegram notification sent successfully');
        } else {
            const errorData = await response.json();
            console.error('Failed to send Telegram notification:', errorData);
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}

// Optional: Telegram webhook endpoint (if you want to receive messages)
app.post('/telegram-webhook', (req, res) => {
    try {
        const { message } = req.body;
        
        if (message && message.text) {
            console.log('Received Telegram message:', message.text);
            console.log('From user:', message.from.first_name, message.from.username);
            
            // You can add auto-reply logic here
            // sendTelegramNotification('Thank you for your message!');
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Telegram webhook error:', error);
        res.sendStatus(500);
    }
});

// Update your contact form handler to include Telegram notification
app.post('/submit-contact', async (req, res) => {
    try {
        const { name, company, phone, email, service, message } = req.body;
        
        // Validate required fields
        if (!name || !phone || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' 
            });
        }
        
        // Create new request object
        const newRequest = {
            id: Date.now(), // Simple ID generation
            name,
            company: company || '',
            phone,
            email,
            service: service || '',
            message: message || '',
            timestamp: new Date().toISOString()
        };
        
        // Read existing requests
        let requests = [];
        const requestsFile = path.join(__dirname, 'data', 'form_requests.json');
        
        if (fs.existsSync(requestsFile)) {
            const data = fs.readFileSync(requestsFile, 'utf8');
            requests = JSON.parse(data);
        }
        
        // Add new request
        requests.push(newRequest);
        
        // Save to file
        fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
        
        // Send Telegram notification with HTML formatting
        const notificationMessage = `🔔 <b>Yêu cầu liên hệ mới từ AquaTech</b>

👤 <b>Tên:</b> ${name}
🏢 <b>Công ty:</b> ${company || 'Không có'}
📞 <b>SĐT:</b> ${phone}
📧 <b>Email:</b> ${email}
🛠️ <b>Dịch vụ:</b> ${service || 'Không xác định'}
💬 <b>Tin nhắn:</b> ${message || 'Không có'}

⏰ <i>${new Date().toLocaleString('vi-VN')}</i>`;
        
        await sendTelegramNotification(notificationMessage);
        
        res.json({ 
            success: true, 
            message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.' 
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Có lỗi xảy ra. Vui lòng thử lại sau.' 
        });
    }
});

// --- Start the server ---
async function startServer() {
    try {
        await ensureDataDirectory();
        await setupInitialAdmin();
        
        app.listen(PORT, () => {
            console.log('🚀 AquaTech Solutions Server Started!');
            console.log(`📍 Server running on: http://localhost:${PORT}`);
            console.log(`📁 Serving files from: ${path.join(__dirname, '..')}`);
            console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();