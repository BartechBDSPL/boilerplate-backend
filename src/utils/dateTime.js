import { DateTime } from 'luxon';

export function formatDateTimeGMT(dateString) {
  if (!dateString) return '-';

  try {
    const dt = DateTime.fromISO(dateString.toString(), { zone: 'UTC' });
    if (!dt.isValid) return '-';

    return dt.toFormat('MM/dd/yyyy, hh:mm:ss a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

export function formatDateGMT(dateString) {
  if (!dateString) return '-';

  try {
    const dt = DateTime.fromISO(dateString.toString(), { zone: 'UTC' });
    if (!dt.isValid) return '-';

    return dt.toFormat('MM/dd/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

export function getCurrentDateTimeGMT() {
  return DateTime.now().toUTC().toFormat('MM/dd/yyyy, hh:mm:ss a');
}

export function formatDateTimeShortGMT(dateString) {
  if (!dateString) return '-';

  try {
    const dt = DateTime.fromISO(dateString.toString(), { zone: 'UTC' });
    if (!dt.isValid) return '-';

    return dt.toFormat('dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}
