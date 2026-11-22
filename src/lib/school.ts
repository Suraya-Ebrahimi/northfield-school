export type Role = "admin" | "teacher" | "parent";
export type RiskLevel = "High" | "Moderate" | "Low";
export interface Student {
  id: string; name: string; gradeLevel: string; attendance: number; avgScore: number;
  flags: number; feeStatus: "Paid" | "Pending" | "Overdue"; intervention: string;
}

export const initialStudents: Student[] = [
  { id: "STU-101", name: "Ahmad Rahimi", gradeLevel: "Grade 10", attendance: 68, avgScore: 54, flags: 3, feeStatus: "Paid", intervention: "Parent-Teacher Meeting Scheduled" },
  { id: "STU-102", name: "Maryam Karimi", gradeLevel: "Grade 11", attendance: 96, avgScore: 91, flags: 0, feeStatus: "Paid", intervention: "None Needed" },
  { id: "STU-103", name: "Omid Nazari", gradeLevel: "Grade 9", attendance: 74, avgScore: 61, flags: 2, feeStatus: "Pending", intervention: "Pending Action" },
  { id: "STU-104", name: "Zahra Ahmadi", gradeLevel: "Grade 12", attendance: 82, avgScore: 68, flags: 1, feeStatus: "Paid", intervention: "None Needed" },
  { id: "STU-105", name: "Bilal Wardak", gradeLevel: "Grade 10", attendance: 62, avgScore: 49, flags: 4, feeStatus: "Overdue", intervention: "Pending Action" },
  { id: "STU-106", name: "Sadaf Stanikzai", gradeLevel: "Grade 11", attendance: 94, avgScore: 88, flags: 0, feeStatus: "Paid", intervention: "None Needed" },
  { id: "STU-107", name: "Farhad Mohammadi", gradeLevel: "Grade 8", attendance: 79, avgScore: 64, flags: 1, feeStatus: "Paid", intervention: "Assigned After-School Tutor" },
  { id: "STU-108", name: "Nargis Popal", gradeLevel: "Grade 9", attendance: 91, avgScore: 84, flags: 0, feeStatus: "Paid", intervention: "None Needed" },
  { id: "STU-109", name: "Kaveh Sultani", gradeLevel: "Grade 12", attendance: 71, avgScore: 58, flags: 2, feeStatus: "Pending", intervention: "Pending Action" },
  { id: "STU-110", name: "Laila Haidari", gradeLevel: "Grade 10", attendance: 88, avgScore: 79, flags: 0, feeStatus: "Paid", intervention: "None Needed" },
];

export const roleEmails: Record<Role, string> = {
  admin: "admin@northfield.edu",
  teacher: "teacher.sarah@northfield.edu",
  parent: "parent.rahimi@northfield.edu",
};

export const interventions = [
  "Parent-Teacher Meeting Scheduled",
  "Assigned After-School Tutor",
  "Counselor Check-in Assigned",
  "Attendance Monitoring Plan",
];

export function calculateRisk(s: Pick<Student, "attendance" | "avgScore" | "flags">): { level: RiskLevel; trigger: string } {
  const reasons: string[] = [];
  if (s.attendance < 75) reasons.push("Critical Low Attendance (<75%)");
  else if (s.attendance < 85) reasons.push("Declining Attendance");
  if (s.avgScore < 60) reasons.push("Failing Academic Score (<60%)");
  else if (s.avgScore < 70) reasons.push("Borderline Grades");
  if (s.flags >= 3) reasons.push("Multiple Behavior Flags");
  if (s.attendance < 75 || s.avgScore < 60 || s.flags >= 3) return { level: "High", trigger: reasons.join(" & ") };
  if (s.attendance < 85 || s.avgScore < 70 || s.flags >= 1) return { level: "Moderate", trigger: reasons[0] || "Minor Academic Dip" };
  return { level: "Low", trigger: "On Track" };
}
