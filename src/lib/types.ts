export type Student = {
  id: string;
  name: string;
};

export type AttendanceLog = {
  id: number;
  student_id: string;
  name: string;
  scanned_at: string;
  session_window: string;
};