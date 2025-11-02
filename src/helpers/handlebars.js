const moment = require('moment');
moment.locale('vi'); // Sử dụng tiếng Việt

const helpers = {
    // Format số tiền thành định dạng tiền tệ VND
    formatCurrency: function(amount) {
        // Kiểm tra nếu amount là undefined hoặc null
        if (amount == null) return '0';
        
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format ngày tháng theo định dạng Việt Nam
    formatDate: (date, format) => {
        if (!date) return '';
        return moment(date).format(format || 'DD/MM/YYYY');
    },

    // Tạo đối tượng Date mới
    new: function() {
        return new Date();
    },

    // Lấy icon cho từng loại danh mục
    getCategoryIcon: (categoryName) => {
        const icons = {
            'Ăn uống': 'fa-utensils',
            'Di chuyển': 'fa-car',
            'Mua sắm': 'fa-shopping-cart',
            'Hóa đơn': 'fa-file-invoice',
            'Giải trí': 'fa-gamepad',
            'Sức khỏe': 'fa-heartbeat',
            'Giáo dục': 'fa-graduation-cap',
            'Lương': 'fa-money-bill-wave',
            'Thưởng': 'fa-gift',
            'Đầu tư': 'fa-chart-line',
            'Khác': 'fa-ellipsis-h'
        };
        return icons[categoryName] || 'fa-tag';
    },

    // Tính phần trăm cho progress bar
    calculatePercentage: (value, total) => {
        if (!value || !total) return 0;
        const percentage = (value / total) * 100;
        return Math.min(percentage, 100); // Giới hạn tối đa 100%
    },

    // Thêm helper "and" để kiểm tra nhiều điều kiện
    and: function() {
        return Array.prototype.every.call(arguments, (argument) => {
            return argument;
        });
    },

    // Kiểm tra nếu là trang hiện tại
    isActivePage: (currentPage, pageName) => {
        return currentPage === pageName ? 'active' : '';
    },

    // Chuyển đổi object/array thành JSON string (cho Chart.js)
    json: function(context) {
        return JSON.stringify(context);
    },

    // Format số tiền không có currency symbol
    formatNumber: (number) => {
        if (number === undefined || number === null) {
            return '0';
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Lấy tên tháng
    getMonthName: (monthNumber) => {
        return moment().month(monthNumber - 1).format('MMMM');
    },

    // Tính tổng mảng số
    sum: (array) => {
        return array.reduce((a, b) => a + b, 0);
    },

    // Kiểm tra giá trị âm/dương
    isPositive: (number) => number > 0,

    // Format phần trăm
    formatPercentage: (value) => {
        return `${Math.round(value)}%`;
    },

    // Lấy năm hiện tại
    currentYear: () => moment().year(),

    // So sánh lớn hơn
    gt: (a, b) => a > b,

    // So sánh nhỏ hơn
    lt: (a, b) => a < b,

    // Kiểm tra null hoặc undefined
    isNull: (value) => value === null || value === undefined,

    // Kiểm tra mảng rỗng
    isEmpty: (array) => !array || array.length === 0,

    // Lấy độ dài mảng
    length: (array) => array ? array.length : 0,

    // Lấy ngày hiện tại
    now: function() {
        return new Date();
    },

    // Chuyển đổi giá trị thành chuỗi
    toString: function(value) {
        return value ? value.toString() : '';
    },

    // Trừ hai số
    subtract: (a, b) => a - b,

    // Kiểm tra giá trị âm/dương
    isNegative: (number) => number < 0,
    
    // Thêm helper "or" để lấy giá trị đầu tiên không null/undefined
    or: function(a, b) {
        return a || b;
    },
    
    // Nhân hai số
    multiply: (a, b) => a * b,
    
    // So sánh bằng
    eq: (a, b) => a === b,

    // Thêm các helpers mới cho trang thống kê
    
    // Format dữ liệu cho biểu đồ
    formatChartData: function(data) {
        if (!data) return '{}';
        return JSON.stringify(data);
    },

    // Lấy màu cho loại giao dịch
    getTransactionTypeColor: function(type) {
        return type === 'income' ? 'text-success' : 'text-danger';
    },

    // Lấy tên loại giao dịch
    getTransactionTypeName: function(type) {
        return type === 'income' ? 'Thu' : 'Chi';
    },

    // Format số tiền cho biểu đồ
    formatChartAmount: function(amount) {
        return amount ? amount : 0;
    },

    // Tính tổng theo loại giao dịch
    sumByType: function(transactions, type) {
        if (!transactions) return 0;
        return transactions
            .filter(t => t.type === type)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
    },

    // Tính phần trăm cho biểu đồ tròn
    calculatePercentageForChart: function(amount, total) {
        if (!amount || !total) return 0;
        return Math.round((amount / total) * 100);
    },

    // Format ngày cho biểu đồ
    formatChartDate: function(date) {
        return moment(date).format('DD/MM');
    },

    // Kiểm tra có dữ liệu không
    hasData: function(data) {
        return data && (
            (Array.isArray(data) && data.length > 0) ||
            (typeof data === 'object' && Object.keys(data).length > 0)
        );
    },

    // Format số tiền với dấu +/-
    formatAmountWithSign: function(amount) {
        if (!amount) return '+0';
        return amount >= 0 ? `+${helpers.formatCurrency(amount)}` : helpers.formatCurrency(amount);
    },

    // Tính số dư
    calculateBalance: function(income, expense) {
        return income - expense;
    },

    // Kiểm tra có lãi hay không
    isProfit: function(balance) {
        return balance > 0;
    },

    // Format phần trăm tăng giảm
    formatGrowthPercentage: function(current, previous) {
        if (!previous) return '+0%';
        const growth = ((current - previous) / previous) * 100;
        return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    }
};

module.exports = helpers;
