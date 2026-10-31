// Appointment booking engine — localStorage backed
const BOOKINGS_KEY = 'sfbook:bookings';
const SERVICES_KEY = 'sfbook:services';

// ---------- helpers ----------
export function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ---------- services ----------
export function getServices() {
  const s = read(SERVICES_KEY, null);
  if (s === null) {
    const defaults = [
      { id: 'svc-1', name: 'Consultation', durationMin: 30, price: 50 },
      { id: 'svc-2', name: 'Studio session', durationMin: 60, price: 150 },
      { id: 'svc-3', name: 'Full project', durationMin: 120, price: 500 },
    ];
    write(SERVICES_KEY, defaults);
    return defaults;
  }
  return s;
}

export function saveServices(services) {
  write(SERVICES_KEY, services);
}

export function addService(name, durationMin, price) {
  const services = getServices();
  const svc = {
    id: 'svc-' + Date.now().toString(),
    name,
    durationMin: Number(durationMin) || 30,
    price: Number(price) || 0,
  };
  services.push(svc);
  saveServices(services);
  return svc;
}

export function deleteService(id) {
  saveServices(getServices().filter((s) => s.id !== id));
}

// ---------- bookings ----------
export function getBookings() {
  return read(BOOKINGS_KEY, []);
}

export function saveBookings(bookings) {
  write(BOOKINGS_KEY, bookings);
}

export function addBooking({ serviceId, date, time, name, email, phone, notes }) {
  const bookings = getBookings();
  const svc = getServices().find((s) => s.id === serviceId);
  const booking = {
    id: 'bk-' + Date.now().toString(),
    serviceId,
    serviceName: svc ? svc.name : 'Service',
    durationMin: svc ? svc.durationMin : 30,
    price: svc ? svc.price : 0,
    date,
    time,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    notes: (notes || '').trim(),
    status: 'pending', // pending | confirmed | cancelled
    created: new Date().toISOString(),
  };
  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

export function setBookingStatus(id, status) {
  const bookings = getBookings().map((b) =>
    b.id === id ? { ...b, status } : b
  );
  saveBookings(bookings);
}

export function deleteBooking(id) {
  saveBookings(getBookings().filter((b) => b.id !== id));
}

export function getBookingsForDate(dateStr) {
  return getBookings()
    .filter((b) => b.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));
}

// ---------- time slots ----------
export const DEFAULT_START = '09:00';
export const DEFAULT_END = '17:00';
export const DEFAULT_STEP_MIN = 30;

export function generateSlots(dateStr, serviceId, { start = DEFAULT_START, end = DEFAULT_END, stepMin = DEFAULT_STEP_MIN } = {}) {
  const svc = getServices().find((s) => s.id === serviceId);
  const duration = svc ? svc.durationMin : 30;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const taken = getBookingsForDate(dateStr)
    .filter((b) => b.status !== 'cancelled')
    .map((b) => {
      const [bh, bm] = b.time.split(':').map(Number);
      return { start: bh * 60 + bm, end: bh * 60 + bm + b.durationMin };
    });

  const slots = [];
  for (let m = startMin; m + duration <= endMin; m += stepMin) {
    const s = m;
    const e = m + duration;
    const overlaps = taken.some((t) => s < t.end && e > t.start);
    if (overlaps) continue;
    // skip past times today
    if (dateStr === todayStr()) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (e <= nowMin) continue;
    }
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// ---------- week view ----------
export function getWeekDates(startOffset = 0) {
  const dates = [];
  const base = new Date();
  base.setDate(base.getDate() + startOffset);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push({
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en', { month: 'short' }),
      isToday: i === 0 && startOffset === 0,
    });
  }
  return dates;
}

export function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
}
