import { DepartmentConfigState, DepartmentEducator } from "../types";
import { INITIAL_STAFF_MEMBERS } from "./staffData";

export const INITIAL_DEPARTMENT_EDUCATORS: DepartmentEducator[] = INITIAL_STAFF_MEMBERS.map((staff, idx) => {
  let role = "Educator";
  let email = `${staff.name.toLowerCase().replace(/\s+/g, "")}@eaglehouseschool.co.za`;

  if (staff.id === "mpofu") {
    role = "Head of Department (Mathematics & Mathematical Literacy)";
    email = "nmpofu@eaglehouseschool.co.za";
  } else if (staff.id === "shingi") {
    role = "Mathematics Educator & Pre-Moderation Lead";
  } else if (staff.id === "reggie") {
    role = "Senior Mathematics Educator (FET & Cambridge)";
  } else if (staff.id === "luthando") {
    role = "Mathematics & Economics Educator";
  } else if (staff.isMathsDept) {
    role = "Mathematics Educator";
  } else {
    role = "Subject Educator";
  }

  return {
    id: staff.id || `edu-${idx + 1}`,
    name: staff.name,
    role,
    email,
    isMathsDept: staff.isMathsDept,
    status: "active" as const,
    notes: staff.isMathsDept ? "Eagle House Mathematics Department Core Member" : "Eagle House Faculty Member",
    allocations: staff.allocations.map((alloc, aIdx) => ({
      id: `alloc-${staff.id || idx}-${aIdx + 1}`,
      curriculum: alloc.curriculum,
      grade: alloc.grade,
      subject: alloc.subject,
    })),
  };
});

export const INITIAL_DEPARTMENT_CONFIG: DepartmentConfigState = {
  currentAcademicYear: 2026,
  years: [
    {
      year: 2026,
      label: "2026 Academic Year (Active)",
      isActive: true,
      isArchived: false,
      notes: "Official Eagle House School timetable and subject allocations for 2026.",
      educators: INITIAL_DEPARTMENT_EDUCATORS,
    },
  ],
};
