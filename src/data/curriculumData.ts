export interface AcademicTerm {
  term: number;
  name: string;
  startDate: string;
  endDate: string;
  focus: string;
  keyHolidays: string[];
}

export const EAGLE_HOUSE_CALENDAR: AcademicTerm[] = [
  {
    term: 1,
    name: "Term 1 (2026)",
    startDate: "2026-01-13",
    endDate: "2026-03-19",
    focus: "Establish baselines; communicate expectations; confirm curriculum pacing; begin initial monitoring.",
    keyHolidays: [
      "01 Jan: New Year's Day",
      "21 Mar: Human Rights Day",
      "22 Mar: Public Holiday",
      "26 Mar: Good Friday",
      "28 Mar: Easter Sunday",
      "29 Mar: Family Day",
    ],
  },
  {
    term: 2,
    name: "Term 2 (2026)",
    startDate: "2026-04-06",
    endDate: "2026-06-25",
    focus: "Analyse Term 1 data; put intervention in place; focus on educator development.",
    keyHolidays: [
      "26 Apr: Special School Holiday",
      "27 Apr: Freedom Day",
      "01 May: Worker's Day",
      "16 Jun: Youth Day",
    ],
  },
  {
    term: 3,
    name: "Term 3 (2026)",
    startDate: "2026-07-20",
    endDate: "2026-09-22",
    focus: "Track progress closely; review assessment quality; prepare for examinations.",
    keyHolidays: ["09 Aug: National Women's Day"],
  },
  {
    term: 4,
    name: "Term 4 (2026)",
    startDate: "2026-10-05",
    endDate: "2026-12-08",
    focus: "Analyse final results; review the curriculum; plan for the following academic year.",
    keyHolidays: [
      "24 Sep: Heritage Day",
      "16 Dec: Day of Reconciliation",
      "25 Dec: Christmas Day",
      "26 Dec: Day of Goodwill",
      "27 Dec: Public Holiday",
    ],
  },
];

export interface CurriculumPolicyInfo {
  phaseOrGrade: string;
  framework: string;
  sbaWeight: string;
  finalExamWeight: string;
  cognitiveDemands: string;
  sbaRequirements: string;
  keyTopics: string[];
}

export const CURRICULUM_POLICIES: CurriculumPolicyInfo[] = [
  {
    phaseOrGrade: "Grade 8 & 9 (Senior Phase)",
    framework: "CAPS + ATP Alignment",
    sbaWeight: "40%",
    finalExamWeight: "60%",
    cognitiveDemands: "30% Lower Order (Knowledge/Routine), 40% Middle Order (Complex/Procedures), 30% Higher Order (Problem Solving)",
    sbaRequirements: "Continuous formal assessment tasks across Terms 1-3 including assignments, investigations, tests, and June examination.",
    keyTopics: [
      "Numbers, Operations & Relationships (Fractions, Decimals, Exponents)",
      "Patterns, Functions & Algebra (Algebraic expressions, linear equations)",
      "Space & Shape (Geometry of 2D shapes, straight lines, Pythagoras)",
      "Measurement (Area, perimeter, surface area, volume)",
      "Data Handling (Statistics, graphs, probability)",
    ],
  },
  {
    phaseOrGrade: "Grade 10 & 11 (FET Phase)",
    framework: "CAPS + IEB SAGS Alignment",
    sbaWeight: "25%",
    finalExamWeight: "75%",
    cognitiveDemands: "Knowledge: ~20%, Routine Procedures: ~35%, Complex Procedures: ~30%, Problem Solving: ~15%",
    sbaRequirements: "Drawn from seven formal tasks across Terms 1-3, internally set, marked, and moderated under Eagle House Policy 7.1/7.2.",
    keyTopics: [
      "Algebra, Equations & Inequalities (Quadratics, Exponents, Surds)",
      "Number Patterns & Sequences (Linear, Quadratic)",
      "Functions & Graphs (Linear, Parabola, Hyperbola, Exponential)",
      "Finance, Growth & Decay (Simple/Compound interest, Hire purchase, Inflation)",
      "Differential Calculus (Intro in Gr 11/12)",
      "Probability (Venn diagrams, tree diagrams, independent events)",
      "Analytical Geometry & Trigonometry (Reductions, Sine/Cosine rules)",
      "Euclidean Geometry & Circle Theorems",
    ],
  },
  {
    phaseOrGrade: "Grade 10-12 Mathematical Literacy",
    framework: "IEB SAGS (Mathematical Literacy)",
    sbaWeight: "25%",
    finalExamWeight: "75%",
    cognitiveDemands: "Level 1 (Knowing): 30%, Level 2 (Routine application): 30%, Level 3 (Multi-step procedures): 20%, Level 4 (Reasoning & reflecting): 20%",
    sbaRequirements: "Tasks completed under controlled conditions. Paper 1 assesses basic skills and financial/measurement literacy; Paper 2 assesses contextual integration.",
    keyTopics: [
      "Finance: Budgets, payslips, personal income tax (SARS tables), banking, tariff systems",
      "Measurement: Conversions, perimeter, area, volume, mass, temperature, packaging",
      "Maps, Plans and other representations of the physical world: Scales, floor plans, compass directions",
      "Data Handling: Collecting, organizing, displaying, analyzing, bias detection",
      "Probability: Expressions of probability, prediction, two-way tables",
    ],
  },
  {
    phaseOrGrade: "Cambridge Secondary & High School",
    framework: "Cambridge International (LS, IGCSE 0580/0607, AS/A Level 9709)",
    sbaWeight: "Formative/Progressive",
    finalExamWeight: "External Board Exams",
    cognitiveDemands: "M marks (Method), A marks (Accuracy), B marks (Independent), SC marks (Special Case)",
    sbaRequirements: "Diagnostic term tests, Checkpoint preparation, past paper benchmarking against Cambridge mark boundaries.",
    keyTopics: [
      "Lower Secondary: Number, Algebra, Geometry & Measure, Statistics & Probability",
      "IGCSE (0580/0607): Core and Extended curriculums; functions, trigonometry, vectors, transformations",
      "AS & A Level (9709): Pure Mathematics (P1, P3), Mechanics (M1), Probability & Statistics (S1)",
    ],
  },
];

