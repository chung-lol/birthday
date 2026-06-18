/**
 * utils.js — Tiện ích ngày tháng, format, helper
 */

/**
 * Tính số ngày còn lại đến sinh nhật tiếp theo
 * @param {string} birthday - "MM-DD" hoặc "YYYY-MM-DD"
 * @returns {number} số ngày còn lại (0 = hôm nay)
 */
export function daysUntilBirthday(birthday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = birthday.split('-');
  let month, day;

  if (parts.length === 3) {
    // YYYY-MM-DD
    month = parseInt(parts[1], 10) - 1;
    day   = parseInt(parts[2], 10);
  } else {
    // MM-DD
    month = parseInt(parts[0], 10) - 1;
    day   = parseInt(parts[1], 10);
  }

  const thisYear  = today.getFullYear();
  let nextBirthday = new Date(thisYear, month, day);
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday = new Date(thisYear + 1, month, day);
    nextBirthday.setHours(0, 0, 0, 0);
  }

  const diff = nextBirthday - today;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Lấy ngày sinh nhật tiếp theo (Date object)
 */
export function getNextBirthday(birthday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = birthday.split('-');
  let month, day;

  if (parts.length === 3) {
    month = parseInt(parts[1], 10) - 1;
    day   = parseInt(parts[2], 10);
  } else {
    month = parseInt(parts[0], 10) - 1;
    day   = parseInt(parts[1], 10);
  }

  const thisYear = today.getFullYear();
  let next = new Date(thisYear, month, day);
  next.setHours(0, 0, 0, 0);

  if (next < today) next = new Date(thisYear + 1, month, day);
  return next;
}

/**
 * Format ngày sinh dạng "DD/MM" hoặc "DD/MM/YYYY"
 */
export function formatBirthday(birthday) {
  const parts = birthday.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return `${parts[1].padStart(2,'0')}/${parts[0].padStart(2,'0')}`;
}

/**
 * Tính tuổi (nếu có năm sinh)
 */
export function calcAge(birthday) {
  const parts = birthday.split('-');
  if (parts.length !== 3) return null;

  const birthYear = parseInt(parts[0], 10);
  if (birthYear < 1900 || birthYear > new Date().getFullYear()) return null;

  const today = new Date();
  const month = parseInt(parts[1], 10) - 1;
  const day   = parseInt(parts[2], 10);

  let age = today.getFullYear() - birthYear;
  const hasBirthdayPassed =
    today.getMonth() > month ||
    (today.getMonth() === month && today.getDate() >= day);

  return hasBirthdayPassed ? age : age - 1;
}

/**
 * Lấy cung hoàng đạo theo ngày sinh
 */
export function getZodiac(birthday) {
  if (!birthday) return { name: '', emoji: '' };
  const parts = birthday.split('-');
  let month, day;
  if (parts.length === 3) {
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
  }
  
  const zodiacs = [
    { name: 'Ma Kết', emoji: '♑', start: [12, 22], end: [1, 19] },
    { name: 'Bảo Bình', emoji: '♒', start: [1, 20], end: [2, 18] },
    { name: 'Song Ngư', emoji: '♓', start: [2, 19], end: [3, 20] },
    { name: 'Bạch Dương', emoji: '♈', start: [3, 21], end: [4, 19] },
    { name: 'Kim Ngưu', emoji: '♉', start: [4, 20], end: [5, 20] },
    { name: 'Song Tử', emoji: '♊', start: [5, 21], end: [6, 20] },
    { name: 'Cự Giải', emoji: '♋', start: [6, 21], end: [7, 22] },
    { name: 'Sư Tử', emoji: '♌', start: [7, 23], end: [8, 22] },
    { name: 'Xử Nữ', emoji: '♍', start: [8, 23], end: [9, 22] },
    { name: 'Thiên Bình', emoji: '♎', start: [9, 23], end: [10, 22] },
    { name: 'Thiên Yết', emoji: '♏', start: [10, 23], end: [11, 21] },
    { name: 'Nhân Mã', emoji: '♐', start: [11, 22], end: [12, 21] }
  ];

  for (const z of zodiacs) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === 12 && em === 1) {
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
    }
  }
  return { name: 'Ma Kết', emoji: '♑' };
}

/**
 * Tuổi sắp tới (sinh nhật tiếp theo)
 */
export function calcNextAge(birthday) {
  const age = calcAge(birthday);
  if (age === null) return null;
  return age + 1;
}

/**
 * Format tên nhóm
 */
export const GROUP_LABELS = {
  family:    { label: 'Gia đình', icon: '👨‍👩‍👧' },
  friend:    { label: 'Bạn bè',   icon: '🤝' },
  colleague: { label: 'Đồng nghiệp', icon: '💼' },
  other:     { label: 'Khác',     icon: '🌟' },
};

export function getGroupInfo(group) {
  return GROUP_LABELS[group] || GROUP_LABELS['other'];
}

/**
 * Tạo ID ngẫu nhiên
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Sắp xếp người theo số ngày còn lại
 */
export function sortByUpcoming(people) {
  return [...people].sort((a, b) => {
    return daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday);
  });
}

/**
 * Lọc theo từ khoá tìm kiếm
 */
export function searchFilter(people, query) {
  if (!query.trim()) return people;
  const q = query.toLowerCase().trim();
  return people.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.note && p.note.toLowerCase().includes(q))
  );
}

/**
 * Lọc theo nhóm
 */
export function groupFilter(people, group) {
  if (!group || group === 'all') return people;
  return people.filter(p => p.group === group);
}

/**
 * Lọc theo khoảng thời gian
 */
export function timeFilter(people, period) {
  if (!period || period === 'all') return people;
  return people.filter(p => {
    const days = daysUntilBirthday(p.birthday);
    if (period === 'today')   return days === 0;
    if (period === 'week')    return days <= 7;
    if (period === 'month')   return days <= 30;
    return true;
  });
}

/**
 * Debounce
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
