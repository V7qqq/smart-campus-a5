// @vitest-environment jsdom
// Task 3 (A5): field messages under the time inputs. The UI test also passes on the
// baseline version, so it proves the refactoring did not change what the student sees.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getFieldErrors, checkAvailability } from './lib/bookingLogic';
import { sampleRooms, sampleBookings } from './data/rooms';
import RoomChecker from './components/RoomChecker';

const NOW = 480; // 08:00

function errorsFor(start: number, end: number) {
  const result = checkAvailability('r2', start, end, NOW, sampleRooms, sampleBookings);
  return getFieldErrors(result.violations, start, end, NOW);
}

describe('getFieldErrors', () => {
  it('no messages for a valid slot', () => {
    expect(errorsFor(720, 780)).toEqual({ start: '', end: '', duration: '' });
  });

  it('start not after now', () => {
    expect(errorsFor(480, 540).start).toBe('Must be after 8:00 AM');
  });

  it('end before start shows end message', () => {
    expect(errorsFor(780, 720).end).toBe('Must be after start');
  });

  it('end after midnight', () => {
    expect(errorsFor(1380, 1441).end).toBe('Cannot exceed 24:00');
  });

  it('121 minutes shows duration message, 120 does not', () => {
    expect(errorsFor(720, 841).duration).toBe('Max is 120 min — you have 121 min');
    expect(errorsFor(720, 840).duration).toBe('');
  });

  it('blocked and overlap give no field message (they are in the result panel)', () => {
    const blocked = checkAvailability('r3', 720, 780, NOW, sampleRooms, sampleBookings);
    expect(getFieldErrors(blocked.violations, 720, 780, NOW)).toEqual({ start: '', end: '', duration: '' });
    expect(errorsFor(600, 660)).toEqual({ start: '', end: '', duration: '' });
  });
});

describe('RoomChecker field messages (UI)', () => {
  it('shows duration message when slot is longer than 120 min', () => {
    const { container } = render(<RoomChecker />);
    const [startInput, endInput] = Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
    fireEvent.change(startInput, { target: { value: '12:00' } });
    fireEvent.change(endInput, { target: { value: '14:01' } });
    expect(screen.getByText('Max is 120 min — you have 121 min')).toBeTruthy();
  });

  it('shows start message when start is not after current time', () => {
    const { container } = render(<RoomChecker />);
    const [startInput] = Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
    fireEvent.change(startInput, { target: { value: '07:00' } });
    expect(screen.getByText('Must be after 8:00 AM')).toBeTruthy();
  });
});
