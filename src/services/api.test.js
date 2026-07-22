import { checkPasswordStrength, eventsAPI } from './api';

describe('checkPasswordStrength', () => {
  test('flags a short, simple password as Weak', () => {
    const result = checkPasswordStrength('abc');
    expect(result.isStrong).toBe(false);
    expect(result.label).toBe('Weak');
  });

  test('flags a password missing variety as Fair or Good, not Strong', () => {
    const result = checkPasswordStrength('alllowercase');
    expect(result.isStrong).toBe(false);
  });

  test('flags a long password with upper/lower/number/special as Strong', () => {
    const result = checkPasswordStrength('Str0ng!Pass');
    expect(result.isStrong).toBe(true);
    expect(result.label).toBe('Strong');
  });

  test('score increases monotonically as more character classes are added', () => {
    const weak = checkPasswordStrength('aaaaaaaa');       // lowercase + length only
    const medium = checkPasswordStrength('Aaaaaaaa1');     // + upper + number
    const strong = checkPasswordStrength('Aaaaaaaa1!');    // + special
    expect(medium.score).toBeGreaterThan(weak.score);
    expect(strong.score).toBeGreaterThan(medium.score);
  });
});

describe('eventsAPI.checkRoomConflict', () => {
  // Use a fixed future date so this test doesn't depend on "today" and won't
  // collide with any of the app's seeded mock events (which are relative to
  // Date.now() and could shift into/out of range as time passes).
  const TEST_DATE = new Date(Date.now() + 60 * 86400000).toISOString(); // 60 days out

  test('reports no conflict when the venue is free at that time', async () => {
    const result = await eventsAPI.checkRoomConflict({
      location: '__Test Venue Never Used__',
      date: TEST_DATE,
      time: '10:00 AM',
      endTime: '12:00 PM',
    });
    expect(result.hasConflict).toBe(false);
    expect(result.conflicts).toEqual([]);
  });

  test('detects a direct time overlap at the same venue', async () => {
    const location = '__Test Conflict Venue__';

    // First booking: 10:00–12:00. We can't call a "create" helper here
    // without an admin user object, so we simulate the scenario the same
    // way checkRoomConflict itself is tested against: by checking a
    // request that would overlap a *known* seeded event instead.
    // HackBMSCE 2025 is seeded at 'CSE Block, BMSCE', 09:00 AM, no explicit
    // endTime (defaults to a 3-hour block => conflicts with anything
    // between ~08:00–13:00 once the 1-hour buffer is applied).
    const result = await eventsAPI.checkRoomConflict({
      location: 'CSE Block, BMSCE',
      date: new Date(Date.now() + 2 * 86400000).toISOString(), // matches HackBMSCE's seeded date
      time: '11:00 AM', // overlaps the buffered 08:00–13:00 window
      endTime: '12:00 PM',
    });
    expect(result.hasConflict).toBe(true);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].title).toBe('HackBMSCE 2025');
  });

  test('respects the 1-hour buffer between back-to-back events at the same venue', async () => {
    // HackBMSCE 2025 runs 09:00 AM with an implicit 3-hour block => ends ~12:00,
    // then a 1-hour buffer extends the "blocked" window to 13:00. A request
    // starting exactly at 12:30 (inside the buffer) should still conflict.
    const result = await eventsAPI.checkRoomConflict({
      location: 'CSE Block, BMSCE',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      time: '12:30 PM',
      endTime: '02:00 PM',
    });
    expect(result.hasConflict).toBe(true);
  });

  test('allows booking well outside the buffered window on the same day', async () => {
    const result = await eventsAPI.checkRoomConflict({
      location: 'CSE Block, BMSCE',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      time: '06:00 PM', // well after the 13:00 buffered cutoff
      endTime: '08:00 PM',
    });
    expect(result.hasConflict).toBe(false);
  });

  test('ignores events at a different venue on the same day/time', async () => {
    const result = await eventsAPI.checkRoomConflict({
      location: '__Totally Different Room__',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      time: '11:00 AM',
      endTime: '12:00 PM',
    });
    expect(result.hasConflict).toBe(false);
  });
});
