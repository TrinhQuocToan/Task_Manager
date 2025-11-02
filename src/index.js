require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const app = express();
const port = 3000;

const SortMiddleware = require('./app/middleware/sortMiddleware');
const router = require('./routers');
const db = require('./config/db');
const passport = require('./app/middleware/passport');

const exphbs = require('express-handlebars');
const hbsHelpers = require('./helpers/handlebars');
// Cấu hình handlebars
const hbs = handlebars.create({
    extname: '.hbs',
    helpers: {
        ...hbsHelpers,
        sum: (a, b) => a + b,
        sortable: (field, sort) => {
            const sortType = field === sort.column ? sort.type : 'default';
            
            const icons = {
                default: 'fas fa-sort',
                asc: 'fas fa-sort-up',
                desc: 'fas fa-sort-down'
            };

            const types = {
                default: 'asc',
                asc: 'desc',
                desc: 'default'
            };

            const icon = icons[sortType];
            const type = types[sortType];

            const sortQuery = type === 'default' 
                ? ''  // Trạng thái mặc định: không có query sort
                : `&column=${field}&type=${type}`; // Có sort: thêm params

            return `<a href="?_sort${sortQuery}">
                        <i class="${icon}"></i>
                    </a>`;
        },
        formatDate: function(date) {
            return new Date(date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        formatCurrency: function(amount) {
            if (amount === undefined || amount === null) {
                return '0 ₫';
            }
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ₫';
        },
        moment: function(date, format) {
            return moment(date).format(format);
        },
        eq: function(a, b) {
            return a === b;
        },
        formatDate: (date) => {
            if (!date) return '';
            return moment(date).format('DD/MM/YYYY');
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cấu hình session với MongoStore
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/F8_education_dev', // URL MongoDB của bạn
        ttl: 24 * 60 * 60, // Thời gian session tồn tại (1 ngày)
        autoRemove: 'native' // Tự động xóa session hết hạn
    }),
    cookie: {
        secure: false, // Set true nếu dùng HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    }
}));

app.use(flash());

// Cấu hình Passport sau session
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

app.use(SortMiddleware);

// Middleware để lưu user vào locals
app.use((req, res, next) => {
    res.locals.user = req.user || req.session.user;
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
    };
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Sử dụng cấu hình handlebars
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    helpers: {
        ...hbsHelpers,
        sum: (a, b) => a + b,
        eq: (a, b) => a === b,
        lt: (a, b) => a < b,
        multiply: (a, b) => a * b,
        formatCurrency: (number) => {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        moment: (date, format) => {
            if (!date) return '';
            return moment(date).format(format);
        },
        formatDate: (date) => {
            if (!date) return '';
            return moment(date).format('DD/MM/YYYY');
        }
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resource', 'views'));

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