// Sample pre-loaded test for immediate demonstration of the AI Pre-Moderation tool
export const SAMPLE_MATH_PAPER = {
  subject: "Mathematics",
  code: "MATH-GR10-T1",
  teacher: "Shingi",
  grade: "10A & 10B",
  moderator: "HOD Mpofu",
  level: "FET IEB SAGS",
  testDate: "2026-03-05",
  paper: "Paper 1 (Algebra, Products & Factorisation)",
  testType: "Term 1 Control Test",
  duration: "60 mins",
  totalMarks: 50,
  documentText: `EAGLE HOUSE SCHOOL / PRAXIS BORDERLESS LEARNING
DEPARTMENT OF MATHEMATICS & MATHEMATICAL LITERACY
INTERNAL ASSESSMENT: CONTROL TEST 1
DATE: 05 MARCH 2026
TIME: 1 HOUR (60 MINUTES)
TOTAL MARKS: 50

INSTRUCTIONS AND INFORMATION:
1. This question paper consists of 4 questions and 3 pages.
2. Answer ALL the questions.
3. Clearly show ALL calculations, diagrams, and graphs used in determining answers.
4. Answers only will NOT necessarily be awarded full marks.
5. An approved scientific calculator (non-programmable and non-graphical) may be used, unless stated otherwise.
6. If necessary, round off answers to TWO decimal places, unless stated otherwise.
7. Write neatly and legibly.

QUESTION 1 [15 marks]
1.1 Expand and simplify the following expressions:
    1.1.1 (2x - 3)(x + 4)                            (2)
    1.1.2 (3x - 2y)^2                                (2)
    1.1.3 (x + 2)(x^2 - 2x + 4)                      (3)
1.2 Factorise the following completely:
    1.2.1 3a^2b - 12ab^2                             (2)
    1.2.2 x^2 - 7x + 12                              (2)
    1.2.3 2x^3 - 16                                  (4)

QUESTION 2 [12 marks]
2.1 Solve for x:
    2.1.1 3x - 5 = 7 - x                             (2)
    2.1.2 x^2 - 5x - 14 = 0                          (3)
    2.1.3 2^(x+1) + 2^x = 24                         (4)
2.2 Solve the inequality and represent the solution on a number line:
    -3 <= 2x + 1 < 7                                 (3)

QUESTION 3 [13 marks]
3.1 Simplify the following algebraic fractions:
    3.1.1 (x^2 - 9) / (x^2 + 2x - 15)                (4)
    3.1.2 [ (2 / (x - 1)) - (1 / (x + 2)) ]          (4)
3.2 The length of a rectangular garden is (2x + 3) meters and the width is (x - 1) meters.
    3.2.1 Write down an expression for the area of the garden in terms of x.   (2)
    3.2.2 If the area of the garden is 35 m^2, calculate the value of x and hence state the dimensions. (3)

QUESTION 4 [10 marks]
4.1 Consider the sequence: 5; 8; 11; 14; ...
    4.1.1 Determine the general nth term (T_n) of the sequence.                 (2)
    4.1.2 Which term of the sequence is equal to 101?                          (3)
    4.1.3 Is 250 a term in this sequence? Justify your answer mathematically.   (3)
4.2 State whether sqrt(27) is rational or irrational, giving a reason.          (2)

[TOTAL: 50 MARKS]`,
  memoText: `EAGLE HOUSE SCHOOL - MEMORANDUM
CONTROL TEST 1 - GRADE 10 MATHEMATICS (50 MARKS)

QUESTION 1 [15]
1.1.1 (2x - 3)(x + 4) = 2x^2 + 8x - 3x - 12 = 2x^2 + 5x - 12
      ✓ 2x^2 - 12 (1)  ✓ +5x (1) [M/A] (2)
1.1.2 9x^2 - 12xy + 4y^2
      ✓ 9x^2 + 4y^2 (1) ✓ -12xy (1) (2)
1.1.3 Sum of cubes expansion: x^3 + 8
      ✓ x^3 (1) ✓ +8 (1) ✓ method (1) (3)
1.2.1 3ab(a - 4b)
      ✓ common factor 3ab (1) ✓ (a - 4b) (1) (2)
1.2.2 (x - 3)(x - 4)
      ✓ (x - 3) (1) ✓ (x - 4) (1) (2)
1.2.3 2(x^3 - 8) = 2(x - 2)(x^2 + 2x + 4)
      ✓ common factor 2 (1) ✓ (x - 2) (1) ✓ (x^2 + 2x + 4) (2) (4)

QUESTION 2 [12]
2.1.1 4x = 12 => x = 3
      ✓ 4x = 12 (1) ✓ x = 3 (1) (2)
2.1.2 (x - 7)(x + 2) = 0 => x = 7 or x = -2
      ✓ factors (1) ✓ both answers (2) (3)
2.1.3 2^x(2 + 1) = 24 => 2^x * 3 = 24 => 2^x = 8 = 2^3 => x = 3
      ✓ common factor 2^x (1) ✓ 2^x = 8 (1) ✓ 2^3 (1) ✓ x = 3 (1) (4)
2.2 -4 <= 2x < 6 => -2 <= x < 3
      ✓ dividing by 2 (1) ✓ solution: -2 <= x < 3 (1) ✓ number line with solid dot at -2 and open circle at 3 (1) (3)

QUESTION 3 [13]
3.1.1 [(x - 3)(x + 3)] / [(x + 5)(x - 3)] = (x + 3) / (x + 5)
      ✓ numerator factors (1) ✓ denominator factors (1) ✓ cancellation (1) ✓ answer (1) (4)
3.1.2 [2(x + 2) - 1(x - 1)] / [(x - 1)(x + 2)] = [2x + 4 - x + 1] / [(x - 1)(x + 2)] = (x + 5) / [(x - 1)(x + 2)]
      ✓ common LCD (1) ✓ expanding brackets (1) ✓ combining like terms (1) ✓ final fraction (1) (4)
3.2.1 Area = (2x + 3)(x - 1) = 2x^2 + x - 3  ✓ formula (1) ✓ expansion (1) (2)
3.2.2 2x^2 + x - 3 = 35 => 2x^2 + x - 38 = 0... Wait! Let's check: (2x+9)(x-4)? No.
      Correction in memo needed: check quadratic roots. (3)

QUESTION 4 [10]
4.1.1 Common difference d = 3. T_n = 3n + 2
      ✓ d = 3 (1) ✓ T_n = 3n + 2 (1) (2)
4.1.2 3n + 2 = 101 => 3n = 99 => n = 33 (33rd term)
      ✓ equating (1) ✓ 3n = 99 (1) ✓ n = 33 (1) (3)
4.1.3 3n + 2 = 250 => 3n = 248 => n = 248/3 = 82.67.
      Since n is not a natural number (n not in N), 250 is NOT a term in this sequence.
      ✓ equating to 250 (1) ✓ n = 82.67 (1) ✓ conclusion with valid mathematical reason (1) (3)
4.2 sqrt(27) = 3*sqrt(3), which cannot be expressed as a fraction a/b where a,b are integers and b != 0. Hence it is irrational.
      ✓ irrational (1) ✓ reason (non-terminating non-repeating decimal / 27 not a perfect square) (1) (2)`,
};

