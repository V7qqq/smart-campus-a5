import { useState, useMemo, useEffect } from 'react';
import { CalendarRange, Info, SearchX } from 'lucide-react';
import type { Room, Booking } from '@/lib/bookingLogic';
import { checkAvailability, getRoomBookings } from '@/lib/bookingLogic';
import { filterRooms } from '@/lib/filterRooms';
import { MAX_BOOKING_LENGTH } from '@/booking';
import { minutesToLabel, formatTimeLabel } from '@/lib/format';
import { sampleRooms, sampleBookings, getDefaultCurrentTime } from '@/data/rooms';
import FilterPanel from './FilterPanel';
import RoomList from './RoomList';
import TimeSlotPicker from './TimeSlotPicker';
import ResultPanel from './ResultPanel';
import BookingList from './BookingList';
import DayTimeline from './DayTimeline';
import ExplanationPanel from './ExplanationPanel';
import { makeInput } from '@/lib/explanation';

export default function RoomChecker() {
  const [rooms] = useState<Room[]>(sampleRooms);
  const [bookings] = useState<Booking[]>(sampleBookings);
  const [currentTime, setCurrentTime] = useState(getDefaultCurrentTime());
  const [attendees, setAttendees] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const [roomId, setRoomId] = useState(sampleRooms[0].id);
  const [start, setStart] = useState(Math.ceil((currentTime + 30) / 15) * 15);
  const [end, setEnd] = useState(Math.ceil((currentTime + 90) / 15) * 15);

  const visibleRooms = useMemo(
    () => filterRooms(rooms, { attendees, equipment: selectedEquipment }),
    [rooms, attendees, selectedEquipment]
  );

  const visibleRoomIds = useMemo(() => new Set(visibleRooms.map((r) => r.id)), [visibleRooms]);

  // F5: if the selected room is filtered out, fall back to the first visible room.
  useEffect(() => {
    if (!visibleRoomIds.has(roomId) && visibleRooms.length > 0) {
      setRoomId(visibleRooms[0].id);
    }
  }, [visibleRoomIds, roomId, visibleRooms]);

  const selectedRoom = rooms.find((r) => r.id === roomId)!;
  const isRoomVisible = visibleRoomIds.has(roomId);
  const roomBookings = useMemo(() => getRoomBookings(bookings, roomId), [bookings, roomId]);

  // F5: uses ONLY the selected room's bookings.
  const result = useMemo(
    () => checkAvailability(roomId, start, end, currentTime, rooms, bookings),
    [roomId, start, end, currentTime, rooms, bookings]
  );

  const duration = end - start;
  const isAvailable = isRoomVisible && result.decision === 'available';

  const violatedRules = new Set(result.violations.map((v) => v.rule));
  const startError = violatedRules.has('start-not-after-now')
    ? `Must be after ${formatTimeLabel(currentTime)}`
    : '';
  const endError = violatedRules.has('end-not-after-start')
    ? 'Must be after start'
    : violatedRules.has('end-after-midnight')
      ? 'Cannot exceed 24:00'
      : '';
  const durationError = violatedRules.has('too-long')
    ? `Max is ${MAX_BOOKING_LENGTH} min — you have ${duration} min`
    : '';

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const startMinutesStr = minutesToLabel(currentTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-200">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Filter rooms, pick a time slot — availability updates instantly.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 space-y-5">
            <FilterPanel
              attendees={attendees}
              selectedEquipment={selectedEquipment}
              onAttendeesChange={setAttendees}
              onToggleEquipment={toggleEquipment}
            />
            <RoomList
              rooms={rooms}
              visibleRooms={visibleRooms}
              selectedRoomId={roomId}
              onSelect={setRoomId}
            />
            <TimeSlotPicker
              currentTime={currentTime}
              onCurrentTimeChange={setCurrentTime}
              start={start}
              end={end}
              onStartChange={setStart}
              onEndChange={setEnd}
              startError={startError || undefined}
              endError={endError || undefined}
              durationError={durationError || undefined}
            />
          </section>

          <section className="lg:col-span-2 space-y-5">
            {visibleRooms.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
                <SearchX className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 text-base font-semibold text-slate-700">No rooms match your filters</p>
                <p className="mt-1 text-sm text-slate-400">Adjust the filters above to see availability.</p>
              </div>
            ) : (
              <>
                <ResultPanel
                  room={selectedRoom}
                  start={start}
                  end={end}
                  isAvailable={isAvailable}
                  result={result}
                />
                <ExplanationPanel key={JSON.stringify([roomId, start, end, currentTime, result])} input={makeInput(selectedRoom.name, start, end, result)} />
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">
                      Today's schedule — {selectedRoom.name}
                    </h2>
                    <span className="text-xs text-slate-400">07:00 – 22:00</span>
                  </div>
                  <p className="mb-4 text-xs text-slate-400">
                    Your requested slot (blue) shown against existing bookings (gray).
                  </p>
                  <DayTimeline
                    bookings={roomBookings}
                    requestedStart={start}
                    requestedEnd={end}
                    currentTime={currentTime}
                  />
                </div>
                <BookingList roomName={selectedRoom.name} bookings={roomBookings} />
              </>
            )}
          </section>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-sky-50 p-4 text-sm text-sky-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
          <p>
            This is a read-only checker using fictional sample data — no bookings are created or modified.
            Current time: <span className="font-semibold tabular-nums">{startMinutesStr}</span> ({currentTime} min).
            Bookings up to {MAX_BOOKING_LENGTH} minutes are allowed; touching endpoints don't count as overlaps.
          </p>
        </div>
      </main>
    </div>
  );
}
