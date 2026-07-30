ALTER TABLE appointments
  ADD COLUMN reminder_sent_2h BOOLEAN DEFAULT FALSE AFTER reminder_sent_24h;
