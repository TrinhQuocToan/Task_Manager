require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;

const SortMiddleware = require('./app/middleware/sortMiddleware');
const router = require('./routers');
const db = require('./config/db');
const passport = require('./app/middleware/passport');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cấu hình CORS cho frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Cấu hình session với MongoStore
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/F8_education_dev',
        ttl: 24 * 60 * 60, // Thời gian session tồn tại (1 ngày)
        autoRemove: 'native' // Tự động xóa session hết hạn
    }),
    cookie: {
        secure: false, // Set true nếu dùng HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    }
}));

// Cấu hình Passport sau session
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use(SortMiddleware);

router(app);

// Kết nối DB       
db.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Cannot connect to database:', error);
        process.exit(1);
    });  
