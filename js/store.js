/**
 * store.js — Quản lý dữ liệu: localStorage + xuất/nhập JSON
 */

const STORAGE_KEY = 'birthday-reminder-data';

// Dữ liệu mẫu ban đầu
const SAMPLE_DATA = [
  {
    id: 'sample1',
    name: 'Mẹ',
    birthday: '1965-03-15',
    group: 'family',
    emoji: '👩',
    note: 'Mua hoa và bánh kem cho mẹ nhé!',
  },
  {
    id: 'sample2',
    name: 'Nguyễn Văn An',
    birthday: '1995-06-25',
    group: 'friend',
    emoji: '👦',
    note: 'Bạn thân từ hồi cấp 3',
  },
  {
    id: 'sample3',
    name: 'Trần Thị Bình',
    birthday: '1990-07-10',
    group: 'colleague',
    emoji: '👩‍💼',
    note: 'Đồng nghiệp cùng phòng',
  },
  {
    id: 'sample4',
    name: 'Bố',
    birthday: '1960-12-01',
    group: 'family',
    emoji: '👨',
    note: '',
  },
  {
    id: 'sample5',
    name: 'Lê Minh Tuấn',
    birthday: '1998-06-19',
    group: 'friend',
    emoji: '🧑',
    note: 'Sinh nhật gần rồi đấy!',
  },
];

/**
 * Lấy tất cả dữ liệu
 */
export function getAllPeople() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Khởi tạo với dữ liệu mẫu
      savePeople(SAMPLE_DATA);
      return SAMPLE_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Lưu toàn bộ danh sách
 */
export function savePeople(people) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

/**
 * Thêm một người mới
 */
export function addPerson(person) {
  const people = getAllPeople();
  people.push(person);
  savePeople(people);
  return people;
}

/**
 * Cập nhật thông tin một người (theo id)
 */
export function updatePerson(updated) {
  const people = getAllPeople();
  const idx = people.findIndex(p => p.id === updated.id);
  if (idx === -1) return people;
  people[idx] = updated;
  savePeople(people);
  return people;
}

/**
 * Xóa một người (theo id)
 */
export function deletePerson(id) {
  const people = getAllPeople().filter(p => p.id !== id);
  savePeople(people);
  return people;
}

/**
 * Xuất dữ liệu ra file JSON
 */
export function exportJSON() {
  const people = getAllPeople();
  const data = {
    version: '1.0',
    exported: new Date().toISOString(),
    count: people.length,
    people,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `birthday-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Nhập dữ liệu từ file JSON
 * @returns {Promise<{imported: number, total: number}>}
 */
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        let incoming = [];

        // Hỗ trợ cả format có wrapper lẫn array thuần
        if (Array.isArray(json)) {
          incoming = json;
        } else if (json.people && Array.isArray(json.people)) {
          incoming = json.people;
        } else {
          throw new Error('Định dạng file không hợp lệ');
        }

        // Validate các trường bắt buộc
        const valid = incoming.filter(p => p.name && p.birthday);
        if (valid.length === 0) throw new Error('Không tìm thấy dữ liệu hợp lệ');

        // Merge: giữ người cũ, thêm người mới (theo id)
        const existing = getAllPeople();
        const existingIds = new Set(existing.map(p => p.id));
        let imported = 0;

        for (const person of valid) {
          if (!person.id) person.id = Date.now().toString(36) + Math.random().toString(36).slice(2);
          if (!existingIds.has(person.id)) {
            existing.push(person);
            imported++;
          }
        }

        savePeople(existing);
        resolve({ imported, total: existing.length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsText(file, 'utf-8');
  });
}
