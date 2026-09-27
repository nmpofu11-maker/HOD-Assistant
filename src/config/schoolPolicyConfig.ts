/**
 * EAGLE HOUSE SCHOOL - MASTER POLICY & ACADEMIC CALIBRATION CONFIG
 * 
 * IMPORTANT COMPLIANCE NOTICE:
 * The term dates, assessment clauses (§7.1, §7.2), cognitive weighting breakdowns,
 * and curriculum specifications below are time-bound facts. They must be manually
 * verified and updated against the actual current Eagle House School Assessment Policy
 * and National Curriculum (IEB / CAPS / Cambridge) documentation at the start of
 * each academic year rather than assumed as permanently correct by default.
 */

export const SCHOOL_POLICY_CONFIG = {
  academicYear: 2026,
  schoolName: "Eagle House School",
  curriculaSupported: ["IEB", "CAPS", "Cambridge"],
  department: "Mathematics & Mathematical Literacy",
  hodName: "Mr. N. Mpofu",
  
  // Assessed Policy Clause References (Verify annually against printed staff handbook)
  policies: {
    preModLeadTimeDays: 5, // Policy §7.1: Pre-assessment moderation lead time in school days
    postModSamplePercentage: 10, // Policy §7.2: Stratified sample percentage for purple pen post-mod audit
    varianceThresholdPercent: 5, // Discrepancy resolution register threshold
  },

  // Official 2026 Term Schedule (Verify annually against school calendar)
  terms: {
    1: { title: "Term 1", period: "Jan - Mar 2026", startDate: "2026-01-13", endDate: "2026-03-19" },
    2: { title: "Term 2", period: "Apr - Jun 2026", startDate: "2026-04-06", endDate: "2026-06-25" },
    3: { title: "Term 3", period: "Jul - Sep 2026", startDate: "2026-07-20", endDate: "2026-09-22" },
    4: { title: "Term 4", period: "Oct - Dec 2026", startDate: "2026-10-05", endDate: "2026-12-08" },
  },

  // IEB Mathematics Cognitive Levels Breakdown (SAGS compliance)
  cognitiveWeightings: {
    mathematicsIEB: {
      knowledge: 20,
      routine: 35,
      complex: 30,
      problemSolving: 15,
    },
    seniorPhaseCAPS: {
      lowerOrder: 30,
      middleOrder: 40,
      higherOrder: 30,
    }
  }
};