export const INITIAL_DEADLINES: any[] = [
  // Term 1 Tasks
  {
    id: "task-1",
    teacherName: "Shingi",
    subject: "Mathematics",
    curriculum: "IEB",
    grade: "10A & 10B",
    taskName: "Control Test 1: Algebra & Equations",
    testDate: "2026-03-05",
    preModDueDate: "2026-02-28",
    preModStatus: "Approved",
    postModStatus: "Sample Due",
    totalMarks: 50,
    hasDocument: true,
    term: 1,
    difficultyCategory: "Tier 3: Core FET Foundations",
  },
  {
    id: "task-2",
    teacherName: "Reggie",
    subject: "Mathematical Literacy",
    curriculum: "IEB",
    grade: "12A & 12B",
    taskName: "Term 1 Assignment: Finance & Tariffs",
    testDate: "2026-03-12",
    preModDueDate: "2026-03-05",
    preModStatus: "Submitted",
    postModStatus: "Not Due Yet",
    totalMarks: 75,
    hasDocument: true,
    term: 1,
    difficultyCategory: "Tier 4: Applied / Contextual",
  },
  {
    id: "task-6",
    teacherName: "Reggie",
    subject: "Mathematics",
    curriculum: "IEB",
    grade: "12A & 12B",
    taskName: "Standardised Test 1: Differential Calculus & Curve Sketching",
    testDate: "2026-03-18",
    preModDueDate: "2026-03-13",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 75,
    hasDocument: true,
    term: 1,
    difficultyCategory: "Tier 1: Advanced / High Rigour",
  },
  {
    id: "task-7",
    teacherName: "Mpofu",
    subject: "Advanced Programme Mathematics",
    curriculum: "IEB",
    grade: "Grade 12",
    taskName: "AP Maths Calculus & Matrix Algebra Moderation",
    testDate: "2026-03-15",
    preModDueDate: "2026-03-10",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 100,
    hasDocument: true,
    term: 1,
    difficultyCategory: "Tier 1: Advanced / High Rigour",
  },
  {
    id: "task-8",
    teacherName: "Luthando",
    subject: "Cambridge Mathematics 0580",
    curriculum: "Cambridge",
    grade: "IGCSE Year 1",
    taskName: "Checkpoint 1: Vector Geometry & Coordinate Transformations",
    testDate: "2026-03-08",
    preModDueDate: "2026-03-03",
    preModStatus: "Overdue",
    postModStatus: "Not Due Yet",
    totalMarks: 60,
    hasDocument: true,
    term: 1,
    difficultyCategory: "Tier 2: Senior Core Pure Maths",
  },

  // Term 2 Tasks
  {
    id: "task-3",
    teacherName: "Luthando",
    subject: "Mathematics",
    curriculum: "CAPS",
    grade: "9A & 9B",
    taskName: "Class Investigation: Geometry of 2D Shapes",
    testDate: "2026-05-10",
    preModDueDate: "2026-05-03",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 40,
    hasDocument: false,
    term: 2,
    difficultyCategory: "Tier 3: Core FET Foundations",
  },
  {
    id: "task-t2-1",
    teacherName: "Shingi",
    subject: "Mathematics",
    curriculum: "IEB",
    grade: "10A & 10B",
    taskName: "June Mid-Year Examination Paper 1: Algebra, Functions & Finance",
    testDate: "2026-06-08",
    preModDueDate: "2026-06-01",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 100,
    hasDocument: true,
    term: 2,
    difficultyCategory: "Tier 3: Core FET Foundations",
  },
  {
    id: "task-t2-2",
    teacherName: "Reggie",
    subject: "Mathematical Literacy",
    curriculum: "IEB",
    grade: "11A & 11B",
    taskName: "Mid-Year Practical Task: Maps, Plans & Scaled Drawings",
    testDate: "2026-05-22",
    preModDueDate: "2026-05-15",
    preModStatus: "Approved",
    postModStatus: "Not Due Yet",
    totalMarks: 50,
    hasDocument: true,
    term: 2,
    difficultyCategory: "Tier 4: Applied / Contextual",
  },
  {
    id: "task-t2-3",
    teacherName: "Luthando",
    subject: "Cambridge Mathematics 0580",
    curriculum: "Cambridge",
    grade: "IGCSE Year 2",
    taskName: "Extended Paper 2 Practice Examination",
    testDate: "2026-06-02",
    preModDueDate: "2026-05-26",
    preModStatus: "Submitted",
    postModStatus: "Not Due Yet",
    totalMarks: 70,
    hasDocument: true,
    term: 2,
    difficultyCategory: "Tier 2: Senior Core Pure Maths",
  },

  // Term 3 Tasks
  {
    id: "task-4",
    teacherName: "Mpofu",
    subject: "Mathematical Literacy",
    curriculum: "IEB",
    grade: "11A & 11B",
    taskName: "Term 3 Practical Assessment Task (PAT)",
    testDate: "2026-08-24",
    preModDueDate: "2026-08-17",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 100,
    hasDocument: false,
    term: 3,
    difficultyCategory: "Tier 4: Applied / Contextual",
  },
  {
    id: "task-t3-1",
    teacherName: "Reggie",
    subject: "Mathematics",
    curriculum: "IEB",
    grade: "12A & 12B",
    taskName: "Grade 12 Preliminary Examination Paper 1: Calculus & Algebra",
    testDate: "2026-09-02",
    preModDueDate: "2026-08-26",
    preModStatus: "Approved",
    postModStatus: "Audit Pending",
    totalMarks: 150,
    hasDocument: true,
    term: 3,
    difficultyCategory: "Tier 1: Advanced / High Rigour",
  },
  {
    id: "task-t3-2",
    teacherName: "Shingi",
    subject: "Mathematics",
    curriculum: "IEB",
    grade: "10A & 10B",
    taskName: "Control Test 2: Analytical Geometry & Trigonometry",
    testDate: "2026-08-18",
    preModDueDate: "2026-08-11",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 50,
    hasDocument: true,
    term: 3,
    difficultyCategory: "Tier 3: Core FET Foundations",
  },

  // Term 4 Tasks
  {
    id: "task-5",
    teacherName: "Reggie",
    subject: "Mathematics",
    curriculum: "Cambridge",
    grade: "Grade 8 (Checkpoint)",
    taskName: "Diagnostic Progression Test: Number & Measure",
    testDate: "2026-11-04",
    preModDueDate: "2026-10-28",
    preModStatus: "Overdue",
    postModStatus: "Not Due Yet",
    totalMarks: 60,
    hasDocument: false,
    term: 4,
    difficultyCategory: "Tier 3: Core FET Foundations",
  },
  {
    id: "task-t4-1",
    teacherName: "Shingi",
    subject: "Mathematics",
    curriculum: "IEB",
    grade: "10A & 10B",
    taskName: "November Final Examination Paper 1: Algebra & Calculus Intro",
    testDate: "2026-11-15",
    preModDueDate: "2026-11-08",
    preModStatus: "Pending",
    postModStatus: "Not Due Yet",
    totalMarks: 100,
    hasDocument: true,
    term: 4,
    difficultyCategory: "Tier 3: Core FET Foundations",
  },
  {
    id: "task-t4-2",
    teacherName: "Mpofu",
    subject: "Advanced Programme Mathematics",
    curriculum: "IEB",
    grade: "Grade 12",
    taskName: "Final External IEB Portfolio Sign-Off & Audit",
    testDate: "2026-10-20",
    preModDueDate: "2026-10-13",
    preModStatus: "Approved",
    postModStatus: "Completed",
    totalMarks: 100,
    hasDocument: true,
    term: 4,
    difficultyCategory: "Tier 1: Advanced / High Rigour",
  },
];
