// Format utilities
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) {
    return '0 ₫';
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ₫';
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  return `${day}/${month}/${year}`;
};

export const formatNumber = (number) => {
  if (number === undefined || number === null) {
    return '0';
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const calculatePercentage = (value, total) => {
  if (!value || !total) return 0;
  return Math.min((value / total) * 100, 100);
};

