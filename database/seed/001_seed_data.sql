-- Seed initial demo records
INSERT INTO patients (health_id, full_name, dob, gender, mobile, email, blood_group, status)
VALUES
  ('74839 16251', 'Rahul Sharma', '1988-04-12', 'Male', '9876543210', 'rahul.sharma@example.com', 'O+', 'Active'),
  ('81920 34719', 'Ananya Deshmukh', '1994-11-28', 'Female', '9812345678', 'ananya.d@example.com', 'B+', 'Active'),
  ('65019 48203', 'Dr. Vikram Sethi', '1975-08-03', 'Male', '9723456789', 'vikram.sethi@example.com', 'A+', 'Active'),
  ('90218 54310', 'Sunita Patel', '1962-01-19', 'Female', '9654321098', 'sunita.patel@example.com', 'AB+', 'Active');
