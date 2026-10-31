import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, Plus, Trash2, Check, X, ChevronLeft, ChevronRight,
  User, Mail, Phone, StickyNote, Sparkles, CalendarCheck, ListChecks, Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  getServices, addService, deleteService,
  getBookings, addBooking, setBookingStatus, deleteBooking,
  getBookingsForDate, generateSlots, getWeekDates, todayStr, formatTime, formatDate,
} from '../lib/bookings';

const STATUS_COLORS = {
  pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  confirmed: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export default function Booker() {
  const [tab, setTab] = useState('book');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const refresh = () => {
    setServices(getServices());
    setBookings(getBookings());
  };
  useEffect(() => { refresh(); }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-fit mx-auto">
        {[
          { id: 'book', label: 'Book', icon: CalendarCheck },
          { id: 'schedule', label: 'Schedule', icon: ListChecks },
          { id: 'services', label: 'Services', icon: Settings2 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              tab === t.id
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'book' && (
          <motion.div key="book" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <BookFlow services={services} refresh={refresh} />
          </motion.div>
        )}
        {tab === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <ScheduleView bookings={bookings} refresh={refresh} />
          </motion.div>
        )}
        {tab === 'services' && (
          <motion.div key="services" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <ServicesView services={services} refresh={refresh} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= BOOK FLOW ================= */
function BookFlow({ services, refresh }) {
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!serviceId && services.length) setServiceId(services[0].id);
  }, [services]);

  const slots = useMemo(
    () => (serviceId && date ? generateSlots(date, serviceId) : []),
    [serviceId, date, services]
  );

  const svc = services.find((s) => s.id === serviceId);
  const valid = serviceId && date && time && name.trim() && (email.trim() || phone.trim());

  const handleBook = (e) => {
    e.preventDefault();
    if (!valid) {
      toast.error('Pick a service, date, time, your name and a contact method.');
      return;
    }
    addBooking({ serviceId, date, time, name, email, phone, notes });
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.4 } });
    toast.success(`Booked! ${svc.name} on ${formatDate(date)} at ${formatTime(time)}`);
    setTime('');
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    refresh();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: pick */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Service</label>
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setServiceId(s.id); setTime(''); }}
                className={`w-full text-left rounded-xl border p-4 transition ${
                  serviceId === s.id
                    ? 'border-orange-400/60 bg-orange-400/10'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{s.name}</span>
                  <span className="text-orange-300 font-extrabold">${s.price}</span>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {s.durationMin} min
                </span>
              </button>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-slate-500">No services yet — add some in the Services tab.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Date</label>
          <input
            type="date"
            value={date}
            min={todayStr()}
            onChange={(e) => { setDate(e.target.value); setTime(''); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50 [color-scheme:dark]"
          />
          <p className="text-xs text-slate-500 mt-2">{formatDate(date)}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Available times</label>
          {slots.length === 0 ? (
            <p className="text-sm text-slate-500">No open slots this day — try another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setTime(s)}
                  className={`rounded-lg py-2.5 text-sm font-bold transition ${
                    time === s
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {formatTime(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: form */}
      <form onSubmit={handleBook} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 h-fit">
        <h3 className="font-extrabold text-lg mb-4">Your details</h3>
        <div className="space-y-3">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400/50" />
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400/50" />
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400/50" />
          </div>
          <div className="relative">
            <StickyNote className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400/50 resize-none" />
          </div>
        </div>

        {svc && time && (
          <div className="mt-4 rounded-xl bg-orange-400/10 border border-orange-400/30 p-4 text-sm">
            <div className="flex justify-between font-bold">
              <span>{svc.name}</span>
              <span className="text-orange-300">${svc.price}</span>
            </div>
            <div className="text-slate-400 mt-1">{formatDate(date)} · {formatTime(time)} · {svc.durationMin} min</div>
          </div>
        )}

        <button
          type="submit"
          disabled={!valid}
          className="w-full mt-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <CalendarCheck className="w-5 h-5" /> Confirm booking
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">Name + email or phone required.</p>
      </form>
    </div>
  );
}

/* ================= SCHEDULE VIEW ================= */
function ScheduleView({ bookings, refresh }) {
  const [view, setView] = useState('day');
  const [date, setDate] = useState(todayStr());
  const [weekOffset, setWeekOffset] = useState(0);

  const dayBookings = getBookingsForDate(date);
  const weekDates = getWeekDates(weekOffset);
  const upcoming = bookings
    .filter((b) => b.date >= todayStr() && b.status !== 'cancelled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const handleStatus = (id, status) => {
    setBookingStatus(id, status);
    refresh();
    toast.success(status === 'confirmed' ? 'Booking confirmed ✓' : 'Booking cancelled');
  };

  const handleDelete = (id) => {
    deleteBooking(id);
    refresh();
    toast.success('Booking deleted');
  };

  const renderBooking = (b) => (
    <motion.div
      key={b.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">{formatTime(b.time)}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status]}`}>
              {b.status}
            </span>
          </div>
          <p className="text-sm font-semibold mt-1">{b.serviceName} · {b.durationMin} min · ${b.price}</p>
          <p className="text-sm text-slate-400">{b.name}{b.phone ? ` · ${b.phone}` : ''}{b.email ? ` · ${b.email}` : ''}</p>
          {b.notes && <p className="text-xs text-slate-500 mt-1 italic">“{b.notes}”</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {b.status === 'pending' && (
            <button onClick={() => handleStatus(b.id, 'confirmed')} title="Confirm"
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition">
              <Check className="w-4 h-4" />
            </button>
          )}
          {b.status !== 'cancelled' && (
            <button onClick={() => handleStatus(b.id, 'cancelled')} title="Cancel"
              className="p-2 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleDelete(b.id)} title="Delete"
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {['day', 'week', 'upcoming'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${
                view === v ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {view === 'day' && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none [color-scheme:dark]" />
        )}
        {view === 'week' && (
          <div className="flex gap-2">
            <button onClick={() => setWeekOffset((o) => o - 7)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold">
              This week
            </button>
            <button onClick={() => setWeekOffset((o) => o + 7)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {view === 'day' && (
        <div>
          <h3 className="font-extrabold text-lg mb-3 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-400" /> {formatDate(date)}
          </h3>
          {dayBookings.length === 0 ? (
            <EmptyState text="No bookings this day." />
          ) : (
            <div className="space-y-3">{dayBookings.map(renderBooking)}</div>
          )}
        </div>
      )}

      {view === 'week' && (
        <div className="space-y-4">
          {weekDates.map((d) => {
            const list = getBookingsForDate(d.date);
            return (
              <div key={d.date} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-extrabold ${d.isToday ? 'text-orange-300' : ''}`}>
                    {d.dayName} {d.month} {d.dayNum}
                  </span>
                  {d.isToday && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">TODAY</span>}
                  <span className="text-xs text-slate-500 ml-auto">{list.filter((b) => b.status !== 'cancelled').length} booking(s)</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-slate-600">Nothing scheduled</p>
                ) : (
                  <div className="space-y-2">{list.map(renderBooking)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === 'upcoming' && (
        <div>
          <h3 className="font-extrabold text-lg mb-3">Upcoming</h3>
          {upcoming.length === 0 ? (
            <EmptyState text="Nothing upcoming." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <div key={b.id}>
                  <p className="text-xs text-slate-500 mb-1.5">{formatDate(b.date)}</p>
                  {renderBooking(b)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
      <CalendarDays className="w-10 h-10 mx-auto text-slate-700 mb-3" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

/* ================= SERVICES VIEW ================= */
function ServicesView({ services, refresh }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(50);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addService(name.trim(), duration, price);
    setName('');
    setDuration(30);
    setPrice(50);
    setShowAdd(false);
    refresh();
    toast.success(`"${name.trim()}" added`);
  };

  const handleDelete = (id, svcName) => {
    deleteService(id);
    refresh();
    toast.success(`"${svcName}" removed`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-extrabold text-lg">Your services</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'Add service'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden mb-5"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid sm:grid-cols-3 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50 sm:col-span-3" />
              <label className="block">
                <span className="text-xs text-slate-500">Duration (min)</span>
                <input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50 [color-scheme:dark]" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">Price ($)</span>
                <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50 [color-scheme:dark]" />
              </label>
              <div className="flex items-end">
                <button type="submit" disabled={!name.trim()}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-40">
                  Add
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {services.map((s) => (
          <motion.div key={s.id} layout className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{s.name}</p>
              <p className="text-xs text-slate-500">{s.durationMin} min · ${s.price}</p>
            </div>
            <button onClick={() => handleDelete(s.id, s.name)}
              className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {services.length === 0 && <EmptyState text="No services yet — add your first one." />}
      </div>
    </div>
  );
}
