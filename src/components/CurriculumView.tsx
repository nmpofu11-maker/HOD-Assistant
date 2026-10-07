import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Percent,
  CheckSquare,
  Square,
  User,
  Sliders,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Clock,
  Folder,
  ExternalLink,
  Plus,
  Search,
  FileText,
  Cloud,
  Link as LinkIcon,
} from "lucide-react";
import { CURRICULUM_POLICIES, EAGLE_HOUSE_CALENDAR } from "../data/curriculumData";

// Type Definitions
interface AtpTopic {
  name: string;
}

interface ResourceItem {
  id: string;
  subjectId: string;
  term: number;
  year: number;
  moduleName: string;
  category: "Lesson Plans & Notes" | "Worksheets & Memos" | "Assessment Tasks" | "Interactive Resources" | "Past Papers";
  driveUrl: string;
  uploadedBy: string;
  dateAdded: string;
}

interface SbaTask {
  name: string;
  weighting: string;
  type: string;
  policyRef: string;
}

interface CycleData {
  cycleNum: number;
  weeks: string;
  topics: AtpTopic[];
  sba: SbaTask;
  guideline: string;
}

interface SubjectAtp {
  id: string;
  name: string;
  framework: "IEB" | "Cambridge" | "CAPS";
  phase: string;
  subTitle: string;
  educators: string[];
  defaultEducator: string;
  terms: Record<number, CycleData[]>;
}

// Full 4-Term Database of ATPs for all subjects
const SUBJECT_ATPS: SubjectAtp[] = [
  {
    id: "ieb-gr10-math",
    name: "Grade 10 Core Mathematics",
    framework: "IEB",
    phase: "FET Phase (Grade 10)",
    subTitle: "DBE CAPS Annual Teaching Plan + IEB Subject Assessment Guidelines (SAGs)",
    educators: ["Shingi", "Reggie"],
    defaultEducator: "Shingi",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Algebraic Expressions: Products of binomials and trinomials" },
            { name: "Factorisation: Common factors, grouping & difference of squares" },
            { name: "Factorisation: Sum/difference of cubes & quadratic trinomials" },
            { name: "Algebraic Fractions: Multiplication, division, addition & subtraction" }
          ],
          sba: {
            name: "SBA Class Test 1 (Algebra)",
            weighting: "10% SBA Weight",
            type: "Written Controlled Test",
            policyRef: "Policy §7.1 pre-moderation (5 days prior)"
          },
          guideline: "DoE CAPS ATP Target: Complete algebraic fractions. IEB SAG Compliance: Focus on high-order factorization."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Exponents: Laws of rational exponents & simplification" },
            { name: "Exponents: Solving basic exponential equations (index forms)" },
            { name: "Number Patterns: Linear/Arithmetic sequences & general term Tn formula" },
            { name: "Equations: Solving linear and quadratic equations by factoring" }
          ],
          sba: {
            name: "SBA Term 1 Investigation (Patterns & Algebra)",
            weighting: "20% SBA Weight",
            type: "Alternative Assessment Task",
            policyRef: "Policy §7.2 post-moderation (stratified purple pen)"
          },
          guideline: "DoE CAPS ATP Target: Quad roots by Week 8. IEB SAG: Investigation requires open-ended mathematical modeling."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Simultaneous Equations: Solving linear systems with 2 variables" },
            { name: "Literal Equations: Subject of the formula rearrangements" },
            { name: "Linear Inequalities: Solving and graphing intervals on number lines" },
            { name: "Revision: Comprehensive Term 1 exam diagnostic feedback drills" }
          ],
          sba: {
            name: "SBA Term 1 Controlled Test 2",
            weighting: "30% SBA Weight",
            type: "Controlled Paper",
            policyRef: "FET Assessment Policy schedule"
          },
          guideline: "DoE CAPS ATP: Revision Weeks 11-12. IEB SAG: Cognitive breakdown must include 15% complex problem solving."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Trigonometry: Ratios in right-angled triangles, SOHCAHTOA" },
            { name: "Trigonometry: Special angles (30°, 45°, 60°) without a calculator" },
            { name: "Trigonometry: Cartesian plane angles, CAST diagram quadrants" },
            { name: "Trigonometric Equations: Finding general & specific solutions" }
          ],
          sba: {
            name: "SBA Class Test 2 (Trigonometry Intro)",
            weighting: "10% SBA Weight",
            type: "Controlled Written Test",
            policyRef: "Policy §7.1 pre-moderation"
          },
          guideline: "DoE CAPS: Focus on CAST diagram algebraic applications. IEB SAG: Emphasize coordinate geometry connections."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Functions: Linear function sketching, gradient and intercepts (y = mx + c)" },
            { name: "Functions: Parabola sketching (quadratic function y = ax^2 + q)" },
            { name: "Functions: Hyperbola (y = a/x + q) & Exponential function (y = a*b^x + q)" },
            { name: "Functions: Finding equations of sketched graphs from critical points" }
          ],
          sba: {
            name: "SBA Functions Assignment",
            weighting: "20% SBA Weight",
            type: "Written Practical Assignment",
            policyRef: "Policy §7.2 post-moderation"
          },
          guideline: "DoE CAPS ATP: Complete hyperbola asymptotes shifts. IEB: Emphasize domain & range interval notation."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Trigonometric Graphs: Sketching y = a sin(x) + q & y = a cos(x) + q" },
            { name: "Trigonometric Graphs: Amplitude shifts and vertical translation shifts" },
            { name: "Revision: Comprehensive Term 2 algebra and trigonometry summaries" },
            { name: "Assessment: Mid-Year Examinations & detailed diagnostic corrections" }
          ],
          sba: {
            name: "SBA Term 2 Mid-Year Examination",
            weighting: "30% SBA Weight",
            type: "Mid-Year Examination (Paper 1 & 2)",
            policyRef: "FET Formal Examination Protocols"
          },
          guideline: "DoE CAPS ATP Target: Complete all core graphs. IEB SAG: Dual-graph interpretation questions (15% weighting)."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Euclidean Geometry: Parallel lines, alternate & corresponding angles" },
            { name: "Euclidean Geometry: Interior and exterior angles of triangles" },
            { name: "Euclidean Geometry: Properties of special quadrilaterals (Parallelogram, Rhombus)" },
            { name: "Euclidean Geometry: Formal proofs of quadrilateral properties theorems" }
          ],
          sba: {
            name: "SBA Geometry Practical Test",
            weighting: "10% SBA Weight",
            type: "Structured Geometry Test",
            policyRef: "Policy §7.1 validation"
          },
          guideline: "DoE CAPS ATP: Triangle and quad properties proofs. IEB SAG: Emphasize multi-step geometric deductive reasoning."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Analytical Geometry: Distance formula between two coordinate points" },
            { name: "Analytical Geometry: Midpoint formula of a line segment" },
            { name: "Analytical Geometry: Gradient formula and parallel/perpendicular conditions" },
            { name: "Analytical Geometry: Equation of a straight line under geometric constraints" }
          ],
          sba: {
            name: "SBA Analytical Geometry Test",
            weighting: "15% SBA Weight",
            type: "Written Test",
            policyRef: "Policy §7.1 and §7.2"
          },
          guideline: "DoE CAPS: Ensure derivation of formulas is taught. IEB SAG: Coordinate proofs of quadrilateral properties."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Finance: Simple & Compound interest calculations (A = P(1+in) & A = P(1+i)^n)" },
            { name: "Finance: Hire purchase loans, inflation, and currency exchange rates" },
            { name: "Trigonometry in 2D: Solving problems with right-angled triangles" },
            { name: "Revision: Integration of Geometry and Finance problems" }
          ],
          sba: {
            name: "SBA Term 3 Controlled Test",
            weighting: "25% SBA Weight",
            type: "Controlled Paper",
            policyRef: "FET Governance schedule"
          },
          guideline: "DoE CAPS: Complete Hire Purchase calculations. IEB SAG: Comparative financial plan evaluations."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Statistics: Ungrouped data analysis, measures of central tendency" },
            { name: "Statistics: Five-number summary, box-and-whisker plot construction" },
            { name: "Statistics: Grouped data, finding modal class, estimating mean" },
            { name: "Probability: Relative frequency, Venn Diagrams of two events" }
          ],
          sba: {
            name: "SBA Statistics Assignment",
            weighting: "15% SBA Weight",
            type: "Data Project",
            policyRef: "Policy §7.2 Quality"
          },
          guideline: "DoE CAPS ATP: Box plot construction is key. IEB SAG: Analyse Venn diagrams for mutually exclusive events."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Probability: Mutually exclusive, complementary & dependent events" },
            { name: "Measurement: Perimeter and area of complex 2D compound shapes" },
            { name: "Measurement: Surface Area and Volume of right prisms and cylinders" },
            { name: "Syllabus Synthesis: Full Paper 1 & Paper 2 revision drills" }
          ],
          sba: {
            name: "SBA Final Exam Prep Portfolio",
            weighting: "15% SBA Weight",
            type: "Syllabus Portfolio Review",
            policyRef: "HOD Portfolio Audit"
          },
          guideline: "DoE CAPS: Complete volume derivations. IEB SAG: Standardise geometric shape layout ratios."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Year-End Examination: Mathematics Paper 1 (Algebra, Patterns, Functions)" },
            { name: "Year-End Examination: Mathematics Paper 2 (Trig, Stats, Geometry)" },
            { name: "Internal Promotion: Mark sheets completion and diagnostic moderation" },
            { name: "Planning: CAPS transition mapping for Grade 11 Core Mathematics" }
          ],
          sba: {
            name: "Final Year-End Promotion Examinations",
            weighting: "60% Final Promotion Mark",
            type: "External Moderated Exam Paper",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS Year-End Target: Complete Papers 1 & 2. IEB SAG: Strictly standardise cognitive weight demands."
        }
      ]
    }
  },
  {
    id: "ieb-gr11-math",
    name: "Grade 11 Core Mathematics",
    framework: "IEB",
    phase: "FET Phase (Grade 11)",
    subTitle: "DBE CAPS Annual Teaching Plan + IEB Subject Assessment Guidelines (SAGs)",
    educators: ["Shingi", "Reggie"],
    defaultEducator: "Reggie",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Exponents & Surds: Simplification & rational indices laws" },
            { name: "Exponents & Surds: Rationalising denominators & surd equation roots" },
            { name: "Equations & Inequalities: Quadratic equations (completing square & formula)" },
            { name: "Equations & Inequalities: Quadratic inequalities in 1 variable (intervals)" }
          ],
          sba: {
            name: "SBA Diagnostic Algebra Test",
            weighting: "10% SBA Weight",
            type: "Written Test",
            policyRef: "Policy §7.1 Compliance check"
          },
          guideline: "DoE CAPS: Ensure surd equation extraneous solutions are tested. IEB SAG: Surds form base of calculus functions."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Number Patterns: Quadratic sequences (second differences & general term)" },
            { name: "Analytical Geometry: Distance, midpoint, gradient & angle of inclination" },
            { name: "Analytical Geometry: Parallel & perpendicular lines proofs" },
            { name: "Analytical Geometry: Straight line equations under geometric constraints" }
          ],
          sba: {
            name: "SBA Term 1 Project (Quadratic Sequence Models)",
            weighting: "20% SBA Weight",
            type: "Alternative Assessment",
            policyRef: "Policy §7.1 and §7.2"
          },
          guideline: "DoE CAPS ATP Target: Complete second-order progressions. IEB SAG: Embed multi-step analytical proofs."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Trigonometry: Ratios, special angles & fundamental identities" },
            { name: "Trigonometry: Reduction formulas (180±θ, 360±θ, co-functions 90±θ)" },
            { name: "Trigonometry: Equations solving (general solutions & specific intervals)" },
            { name: "Trigonometry: Graphs of sine, cosine, tangent with amplitude/phase shifts" }
          ],
          sba: {
            name: "SBA Term 1 Controlled Examination",
            weighting: "30% SBA Weight",
            type: "Written Examination",
            policyRef: "FET Governance Audit protocol"
          },
          guideline: "DoE CAPS ATP Target: Reductions by Week 10. IEB SAG: Level 4 proof of trigonometric identities."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Functions: Parabola sketch, axis of symmetry, domain and range" },
            { name: "Functions: Hyperbola (y = a/(x+p) + q) shifting asymptotes" },
            { name: "Functions: Exponential (y = a*b^(x+p) + q) transformations" },
            { name: "Functions: Intersection of graphs & algebraic coordinates calculations" }
          ],
          sba: {
            name: "SBA Functions Test 2",
            weighting: "10% SBA Weight",
            type: "Written Class Test",
            policyRef: "Policy §7.1 pre-moderation"
          },
          guideline: "DoE CAPS: Complete all hyperbola p/q translation formulas. IEB: Graph intercepts must include nested irrational surds."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Euclidean Geometry: Circle Theorems, chord perpendicular bisectors" },
            { name: "Euclidean Geometry: Angle subtended at center is twice angle at circumference" },
            { name: "Euclidean Geometry: Angle in semi-circle is 90°, cyclic quadrilaterals properties" },
            { name: "Euclidean Geometry: Tangents to a circle properties, tangent-chord theorem" }
          ],
          sba: {
            name: "SBA Euclidean Geometry Assignment",
            weighting: "20% SBA Weight",
            type: "Written Task Portfolio",
            policyRef: "Policy §7.2 post-moderation"
          },
          guideline: "DoE CAPS: Formal proofs of circle theorems required. IEB SAG: Incorporate multiple overlapping circle theorems (15% complex)."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Trigonometry: Sine, Cosine and Area Rule derivations" },
            { name: "Trigonometry: Solving 2D problems using the sine & cosine rules" },
            { name: "Revision: Comprehensive integration of geometry and functions" },
            { name: "Assessment: Mid-Year formal diagnostic controlled testing" }
          ],
          sba: {
            name: "SBA Term 2 Mid-Year Examination",
            weighting: "30% SBA Weight",
            type: "Controlled Paper Exam",
            policyRef: "FET Governance standard"
          },
          guideline: "DoE CAPS ATP Target: Sine rule proofs by Week 10. IEB SAG: 3D modeling scenarios using coordinate vectors."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Finance: Compound interest growth, compounding intervals (n per year)" },
            { name: "Finance: Nominal and Effective interest rates conversions" },
            { name: "Finance: Depreciation (Reducing Balance & Straight Line models)" },
            { name: "Finance: Sinking funds introduction & compound inflation growth" }
          ],
          sba: {
            name: "SBA Finance Investigation",
            weighting: "15% SBA Weight",
            type: "Alternative Investigation Task",
            policyRef: "Policy §7.1 validation"
          },
          guideline: "DoE CAPS: Ensure effective vs nominal equations are memorized. IEB SAG: Focus on real-world bank pricing plans."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Probability: Addition rule, mutually exclusive vs independent events" },
            { name: "Probability: Venn Diagrams representing up to 3 separate events" },
            { name: "Probability: Tree Diagrams for dependent and independent selections" },
            { name: "Probability: Two-way Contingency Tables calculations" }
          ],
          sba: {
            name: "SBA Probability Written Test",
            weighting: "15% SBA Weight",
            type: "Controlled Test",
            policyRef: "Policy §7.1 control check"
          },
          guideline: "DoE CAPS: Probability calculations with tree diagrams. IEB SAG: Contingency tables must include algebraic variable solve."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Statistics: Variance and Standard Deviation calculations of raw data" },
            { name: "Statistics: Histograms and Frequency Polygons of grouped intervals" },
            { name: "Statistics: Cumulative Frequency curves (Ogive) & percentile mapping" },
            { name: "Revision: Integration of Stats and Probability drills" }
          ],
          sba: {
            name: "SBA Term 3 Controlled Assessment",
            weighting: "20% SBA Weight",
            type: "Controlled Assessment Paper",
            policyRef: "FET Assessment Policy schedule"
          },
          guideline: "DoE CAPS: Focus on Ogives construction metrics. IEB SAG: Grade standardisation of standard deviation benchmarks."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Analytical Geometry: Revision of incline angles & line intersections" },
            { name: "Euclidean Geometry: Comprehensive revision of Cyclic Quads proofs" },
            { name: "Functions: Synthesis of quadratic models & hyperbola asymptotes" },
            { name: "Equations: Simultaneous equations with quadratic expansions" }
          ],
          sba: {
            name: "SBA Final Portfolio Assembly",
            weighting: "10% SBA Weight",
            type: "Assessment Portfolio review",
            policyRef: "HOD Portfolio Audit"
          },
          guideline: "DoE CAPS: Verify final year-end portfolio completion. IEB SAG: Ensure 100% moderation of stratified samples."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Syllabus Synthesis: Paper 1 comprehensive trial papers drills" },
            { name: "Syllabus Synthesis: Paper 2 comprehensive trial papers drills" },
            { name: "Diagnostic Practice: Identifying high-order problem solving patterns" },
            { name: "Examination Prep: Speed calculations and formula sheet calibrations" }
          ],
          sba: {
            name: "SBA Final Diagnostic Trial Exam",
            weighting: "15% SBA Weight",
            type: "Internal Mock Board Exam",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS: Complete full revisions. IEB SAG: Enforce cognitive standard parameters."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Year-End Examination: Mathematics Paper 1 (Algebra, Sequences, Functions)" },
            { name: "Year-End Examination: Mathematics Paper 2 (Geometry, Trig, Stats)" },
            { name: "Internal Promotion: Moderation schedules and promotions rosters" },
            { name: "Grade 12 Transition: Bridging guidelines for Matric Math" }
          ],
          sba: {
            name: "Final Year-End Promotion Examinations",
            weighting: "60% Final Promotion Mark",
            type: "External Moderated Exam Paper",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS Year-End Target: Complete Papers 1 & 2. IEB SAG: Strictly standardise cognitive weight demands."
        }
      ]
    }
  },
  {
    id: "ieb-gr12-math",
    name: "Grade 12 Core Mathematics",
    framework: "IEB",
    phase: "FET Matric Stream (Grade 12)",
    subTitle: "DBE CAPS Annual Teaching Plan + IEB Subject Assessment Guidelines (SAGs)",
    educators: ["Shingi", "Reggie"],
    defaultEducator: "Shingi",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Number Patterns: Arithmetic & Geometric series, Sigma notation (Σ)" },
            { name: "Number Patterns: Geometric series sum formula derivations & sum to infinity" },
            { name: "Functions & Graphs: Inverses of functions (linear, quadratic & exponential)" },
            { name: "Functions & Graphs: Logarithmic laws & exponential-logarithmic graphs" }
          ],
          sba: {
            name: "SBA Matric Class Test 1 (Series & Inverses)",
            weighting: "10% SBA Weight",
            type: "Written Test",
            policyRef: "Policy §7.1 Fast-Track check"
          },
          guideline: "DoE CAPS Matric ATP: High pace. IEB SAG: Convergent geometric series must test constraints (|r| < 1)."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Trigonometry: Compound & double angle identities derivations" },
            { name: "Trigonometry: Trigonometric equations solving using double angle models" },
            { name: "Finance: Compound interest, nominal/effective rates, future value annuities" },
            { name: "Finance: Sinking funds, loan balances, amortization tables" }
          ],
          sba: {
            name: "SBA Term 1 Mathematics Assignment",
            weighting: "20% SBA Weight",
            type: "Alternative Assessment",
            policyRef: "Policy §7.2 Stratified Post-Mod"
          },
          guideline: "DoE Matric ATP: Finance requires Present vs Future annuity splits. IEB SAG: Level 4 comparisons of financial plans."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Trigonometry: 2D & 3D problems (Sine, Cosine & Area Rules)" },
            { name: "Differential Calculus: Limits, average gradient & first principles derivative" },
            { name: "Differential Calculus: Rules of differentiation (power rule & negative indices)" },
            { name: "Revision: Matric trial mock papers drills (P1 & P2)" }
          ],
          sba: {
            name: "SBA Term 1 Matric Trial Examinations",
            weighting: "35% SBA Weight",
            type: "Trial Examination Paper",
            policyRef: "Matric Moderation Protocol"
          },
          guideline: "DoE Matric ATP Target: Limits by Week 10. IEB SAG: Calculus paper covers 15% optimization & rate-of-change models."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Differential Calculus: Curve sketching, cubic functions intercepts" },
            { name: "Differential Calculus: Inflection points, concave up vs concave down" },
            { name: "Differential Calculus: Applied optimization, rates of change in physics" },
            { name: "Analytical Geometry: Circles with centers at origin vs point (a,b)" }
          ],
          sba: {
            name: "SBA Calculus Test 2",
            weighting: "15% SBA Weight",
            type: "Written Test",
            policyRef: "Matric Pre-Mod Protocol"
          },
          guideline: "DoE CAPS: Complete cubic function stationary points. IEB SAG: Focus on geometric optimization limits."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Analytical Geometry: Equation of tangents to circles from exterior points" },
            { name: "Euclidean Geometry: Ratio & Proportionality Theorems (parallel lines intercept)" },
            { name: "Euclidean Geometry: Similarity of triangles theorems & area ratio proofs" },
            { name: "Euclidean Geometry: Pythagorean Theorem proving by similarity ratios" }
          ],
          sba: {
            name: "SBA Matric Assignment 2 (Geometry)",
            weighting: "15% SBA Weight",
            type: "Alternative Assessment Portfolio",
            policyRef: "Policy §7.2 Stratified"
          },
          guideline: "DoE CAPS: Formal similarity proofs are mandatory. IEB: Complex overlapping geometrical configurations."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Syllabus Consolidation: Financial math annuities & calculus review" },
            { name: "Revision: Integration of Euclidean Geometry and Coordinate Circles" },
            { name: "Assessment: Mid-Year formal diagnostic controlled testing" },
            { name: "Moderation: SMT alignment of Matric academic performance trackers" }
          ],
          sba: {
            name: "SBA Term 2 Mid-Year Examination",
            weighting: "30% SBA Weight",
            type: "Full Controlled Mock Paper 1 & 2",
            policyRef: "FET Examination Schedule"
          },
          guideline: "DoE CAPS: Mid-Year exams cover 80% syllabus. IEB SAG: Standardise cognitive ratio boundaries."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Statistics: Regression line (y = A + Bx), least squares method" },
            { name: "Statistics: Correlation Coefficient (r) & scatter plot mappings" },
            { name: "Statistics: Bivariate data analysis, identifying outliers" },
            { name: "Probability: Fundamental Counting Principle, permutations & factorials" }
          ],
          sba: {
            name: "SBA Statistics & Counting Test",
            weighting: "15% SBA Weight",
            type: "Written Test",
            policyRef: "Policy §7.1 validation"
          },
          guideline: "DoE CAPS: Complete linear regression derivations. IEB SAG: Permutations must include grouping restrictions."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Probability: Circular arrangements, letters repetitions permutations" },
            { name: "Syllabus Synthesis: Paper 1 integrated trial preparations" },
            { name: "Syllabus Synthesis: Paper 2 integrated trial preparations" },
            { name: "Diagnostic Analysis: Common errors & misconceptions workshops" }
          ],
          sba: {
            name: "SBA Trial Preparations Task",
            weighting: "15% SBA Weight",
            type: "Trial Diagnostic Portfolio",
            policyRef: "Policy §7.2 Moderation"
          },
          guideline: "DoE CAPS: Comprehensive syllabus drills. IEB SAG: Emphasize Level 4 complex questions analysis."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Matric Preparatory Examinations: Mathematics Paper 1 (Algebra, Calculus, Finance)" },
            { name: "Matric Preparatory Examinations: Mathematics Paper 2 (Trig, Geometry, Stats)" },
            { name: "External Moderation: District and SMT compilation of SBA files" },
            { name: "Remedial Plan: Final revision drills on identified diagnostic gaps" }
          ],
          sba: {
            name: "SBA Term 3 Matric Trial Examinations",
            weighting: "35% SBA Weight",
            type: "Trial Examination Paper",
            policyRef: "Matric Moderation Protocol"
          },
          guideline: "DoE Matric ATP Target: Trial Exam completing by Week 10. IEB SAG: High cognitive problem solving focus."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Exam Preparation: Paper 1 Calculus and functions speed training" },
            { name: "Exam Preparation: Paper 2 Geometry and trigonometry proofs drills" },
            { name: "Diagnostic Re-Drills: High-scoring topics calibration" },
            { name: "National Senior Certificate (NSC) Exams: Standardised calibrations" }
          ],
          sba: {
            name: "Final Portfolio Validation",
            weighting: "10% SBA Weight",
            type: "Portfolio File audit",
            policyRef: "SMT Matric Certification check"
          },
          guideline: "DoE CAPS: Matric portfolio moderation. IEB SAG: Direct alignment of school files with board guidelines."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Final Examination: National NSC/IEB Paper 1 (Written Exam)" },
            { name: "Final Examination: National NSC/IEB Paper 2 (Written Exam)" },
            { name: "Department Diagnostics: Script reviews and baseline tracking" },
            { name: "Year-End Closure: Mathematics Department inventory audits" }
          ],
          sba: {
            name: "External Matric Examinations (IEB / NSC)",
            weighting: "75% External Examination Weight",
            type: "National External Examinations",
            policyRef: "National Examinations Council standard"
          },
          guideline: "DoE CAPS Target: Final external exams. IEB SAG: Enforce secure board exam conditions."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Administrative: Final academic mark compilations and submissions" },
            { name: "SMT Review: Strategic analysis of departmental annual performance" },
            { name: "Curriculum Planning: Designing the next year ATP pacing sheets" },
            { name: "Closure: Holiday schedules and educator development rosters" }
          ],
          sba: {
            name: "Final Departmental Signoff",
            weighting: "Promotions Approval",
            type: "Governance Review Checklist",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS: Complete final records. IEB SAG: Record storage protocols."
        }
      ]
    }
  },
  {
    id: "ieb-gr12-mathlit",
    name: "Grade 12 Mathematical Literacy",
    framework: "IEB",
    phase: "FET Phase (Grade 12)",
    subTitle: "DBE CAPS Annual Teaching Plan + IEB Subject Assessment Guidelines (SAGs)",
    educators: ["Mpofu", "Reggie"],
    defaultEducator: "Mpofu",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Finance: Personal income tax (SARS tax tables, rebates, thresholds)" },
            { name: "Finance: Tariffs (sliding scale municipal water & electricity tariffs)" },
            { name: "Finance: Household budgets, inflation rates & income statements" },
            { name: "Finance: Hire purchase interest, loan amortization & bank charges comparisons" }
          ],
          sba: {
            name: "SBA MathLit Assignment (Taxation & Budgeting)",
            weighting: "15% SBA Weight",
            type: "Practical Investigation",
            policyRef: "Policy §7.1 & §7.2 Audit"
          },
          guideline: "DoE ATP: Focus on household fiscal taxation. IEB SAG: Emphasize Level 4 analytical decision comparisons."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Measurement: Metric/imperial conversions & packing packaging densities" },
            { name: "Measurement: Perimeter & Area of complex compound 2D shapes" },
            { name: "Measurement: Volume & Surface Area of cylinders, prisms & spheres" },
            { name: "Maps & Plans: Floor plans, scale drawings, compass direction & grid layouts" }
          ],
          sba: {
            name: "SBA Finance & Measurement Written Test",
            weighting: "15% SBA Weight",
            type: "Written Test",
            policyRef: "Policy §7.1 Control"
          },
          guideline: "DoE ATP: Practical scale calculations on house blueprints. IEB SAG: Volume ratios vs freight packaging capacities."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Data Handling: Sampling methods, frequency distribution tables & tallies" },
            { name: "Data Handling: Mean, median, mode, range, quartiles & percentiles" },
            { name: "Data Handling: Box-and-whisker plots & identification of survey bias" },
            { name: "Probability: Compound events, tree diagrams & two-way contingency tables" }
          ],
          sba: {
            name: "SBA Term 1 MathLit Controlled Test",
            weighting: "30% SBA Weight",
            type: "Controlled Test",
            policyRef: "Standard Trial Moderation"
          },
          guideline: "DoE ATP Target: Finish probability trees by Week 11. IEB SAG: Focus on real-world raw data misrepresentation critiques."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Finance: Advanced loan options, calculating principal vs interest payments" },
            { name: "Finance: Break-even analysis, fixed vs variable cost graphs interpretation" },
            { name: "Measurement: Packing layout optimization, estimating product spatial fits" },
            { name: "Measurement: Cooking temperatures and liquid measure conversions" }
          ],
          sba: {
            name: "SBA Break-even Investigation 2",
            weighting: "15% SBA Weight",
            type: "Investigation Portfolio",
            policyRef: "Policy §7.1 validation"
          },
          guideline: "DoE CAPS: Complete graphs break-even equations. IEB: Focus on cost-effectiveness calculations."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Maps & Plans: Strip maps, highway distance estimation, travel times" },
            { name: "Maps & Plans: Assembly plans (interpreting visual steps sequences)" },
            { name: "Maps & Plans: Elevation plans, cross-sectional views interpretation" },
            { name: "Data Handling: Organizing raw survey data, calculating grouped frequencies" }
          ],
          sba: {
            name: "SBA Maps & Assembly Practical",
            weighting: "15% SBA Weight",
            type: "Practical Exam",
            policyRef: "Policy §7.2 Quality control"
          },
          guideline: "DoE CAPS: Use strip map layouts. IEB: Emphasize 3D assembly models tracking."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Syllabus Integration: Integrated finance taxation and travel strip maps" },
            { name: "Revision: Analysis of Paper 1 (Basic Skills) vs Paper 2 (Applications)" },
            { name: "Assessment: Mid-Year formal diagnostics testing" },
            { name: "Moderation: Portfolio reviews and diagnostic markers adjustments" }
          ],
          sba: {
            name: "SBA Term 2 Mid-Year Examination",
            weighting: "30% SBA Weight",
            type: "Mid-Year Written Examination",
            policyRef: "FET Governance schedule"
          },
          guideline: "DoE CAPS: Complete mid-year portfolios. IEB: Ensure Paper 2 has open-ended reasoning (20%)."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Finance: Exchange rates, buying and selling currencies commissions" },
            { name: "Finance: Cost comparisons of transportation plans, toll tariffs" },
            { name: "Measurement: Floor tiling spatial layouts, calculating grout gaps waste percentage" },
            { name: "Measurement: Packaging optimization, stacking rectangular boxes on pallets" }
          ],
          sba: {
            name: "SBA Finance & Space Assignment",
            weighting: "15% SBA Weight",
            type: "Practical Investigation Task",
            policyRef: "Policy §7.1 checking"
          },
          guideline: "DoE CAPS: Complete exchange rates matrices. IEB SAG: Waste estimation calculations under cost constraints."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Probability: Expressing probability in fractions, decimals & percentages" },
            { name: "Probability: Risk calculations in medical or sports context scenarios" },
            { name: "Data Handling: Bivariate scatter plots, trend lines and prediction limits" },
            { name: "Consolidation: Exam Paper 1 and Paper 2 diagnostics speed training" }
          ],
          sba: {
            name: "SBA Trial Preparation Written Test",
            weighting: "15% SBA Weight",
            type: "Controlled Test Paper",
            policyRef: "Policy §7.1 & §7.2 Audit"
          },
          guideline: "DoE CAPS: Complete probability distributions. IEB: High focus on predictive trend line reasoning."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Matric Trial Examinations: Mathematical Literacy Paper 1 (Basic Skills)" },
            { name: "Matric Trial Examinations: Mathematical Literacy Paper 2 (Applications)" },
            { name: "SMT Compilation: Year-end SBA portfolio marking schedules signatures" },
            { name: "Diagnostic Corrections: Target drills on poor performance sub-questions" }
          ],
          sba: {
            name: "SBA Term 3 Matric Trial Examinations",
            weighting: "35% SBA Weight",
            type: "Trial Examination Paper",
            policyRef: "Matric Moderation Protocol"
          },
          guideline: "DoE Matric ATP Target: Complete trial marking by Week 10. IEB SAG: Review Level 4 moderation logs."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Exam Preparation: Paper 1 financial documents reading speeds" },
            { name: "Exam Preparation: Paper 2 spatial maps and elevation readings" },
            { name: "Remedial Drills: Grouped calculations standard techniques" },
            { name: "Administrative: Final SBA portfolios submission and signoff" }
          ],
          sba: {
            name: "SBA Final Portfolio Submission",
            weighting: "10% SBA Weight",
            type: "Portfolio File Audit",
            policyRef: "SMT Certification schedule"
          },
          guideline: "DoE CAPS: Final moderation check. IEB SAG: Complete standard files compliance."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Final Examination: National NSC/IEB MathLit Paper 1 (Basic Skills)" },
            { name: "Final Examination: National NSC/IEB MathLit Paper 2 (Applications)" },
            { name: "Diagnostics: Marks rosters validation and SMT diagnostic analysis" },
            { name: "Closure: Departmental inventory lockups and planning meetings" }
          ],
          sba: {
            name: "External Matric Examinations (IEB / NSC)",
            weighting: "75% External Examination Weight",
            type: "National External Examinations",
            policyRef: "National Examinations Council standard"
          },
          guideline: "DoE CAPS Target: Final external exams. IEB SAG: Standard secure board guidelines."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Administrative: Promotion rosters final approval from Department Head" },
            { name: "Analysis: Report drafting of yearly MathLit results progressions" },
            { name: "Forward Planning: Formulating Grade 10-11 text books distributions lists" },
            { name: "Holiday: Closure and staff development training calendars" }
          ],
          sba: {
            name: "Final Departmental Signoff",
            weighting: "Promotions Approval",
            type: "Governance Review Checklist",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS: Record completion. IEB SAG: Complete archive procedures."
        }
      ]
    }
  },
  {
    id: "cambridge-igcse-math",
    name: "Cambridge IGCSE Mathematics (0580)",
    framework: "Cambridge",
    phase: "High School (IGCSE)",
    subTitle: "Cambridge International IGCSE Syllabus (Core / Extended Curriculum Guidelines)",
    educators: ["Reggie", "Luthando"],
    defaultEducator: "Reggie",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Number: Prime factors, HCF/LCM, sets, surds & rational vs irrational numbers" },
            { name: "Algebra: Rearranging formulas, indices laws & algebraic expansions" },
            { name: "Algebra: Solving simultaneous equations & quadratic expressions" },
            { name: "Mensuration: Perimeter, area & volume of complex circles, prisms & spheres" }
          ],
          sba: {
            name: "Cambridge Diagnostic Test 1 (Algebra)",
            weighting: "15% Internal Weight",
            type: "Paper 2 Short Answer Format",
            policyRef: "Cambridge Board Guidelines"
          },
          guideline: "Syllabus Ref: Section 1 (Number) & Section 2 (Algebra). Method (M) and Accuracy (A) marks must align with 0580 board rubric."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Geometry: Angles of lines & polygons, circle theorems (angle at center)" },
            { name: "Geometry: SOHCAHTOA trig ratios, Pythagoras, Sine & Cosine rules" },
            { name: "Geometry: Transformations (reflection, translation, rotation, enlargements)" },
            { name: "Vectors: column vectors, magnitude, scalar dot product, addition" }
          ],
          sba: {
            name: "Cambridge Geometry Portfolio Task",
            weighting: "20% Internal Weight",
            type: "Practical Coursework File",
            policyRef: "Cambridge Quality moderation"
          },
          guideline: "Syllabus Ref: Section 3 (Geometry). Extended syllabus requires proofs of Alternate Segment Theorem & 3D space trigonometry."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Statistics: cumulative frequency curves, histograms with varying class widths" },
            { name: "Probability: tree diagrams, conditional probability without replacements" },
            { name: "Coordinate Graphs: gradients of parallel & perpendicular lines (y=mx+c)" },
            { name: "Revision: Cambridge board Paper 2 and Paper 4 past trials drills" }
          ],
          sba: {
            name: "Cambridge IGCSE Mock trial trial",
            weighting: "35% Internal Weight",
            type: "Board Mock Exam (Paper 2 & 4)",
            policyRef: "Cambridge Board grade boundaries"
          },
          guideline: "Syllabus Ref: Section 8 (Probability). Tangents tangent derivations require mechanical ruler alignments on curve stationary points."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Algebra: Direct and Inverse Variation equations (y = k/x, y = kx^2)" },
            { name: "Algebra: Simplifying algebraic fractions, adding with non-numerical LCDs" },
            { name: "Algebra: Solving equations involving algebraic fractions quadratics" },
            { name: "Functions: Composite functions composition, f(g(x)) & inverse function f^-1(x)" }
          ],
          sba: {
            name: "Cambridge Variation & Functions Test",
            weighting: "15% Internal Weight",
            type: "Written Class Test (Paper 2 & 4 style)",
            policyRef: "Cambridge Moderation standards"
          },
          guideline: "Syllabus Ref: Section 2 (Algebra). Extended functions demand precise domain and range graphs sketching."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Trigonometry: Area of non-right angled triangles, solving with acute/obtuse angles" },
            { name: "Trigonometry: Bearings navigation (three-figure bearings measured from North)" },
            { name: "Trigonometry: Three-dimensional (3D) trigonometry, finding angle with planes" },
            { name: "Vectors: Vector geometry proofs, parallel lines proofs in polygons" }
          ],
          sba: {
            name: "Cambridge Bearings & Vectors Portfolio",
            weighting: "20% Internal Weight",
            type: "Diagnostic Assignment Project",
            policyRef: "Internal Assessment Audit"
          },
          guideline: "Syllabus Ref: Section 5 (Vectors & Transformations). Bearings always must include three-figure notations (e.g. 045°)."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Geometry: Loci and construction using compass and rulers" },
            { name: "Graphs: Drawing curve functions (cubic, exponential, reciprocal graphs)" },
            { name: "Assessment: formal Mid-Year Cambridge-styled assessment papers" },
            { name: "Review: Mark boundaries calibration and pupil progress reports logs" }
          ],
          sba: {
            name: "Cambridge Term 2 Mid-Year Examinations",
            weighting: "30% Internal Weight",
            type: "Cambridge Mock Board Paper 2 & 4",
            policyRef: "Cambridge External Grade Alignments"
          },
          guideline: "Syllabus Ref: Section 4 (Geometry). Compass construction arcs must be left visible for board marking."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Calculus: Introduction to differentiation, derivative of ax^n powers" },
            { name: "Calculus: Finding gradients of tangents, stationary turning points on curves" },
            { name: "Calculus: Applied velocity, acceleration rates-of-change kinematic models" },
            { name: "Matrices: Matrix addition, subtraction, scalar multiplication" }
          ],
          sba: {
            name: "Cambridge Introductory Calculus Test",
            weighting: "15% Internal Weight",
            type: "Written controlled test",
            policyRef: "Cambridge 0580 marking guides"
          },
          guideline: "Syllabus Ref: Section 9 (Differentiation). Stationary point derivatives must be proved using first-derivative signs tables."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Matrices: Multiplication of 2x2 matrices, finding Determinant & Inverse" },
            { name: "Matrices: Solving simultaneous equations using matrix inverse methods" },
            { name: "Transformations: Combined transformations, matrix representations of rotation" },
            { name: "Probability: Conditional probability with Tree Diagrams without replacement" }
          ],
          sba: {
            name: "Cambridge Matrices & Probability Portfolio",
            weighting: "15% Internal Weight",
            type: "Coursework portfolio",
            policyRef: "Eagle House Assessment standards"
          },
          guideline: "Syllabus Ref: Section 5 & Section 8. Transformations matrices must be verified using coordinate checks."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Statistics: Cumulative frequency curves, estimating median and quartiles" },
            { name: "Statistics: Drawing histograms with unequal class intervals density" },
            { name: "Syllabus Synthesis: Paper 4 multi-step problem solving speed training" },
            { name: "Board Trials: Full trial examination Paper 2 & Paper 4" }
          ],
          sba: {
            name: "Cambridge Term 3 Mock board trials",
            weighting: "35% Internal Weight",
            type: "Extended Board Mock Examination",
            policyRef: "Cambridge External calibration"
          },
          guideline: "Syllabus Ref: Section 7 (Statistics). Histograms require frequency density calculations (Height = Frequency / Class Width)."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Exam Prep: Paper 2 algebra and numbers formulas drills" },
            { name: "Exam Prep: Paper 4 geometry circle theorems and trigonometric Bearings" },
            { name: "Diagnostic Re-drills: Calculus stationary points speed solving" },
            { name: "Administrative: Assembly of Cambridge external board files logs" }
          ],
          sba: {
            name: "Final Cambridge Portfolio Check",
            weighting: "Formative Approval",
            type: "Quality Review portfolio",
            policyRef: "Cambridge Quality moderation"
          },
          guideline: "Syllabus Ref: General 0580. Enforce all calculator settings standardisations (use 3 significant figures)."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Cambridge External Board Exams: Paper 2 Core or Extended (Short answer)" },
            { name: "Cambridge External Board Exams: Paper 4 Core or Extended (Structured)" },
            { name: "Diagnostics: Marks submissions, reviewing board diagnostic feedback logs" },
            { name: "Administrative: Grade boundaries conversions and internal reportings" }
          ],
          sba: {
            name: "Cambridge IGCSE 0580 External Board Exams",
            weighting: "100% External Board Score",
            type: "External Cambridge Examination Paper",
            policyRef: "Cambridge International Examinations Council"
          },
          guideline: "Syllabus Ref: General 0580. Ensure secure vault and board exam protocol adherence."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Administrative: Closing department marks registers, locking grades" },
            { name: "Review: Formulating report on department Cambridge achievement trends" },
            { name: "Curriculum Planning: Map transition to Cambridge AS-Level 9709 Core" },
            { name: "Holiday: Closure and staff development calendars signoff" }
          ],
          sba: {
            name: "Final Departmental Signoff",
            weighting: "Promotions Approval",
            type: "Governance Review Checklist",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "Syllabus Ref: General 0580. Final archive procedures."
        }
      ]
    }
  },
  {
    id: "cambridge-as-math",
    name: "Cambridge AS-Level Mathematics (9709)",
    framework: "Cambridge",
    phase: "AS-Level Stream",
    subTitle: "Cambridge International AS & A Level (Pure Mathematics P1 + Stats S1 Guidelines)",
    educators: ["Reggie", "Shingi"],
    defaultEducator: "Reggie",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "P1 Quadratics: completing the square, discriminant roots, intersections" },
            { name: "P1 Functions: domain, range, one-to-one mapping, composite & inverses" },
            { name: "P1 Coordinate Geometry: equations of lines, circles, distance & tangents" },
            { name: "P1 Circular Measure: Radian angles, arc length, sector areas calculations" }
          ],
          sba: {
            name: "Cambridge AS Unit Test 1 (Functions)",
            weighting: "15% Internal Weight",
            type: "Advanced Analytical Paper",
            policyRef: "AS Level Mark standards"
          },
          guideline: "Syllabus Ref: Pure Mathematics P1. Radian calculation is mandatory in circular measure (use radian mode in scientific calculators)."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "P1 Trigonometry: graphs of sin/cos/tan, fundamental identities, equations" },
            { name: "P1 Sequences: Arithmetic Progression (AP) and summation formulas" },
            { name: "P1 Sequences: Geometric Progression (GP) and sum to infinity convergent limits" },
            { name: "P1 Vectors: column vectors, scalar product, magnitude & 3D space vectors" }
          ],
          sba: {
            name: "Cambridge AS Trig & Sequences Assignment",
            weighting: "15% Internal Weight",
            type: "Advanced Problem Set",
            policyRef: "A-Level Academic Standards"
          },
          guideline: "Syllabus Ref: Pure Mathematics P1. Geometric progression summation proofs must be mathematically rigorous."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "P1 Calculus: differentiation rules, stationary points, rates & normals" },
            { name: "P1 Calculus: integration of algebraic functions, areas & volume of revolution" },
            { name: "S1 Statistics: box plots, histograms, cumulative frequency density curves" },
            { name: "S1 Probability: permutations & combinations with identical item constraints" }
          ],
          sba: {
            name: "Cambridge AS Trial Mock Paper 1 (9709/11)",
            weighting: "35% Internal Weight",
            type: "AS Level Board Mock Paper",
            policyRef: "Cambridge External Mock Calibration"
          },
          guideline: "Syllabus Ref: Probability & Statistics S1. Focus heavily on circular arrangements and identical item group restrictions."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "P1 Calculus: Second derivatives d^2y/dx^2, determining Nature of turning points" },
            { name: "P1 Calculus: Integration as limit of a sum, finding areas enclosed by curves & lines" },
            { name: "P1 Calculus: Volume of Revolution generated by rotating curves about axes" },
            { name: "P1 Trigonometry: Advanced identities solving with composite angle shifts" }
          ],
          sba: {
            name: "Cambridge AS Calculus & Trig Test",
            weighting: "15% Internal Weight",
            type: "Written Test (P1 style)",
            policyRef: "AS Level Mark boundaries"
          },
          guideline: "Syllabus Ref: Pure Mathematics P1. Volume of revolution must clearly list upper and lower integration limits."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "S1 Statistics: Summarising data, mean and standard deviation of grouped datasets" },
            { name: "S1 Probability: Mutually exclusive & independent events, multiplication rule" },
            { name: "S1 Probability: Conditional Probability formula calculations, P(A|B)" },
            { name: "S1 Discrete Random Variables: Probability distribution tables, Expectation E(X)" }
          ],
          sba: {
            name: "Cambridge S1 Statistics Portfolio",
            weighting: "15% Internal Weight",
            type: "Data portfolio task",
            policyRef: "A-Level Quality Moderation"
          },
          guideline: "Syllabus Ref: Statistics S1. Expectation calculations must prove Sum(P) = 1 constraint."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "P1 & S1 Integration: Integrated calculus & statistical median estimations" },
            { name: "Consolidation: Pure Math P1 Paper past trials speed calibrations" },
            { name: "Assessment: Mid-Year Cambridge AS standard board diagnostic testing" },
            { name: "Moderation: Calibration of AS trial mock marks boundaries" }
          ],
          sba: {
            name: "Cambridge AS Term 2 Mid-Year Examination",
            weighting: "30% Internal Weight",
            type: "AS Level Board Mock (Pure P1 + Stats S1)",
            policyRef: "AS Level Grade Boundaries Calibration"
          },
          guideline: "Syllabus Ref: P1 & S1. Mid-Year mock examinations mirror real board structures (Paper 11 & Paper 51)."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "S1 Probability: Permutations and Combinations in circular space arrangements" },
            { name: "S1 Binomial Distribution: Binomial coefficients, calculating mean & variance np" },
            { name: "S1 Normal Distribution: Standardising variable Z, using Normal tables" },
            { name: "S1 Normal Distribution: Inverse Normal calculations, finding mean or deviation" }
          ],
          sba: {
            name: "Cambridge S1 Normal Distribution Test",
            weighting: "15% Internal Weight",
            type: "Written Test (S1 Style)",
            policyRef: "Cambridge 9709 marking standards"
          },
          guideline: "Syllabus Ref: Statistics S1. Normal distribution requires continuity corrections when approximating discrete binomials."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "P1 Quadratics: Advanced composite functions mapping, range boundaries" },
            { name: "P1 Sequences: Infinite geometric progression summation limit proofs" },
            { name: "P1 Coordinate Geometry: Proving circle equations intersecting chords tangent lengths" },
            { name: "P1 Circular Measure: Area of composite shapes, nested segments with radian sectors" }
          ],
          sba: {
            name: "Cambridge AS Pure P1 Portfolio Task",
            weighting: "15% Internal Weight",
            type: "AS Level portfolio assignment",
            policyRef: "Eagle House Academic Standards"
          },
          guideline: "Syllabus Ref: Pure Mathematics P1. Radian geometric setups require multiple cosine theorem checks."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Syllabus Synthesis: Combined Pure Mathematics P1 speed trials" },
            { name: "Syllabus Synthesis: Combined Statistics S1 speed trials" },
            { name: "Assessment: Preparatory board examinations diagnostics reports" },
            { name: "Moderation: FinalDistrict-wide AS level moderation logs signatures" }
          ],
          sba: {
            name: "Cambridge AS Level Preparatory board mock trials",
            weighting: "35% Internal Weight",
            type: "AS Level Extended Board Mock Exam",
            policyRef: "AS External Mock Calibration"
          },
          guideline: "Syllabus Ref: P1 & S1. Focus on circular arrangements permutations and standard binomial coefficients."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "AS Exam Prep: Pure Math P1 derivative applications curve stationary points" },
            { name: "AS Exam Prep: Stats S1 Normal distribution tables lookups velocity" },
            { name: "Diagnostic Re-drills: Permutations and identical items constraints" },
            { name: "Administrative: Compiling external Cambridge AS level folders registers" }
          ],
          sba: {
            name: "Final AS-Level Portfolio Review",
            weighting: "Formative Approval",
            type: "AS Portfolio Audit",
            policyRef: "SMT AS level audit check"
          },
          guideline: "Syllabus Ref: General 9709. Verify non-programmable calculator settings."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Cambridge AS Board Examination: Pure Mathematics 1 (9709/11)" },
            { name: "Cambridge AS Board Examination: Probability & Statistics 1 (9709/51)" },
            { name: "Diagnostics: Submissions of Board logs, evaluating boundaries shifts" },
            { name: "Administrative: Grading reports formulation for department archives" }
          ],
          sba: {
            name: "Cambridge International AS Level Board Exams",
            weighting: "100% External Board Score",
            type: "External Cambridge Examination Paper",
            policyRef: "Cambridge International Examinations Board"
          },
          guideline: "Syllabus Ref: General 9709. Adhere strictly to external examinations clock protocols."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Administrative: Locking department mark sheets and promotion rosters" },
            { name: "Review: Comprehensive annual analysis of Cambridge AS progress" },
            { name: "Curriculum Planning: Map transition to A-Level Pure P3 & Stats S2" },
            { name: "Holiday: Closure and staff development training rosters signatures" }
          ],
          sba: {
            name: "Final Departmental Signoff",
            weighting: "Promotions Approval",
            type: "Governance Review Checklist",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "Syllabus Ref: General 9709. Complete final record files storage."
        }
      ]
    }
  },
  {
    id: "ieb-gr9-math",
    name: "Grade 9 CAPS Mathematics",
    framework: "CAPS",
    phase: "Senior Phase (Grade 9)",
    subTitle: "DoE CAPS Senior Phase Annual Teaching Plan - High School Base Foundation",
    educators: ["Reggie", "Luthando"],
    defaultEducator: "Reggie",
    terms: {
      1: [
        {
          cycleNum: 1,
          weeks: "Term 1 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Numbers: Real numbers classification, rational vs irrational identification" },
            { name: "Operations: Laws of exponents, scientific notation index calculations" },
            { name: "Patterns: Numeric and geometric patterns, finding general terms" },
            { name: "Algebra: Algebraic expressions, products of binomials & expansions" }
          ],
          sba: {
            name: "CAPS Gr9 Algebra Test 1",
            weighting: "10% SBA Weight",
            type: "Controlled Class Test",
            policyRef: "CAPS Senior Phase Guidelines"
          },
          guideline: "DoE Senior Phase ATP: Ensure algebra includes negative coefficients. Grade 9 establishes base skills for FET algebra."
        },
        {
          cycleNum: 2,
          weeks: "Term 1 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Equations: Solving linear equations & introductory quadratic forms" },
            { name: "Geometry: Straight lines geometric angles (vertically opp, alternate, corresponding)" },
            { name: "Geometry: Triangles congruence & similarity formal geometric proofs" },
            { name: "Geometry: Pythagoras' Theorem applications in right-angled models" }
          ],
          sba: {
            name: "CAPS Gr9 Term 1 Project (Geometric Proofs)",
            weighting: "20% SBA Weight",
            type: "Alternative Assessment Project",
            policyRef: "Policy §7.1 and §7.2"
          },
          guideline: "DoE Senior Phase ATP: Triangle congruency is a priority. Enforce correct shorthand labels (S, S, S / S, A, S)."
        },
        {
          cycleNum: 3,
          weeks: "Term 1 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Measurement: Perimeter & Area of 2D polygons and circles" },
            { name: "Measurement: Surface Area & Volume of rectangular prisms & cylinders" },
            { name: "Data Handling: Collecting data, drawing histograms, pie charts & bar graphs" },
            { name: "Data Handling: Mean, median, mode, dispersion range & basic probability" }
          ],
          sba: {
            name: "CAPS Gr9 Controlled Exam 2",
            weighting: "30% SBA Weight",
            type: "Controlled Examination",
            policyRef: "Senior Phase Policy Schedule"
          },
          guideline: "DoE Senior Phase ATP: Statistics questions must use real data contexts. Probability focuses on relative frequency."
        }
      ],
      2: [
        {
          cycleNum: 1,
          weeks: "Term 2 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Algebra: Multiplying binomials, dividing polynomials by monomials" },
            { name: "Algebra: Factorising algebraic expressions (Common Factor, Trinomials)" },
            { name: "Algebra: Simplifying algebraic fractions, multiplication & division" },
            { name: "Equations: Solving linear equations with fractional coefficients" }
          ],
          sba: {
            name: "SBA Class Test 3 (Algebra Factorisation)",
            weighting: "10% SBA Weight",
            type: "Controlled Class Test",
            policyRef: "Policy §7.1 pre-moderation"
          },
          guideline: "DoE ATP: Emphasize quadratic trinomial factorization. Senior phase is a critical foundation for CAPS FET."
        },
        {
          cycleNum: 2,
          weeks: "Term 2 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Graphs: Drawing straight-line graphs using intercept/gradient method" },
            { name: "Graphs: Finding equations of straight lines from graphs" },
            { name: "Graphs: Global properties of graphs (Increasing, Decreasing, Intercepts)" },
            { name: "Euclidean Geometry: Interior angles of polygons, sum of interior angles formula" }
          ],
          sba: {
            name: "SBA Linear Graphs Assignment",
            weighting: "20% SBA Weight",
            type: "Written Practical Assignment",
            policyRef: "Policy §7.2 post-moderation"
          },
          guideline: "DoE ATP: Straight-line intercept skills are key. Geometry polygon proofs must list valid shorthand."
        },
        {
          cycleNum: 3,
          weeks: "Term 2 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Euclidean Geometry: Proving congruent triangles theorems (formal layouts)" },
            { name: "Euclidean Geometry: Similarity of triangles (equiangular conditions)" },
            { name: "Revision: Comprehensive Term 2 factorisation and graphs integration" },
            { name: "Assessment: Mid-Year controlled examinations diagnostics feedback" }
          ],
          sba: {
            name: "SBA Term 2 Mid-Year Examination",
            weighting: "30% SBA Weight",
            type: "Mid-Year Examination Paper",
            policyRef: "Senior Phase Moderation schedule"
          },
          guideline: "DoE CAPS ATP Target: Complete congruency proofs. IEB SAG: Proportionality in congruent setups."
        }
      ],
      3: [
        {
          cycleNum: 1,
          weeks: "Term 3 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Measurement: Converting between mm^2, cm^2, m^2, mm^3, cm^3, m^3" },
            { name: "Measurement: Volume and surface area of triangular prisms and spheres" },
            { name: "Measurement: Effects of doubling/halving dimensions on area & volume" },
            { name: "Euclidean Geometry: Angle relationships in intersecting straight lines proofs" }
          ],
          sba: {
            name: "SBA Measurement Practical Investigation",
            weighting: "15% SBA Weight",
            type: "Practical Assessment Portfolio",
            policyRef: "Policy §7.1 pre-moderation"
          },
          guideline: "DoE CAPS: Enforce correct spatial conversion factors (e.g. 1 m^3 = 1,000,000 cm^3). IEB SAG: Scale changes ratio proofs."
        },
        {
          cycleNum: 2,
          weeks: "Term 3 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Data Handling: Collecting primary data, constructing grouped interval tallies" },
            { name: "Data Handling: Calculating mean, median, mode of grouped datasets" },
            { name: "Data Handling: Drawing bar graphs, double bar graphs, pie charts" },
            { name: "Probability: Expressing simple outcomes in fractions & percentages" }
          ],
          sba: {
            name: "SBA Data Handling Test",
            weighting: "15% SBA Weight",
            type: "Controlled Class Test",
            policyRef: "Policy §7.1 standard check"
          },
          guideline: "DoE CAPS: Drawing grouped bars on grid paper. IEB: Bias detection and surveys critique reasoning."
        },
        {
          cycleNum: 3,
          weeks: "Term 3 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "Probability: Venn diagrams representation, mutually exclusive outcomes" },
            { name: "Probability: Tree diagrams representing up to two consecutive coin tosses" },
            { name: "Revision: Integration of Measurement and Statistics problem sets" },
            { name: "Assessment: formal Term 3 controlled diagnostics diagnostics" }
          ],
          sba: {
            name: "SBA Term 3 Controlled Examination",
            weighting: "30% SBA Weight",
            type: "Controlled Paper Exam",
            policyRef: "Senior Phase Governance Protocols"
          },
          guideline: "DoE CAPS ATP Target: Complete probability. IEB: Emphasize relative vs theoretical frequencies."
        }
      ],
      4: [
        {
          cycleNum: 1,
          weeks: "Term 4 - Weeks 1-4 (Cycle 1)",
          topics: [
            { name: "Syllabus Revision: Numbers and algebra operations speed training" },
            { name: "Syllabus Revision: Geometry proofs and equations coordinates calculations" },
            { name: "Diagnostic Re-drills: Fraction simplification common errors" },
            { name: "Administrative: Portfolios compilation and year-end moderation file check" }
          ],
          sba: {
            name: "SBA Final Portfolio Signoff",
            weighting: "10% SBA Weight",
            type: "Assessment Portfolio review",
            policyRef: "HOD Portfolio Audit"
          },
          guideline: "DoE CAPS: Enforce 100% completion of formal SBA marks. IEB: Ensure moderated sample matches rules."
        },
        {
          cycleNum: 2,
          weeks: "Term 4 - Weeks 5-8 (Cycle 2)",
          topics: [
            { name: "Year-End Examination: Grade 9 Math Paper 1 (Algebra & Patterns)" },
            { name: "Year-End Examination: Grade 9 Math Paper 2 (Geometry & Space)" },
            { name: "Diagnostics: Submissions of Year-end rosters, marks verification" },
            { name: "Administrative: Grade promotions checklists and department audits" }
          ],
          sba: {
            name: "Final Year-End Promotion Examinations",
            weighting: "60% Final Promotion Mark",
            type: "External Moderated Exam Paper",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS Year-End Target: Complete Papers 1 & 2. IEB SAG: Strictly standardise cognitive weight demands."
        },
        {
          cycleNum: 3,
          weeks: "Term 4 - Weeks 9-12 (Cycle 3)",
          topics: [
            { name: "SMT Assessment: Compilation of strategic performance review charts" },
            { name: "Curriculum Planning: Constructing Grade 10 Core Math bridging materials" },
            { name: "Administrative: Final record logs archive and classroom layouts closure" },
            { name: "Holiday: Closing departments staff rosters signoff" }
          ],
          sba: {
            name: "Final Departmental Signoff",
            weighting: "Promotions Approval",
            type: "Governance Review Checklist",
            policyRef: "Eagle House Year-End promotion policy"
          },
          guideline: "DoE CAPS: Final data entry. IEB SAG: Storage archival standards."
        }
      ]
    }
  }
];

export const CurriculumView: React.FC = () => {
  // Term Selector State (Term 1, Term 2, Term 3, Term 4)
  const [selectedTerm, setSelectedTerm] = useState<number>(1);

  // Navigation Framework Selector (IEB / CAPS / Cambridge)
  const [selectedFramework, setSelectedFramework] = useState<"IEB" | "CAPS" | "Cambridge">("IEB");
  
  // Interactive ATP Subject Stream selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ieb-gr10-math");

  // Filtering subjects by selected framework
  const filteredSubjects = SUBJECT_ATPS.filter(
    (s) => s.framework === selectedFramework
  );

  // Fallback if the selected subject is not in the filtered framework
  const activeSubjectAtp =
    filteredSubjects.find((s) => s.id === selectedSubjectId) ||
    filteredSubjects[0] ||
    SUBJECT_ATPS[0];

  // Selected Educator for pacing audit
  const [selectedEducator, setSelectedEducator] = useState<string>(activeSubjectAtp.defaultEducator);

  // Sync educator selection when subject changes
  React.useEffect(() => {
    setSelectedEducator(activeSubjectAtp.defaultEducator);
  }, [selectedSubjectId]);

  // Production starts with no claimed teaching progress.
  // Topic/SBA status becomes factual only after an educator records it.
  const [topicCompletions, setTopicCompletions] = useState<Record<string, boolean>>({});
  const [sbaStatuses, setSbaStatuses] = useState<Record<string, string>>({});

  // Helper to toggle a single topic completion
  const handleToggleTopic = (subjectId: string, educator: string, termNum: number, cycleNum: number, topicIdx: number) => {
    const key = `${subjectId}-${educator}-term${termNum}-cycle${cycleNum}-topic${topicIdx}`;
    setTopicCompletions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to update SBA status
  const handleUpdateSbaStatus = (subjectId: string, educator: string, termNum: number, cycleNum: number, status: string) => {
    const key = `${subjectId}-${educator}-term${termNum}-cycle${cycleNum}`;
    setSbaStatuses((prev) => ({
      ...prev,
      [key]: status,
    }));
  };

  // Safe fetch of standard curriculum policy info
  const activePolicy =
    CURRICULUM_POLICIES.find((p) =>
      p.framework.toLowerCase().includes(selectedFramework.toLowerCase())
    ) || CURRICULUM_POLICIES[0];

  // Helper to get status color classes for SBA status badges
  const getSbaStatusBadge = (status: string) => {
    switch (status) {
      case "Administered & Scored":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Pre-Moderation":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Drafting & Mapping":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Subject Resource Library State
  const [activeSubView, setActiveSubView] = useState<"atp" | "library">("atp");
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>("all");
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState<boolean>(false);
  const [newModuleName, setNewModuleName] = useState<string>("");
  const [newModuleCategory, setNewModuleCategory] = useState<ResourceItem["category"]>("Lesson Plans & Notes");
  const [newDriveUrl, setNewDriveUrl] = useState<string>("");
  const [newUploader, setNewUploader] = useState<string>("");

  // Resource library starts empty; resources are supplied by the department.
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const stored = localStorage.getItem("eaglehouse_subject_resources");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !newDriveUrl.trim()) return;

    const newItem: ResourceItem = {
      id: `RES-${Date.now()}`,
      subjectId: activeSubjectAtp.id,
      term: selectedTerm,
      year: 2026,
      moduleName: newModuleName.trim(),
      category: newModuleCategory,
      driveUrl: newDriveUrl.trim(),
      uploadedBy: newUploader,
      dateAdded: new Date().toISOString().split("T")[0],
    };

    const updated = [newItem, ...resources];
    setResources(updated);
    try {
      localStorage.setItem("eaglehouse_subject_resources", JSON.stringify(updated));
    } catch {}

    setNewModuleName("");
    setNewDriveUrl("");
    setIsAddResourceModalOpen(false);
  };

  // Fetching term details from school calendar
  const activeCalendarTerm = EAGLE_HOUSE_CALENDAR.find((c) => c.term === selectedTerm) || EAGLE_HOUSE_CALENDAR[0];

  // Fetch cycles for the active selected term
  const activeCycles = activeSubjectAtp.terms[selectedTerm] || [];

  return (
    <div className="space-y-6" id="curriculum-view-root">
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs" id="curriculum-header">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            EAGLE HOUSE GOVERNANCE SUITE
          </span>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2" id="curriculum-title">
            <BookOpen className="w-5.5 h-5.5 text-emerald-800" />
            Curriculum Pacing, SBA & ATP Management
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Verify progress against the Department of Education (DoE/DBE) CAPS Annual Teaching Plans (ATPs) with integrated IEB Subject Assessment Guidelines (SAGs), and appropriate Cambridge syllabi cycles.
          </p>
        </div>

        {/* Major Framework Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold shrink-0">
          <button
            onClick={() => {
              setSelectedFramework("IEB");
              const iebSub = SUBJECT_ATPS.find((s) => s.framework === "IEB");
              if (iebSub) setSelectedSubjectId(iebSub.id);
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              selectedFramework === "IEB"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            id="framework-btn-ieb"
          >
            IEB Stream (Gr 10-12)
          </button>
          <button
            onClick={() => {
              setSelectedFramework("Cambridge");
              const camSub = SUBJECT_ATPS.find((s) => s.framework === "Cambridge");
              if (camSub) setSelectedSubjectId(camSub.id);
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              selectedFramework === "Cambridge"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            id="framework-btn-cambridge"
          >
            Cambridge (LS / IGCSE / AS)
          </button>
          <button
            onClick={() => {
              setSelectedFramework("CAPS");
              const capsSub = SUBJECT_ATPS.find((s) => s.framework === "CAPS");
              if (capsSub) setSelectedSubjectId(capsSub.id);
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              selectedFramework === "CAPS"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            id="framework-btn-caps"
          >
            CAPS Senior (Gr 8-9)
          </button>
        </div>
      </div>

      {/* 2. TERM SELECTOR TABS BAR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" id="term-selector-container">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-800 shrink-0 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Academic Year Pacing</span>
            <span className="text-xs font-extrabold text-slate-800">Select Term for Audit</span>
          </div>
        </div>

        {/* Term Select Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold w-full md:w-auto">
          {[1, 2, 3, 4].map((termNum) => (
            <button
              key={termNum}
              onClick={() => setSelectedTerm(termNum)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all cursor-pointer text-center ${
                selectedTerm === termNum
                  ? "bg-emerald-850 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
              }`}
              id={`term-tab-${termNum}`}
            >
              Term {termNum}
            </button>
          ))}
        </div>
      </div>

      {/* Term Quick Focus Alert */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="term-focus-alert">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs uppercase">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Active Term Schedule: {activeCalendarTerm.name}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl">
            <strong>SMT Focus Guideline:</strong> &ldquo;{activeCalendarTerm.focus}&rdquo;
          </p>
        </div>
        <div className="px-3 py-1 bg-white border border-emerald-200 rounded-lg text-[10px] text-emerald-800 font-mono font-extrabold shadow-2xs shrink-0 self-start sm:self-center">
          {activeCalendarTerm.startDate} to {activeCalendarTerm.endDate}
        </div>
      </div>

      {/* Sub-View Switcher: ATP Pacing vs Subject Resource Library */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3" id="curriculum-subview-tabs">
        <button
          onClick={() => setActiveSubView("atp")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubView === "atp"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          id="subview-tab-atp"
        >
          <BookOpen className="w-4 h-4" />
          <span>ATP Pacing & SBA Audit</span>
        </button>
        <button
          onClick={() => setActiveSubView("library")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubView === "library"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          id="subview-tab-library"
        >
          <Folder className="w-4 h-4" />
          <span>Subject Resource Library (Google Drive Folders)</span>
          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono">
            {resources.filter(r => r.term === selectedTerm && r.subjectId === activeSubjectAtp.id).length}
          </span>
        </button>
      </div>

      {/* 3. Main Audit Engine & Tracker (ATP Mode) */}
      {activeSubView === "atp" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="curriculum-main-grid">
        {/* Left Control Sidebar */}
        <div className="col-span-1 space-y-4" id="curriculum-sidebar">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
              Pacing Controls
            </span>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase block">
                Select Academic Course
              </label>
              <div className="space-y-1">
                {filteredSubjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all border block relative ${
                      selectedSubjectId === sub.id
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                    id={`subject-select-${sub.id}`}
                  >
                    <div className="font-bold block truncate">{sub.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{sub.phase}</div>
                  </button>
                ))}
                {filteredSubjects.length === 0 && (
                  <p className="text-xs text-slate-400 p-2 italic">No courses found in this stream.</p>
                )}
              </div>
            </div>

            {/* Educator Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase block">
                Assigned Educator
              </label>
              <div className="relative">
                <select
                  value={selectedEducator}
                  onChange={(e) => setSelectedEducator(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-850 focus:border-emerald-855"
                  id="educator-select-dropdown"
                >
                  {activeSubjectAtp.educators.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu} (Mathematics)
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-2.5 pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Department Summary Alert */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3.5 space-y-1 text-left" id="hod-audit-mode-alert">
              <div className="flex items-center gap-1 text-emerald-800 font-bold text-[11px] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HOD Audit Mode Active</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                As Department Head, toggling any topic below updates the real-time compliance database for <strong>{selectedEducator}</strong>'s stream in <strong>Term {selectedTerm}</strong>.
              </p>
            </div>
          </div>

          {/* Quick Policy Checklist Card */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl space-y-3.5 shadow-xs border border-slate-800" id="framework-specs-card">
            <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
              Framework Specs
            </span>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Framework Class</span>
                <span className="font-bold text-white text-xs">{activeSubjectAtp.subTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Continuous SBA Weight</span>
                <span className="font-bold text-white text-xs">{activePolicy.sbaWeight}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cognitive Ratios</span>
                <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                  {activePolicy.cognitiveDemands}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4-Week Cycle Sheets */}
        <div className="col-span-1 lg:col-span-3 space-y-5" id="curriculum-cycles-container">
          {/* Header Description Banner */}
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4" id="curriculum-cycle-banner">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4.5 h-4.5 text-emerald-800" />
                <span>{activeSubjectAtp.name} - Term {selectedTerm} Pacing</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pacing tracker calibrated in strict 4-Week Cycles. Verify SBA task progression alongside syllabus coverage.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Educator:</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-emerald-800 shadow-2xs">
                {selectedEducator}
              </span>
            </div>
          </div>

          {/* 4-Week Cycle Worksheets */}
          <div className="space-y-4" id="cycles-list">
            {activeCycles.map((cycle) => {
              // Calculate Dynamically the Percentage Coverage for selected term
              const totalTopics = cycle.topics.length;
              const completedCount = cycle.topics.filter((_, idx) => {
                const key = `${activeSubjectAtp.id}-${selectedEducator}-term${selectedTerm}-cycle${cycle.cycleNum}-topic${idx}`;
                return !!topicCompletions[key];
              }).length;
              const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

              // Fetch corresponding SBA status for selected term
              const activeSbaStatus = sbaStatuses[`${activeSubjectAtp.id}-${selectedEducator}-term${selectedTerm}-cycle${cycle.cycleNum}`] || "Drafting & Mapping";

              return (
                <div
                  key={cycle.cycleNum}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                  id={`cycle-card-${cycle.cycleNum}`}
                >
                  {/* Cycle Header Status Bar */}
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/5 text-emerald-900 text-[10px] font-extrabold uppercase border border-emerald-950/10">
                          {cycle.weeks}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          Cycle {cycle.cycleNum} ATP Topics
                        </h3>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="flex items-center gap-4">
                      {/* Interactive Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                          <div
                            className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-extrabold text-xs text-slate-800 w-10 text-right">
                          {percentage}%
                        </span>
                      </div>

                      {/* Status pill based on progress */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 border ${
                          percentage === 100
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : percentage > 0
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {percentage === 100 ? "Fully Covered" : percentage > 0 ? "In Progress" : "Not Started"}
                      </span>
                    </div>
                  </div>

                  {/* Cycle Body Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Topics Checklist (Col-Span 3) */}
                    <div className="col-span-1 md:col-span-3 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Topic Checklist (Click to toggle coverage)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {completedCount} of {totalTopics} Completed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {cycle.topics.map((topic, idx) => {
                          const isComp = !!topicCompletions[`${activeSubjectAtp.id}-${selectedEducator}-term${selectedTerm}-cycle${cycle.cycleNum}-topic${idx}`];
                          return (
                            <button
                              key={idx}
                              onClick={() => handleToggleTopic(activeSubjectAtp.id, selectedEducator, selectedTerm, cycle.cycleNum, idx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all flex items-start gap-2.5 cursor-pointer ${
                                isComp
                                  ? "bg-emerald-50/40 border-emerald-100 text-slate-800"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                              id={`topic-toggle-${cycle.cycleNum}-${idx}`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isComp ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                              </div>
                              <span className={isComp ? "line-through text-slate-400 font-normal" : ""}>
                                {topic.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SBA Coverage & Framework Specifications (Col-Span 2) */}
                    <div className="col-span-1 md:col-span-2 p-5 bg-slate-50/50 space-y-4">
                      {/* SBA coverage details */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          SBA Milestone & Coverage
                        </span>

                        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2.5">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-emerald-800 text-white font-mono text-[9px] font-extrabold uppercase tracking-wide">
                              {cycle.sba.weighting}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs mt-1">{cycle.sba.name}</h4>
                            <p className="text-[10px] text-slate-500">{cycle.sba.type}</p>
                          </div>

                          <div className="border-t border-slate-100 pt-2 flex flex-col gap-1 text-[10px] text-slate-600">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>{cycle.sba.policyRef}</span>
                            </span>
                          </div>

                          {/* Interactive SBA Task Status Selector */}
                          <div className="border-t border-slate-100 pt-3 space-y-1.5">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase block">
                              SBA Coverage Status
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                value={activeSbaStatus}
                                onChange={(e) => handleUpdateSbaStatus(activeSubjectAtp.id, selectedEducator, selectedTerm, cycle.cycleNum, e.target.value)}
                                className="p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-800 cursor-pointer focus:outline-none"
                                id={`sba-status-select-${cycle.cycleNum}`}
                              >
                                <option value="Drafting & Mapping">Drafting & Mapping</option>
                                <option value="In Pre-Moderation">In Pre-Moderation</option>
                                <option value="Approved">Approved</option>
                                <option value="Administered & Scored">Administered & Scored</option>
                              </select>
                              <span className={`px-2 py-1 rounded-md text-[9px] font-extrabold border ${getSbaStatusBadge(activeSbaStatus)}`}>
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Framework specific guidelines */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Pacing & Quality Guidelines
                        </span>
                        <div className="p-3 bg-emerald-950/5 border border-emerald-900/10 rounded-lg">
                          <p className="text-[10px] text-slate-600 leading-normal italic">
                            &ldquo;{cycle.guideline}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeCycles.length === 0 && (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400 italic">
                No syllabus pacing cycles configured for Term {selectedTerm} in this subject.
              </div>
            )}
          </div>

          {/* Departmental Pacing Overview Map (At-a-Glance Table for the HOD) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4" id="curriculum-audit-map-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="space-y-0.5 text-left">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-800" />
                  <span>Mathematics Department ATP Coverage Audit Map - Term {selectedTerm}</span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Head of Department consolidated summary of pacing coverage and SBA status across all streams for the selected term.
                </p>
              </div>
              <button 
                onClick={() => {
                  // Reset checklist mock data to default completions for active term
                  const updated: Record<string, boolean> = { ...topicCompletions };
                  SUBJECT_ATPS.forEach((sub) => {
                    const cycles = sub.terms[selectedTerm] || [];
                    cycles.forEach((cyc) => {
                      cyc.topics.forEach((_, idx) => {
                        sub.educators.forEach((edu) => {
                          const key = `${sub.id}-${edu}-term${selectedTerm}-cycle${cyc.cycleNum}-topic${idx}`;
                          if (selectedTerm === 1) {
                            if (cyc.cycleNum === 1) updated[key] = true;
                            else if (cyc.cycleNum === 2 && idx < 2) updated[key] = true;
                            else updated[key] = false;
                          } else {
                            updated[key] = false;
                          }
                        });
                      });
                    });
                  });
                  setTopicCompletions(updated);
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all"
                id="reset-audit-map-btn"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                <span>Reset Term {selectedTerm}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]" id="consolidated-audit-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                    <th className="p-2.5">Subject Stream</th>
                    <th className="p-2.5">Assigned Educator</th>
                    <th className="p-2.5 text-center">Cycle 1 (W1-4)</th>
                    <th className="p-2.5 text-center">Cycle 2 (W5-8)</th>
                    <th className="p-2.5 text-center">Cycle 3 (W9-12)</th>
                    <th className="p-2.5 text-right">Term Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {SUBJECT_ATPS.map((sub) => {
                    return sub.educators.map((edu, idx) => {
                      // Calculate completions for Cycle 1, 2, 3 for this specific educator in the active selected term
                      const getCyclePct = (cycleNum: number) => {
                        const termCycles = sub.terms[selectedTerm] || [];
                        const cyc = termCycles.find((c) => c.cycleNum === cycleNum);
                        if (!cyc) return 0;
                        const total = cyc.topics.length;
                        const comp = cyc.topics.filter((_, tIdx) => {
                          return !!topicCompletions[`${sub.id}-${edu}-term${selectedTerm}-cycle${cycleNum}-topic${tIdx}`];
                        }).length;
                        return total > 0 ? Math.round((comp / total) * 100) : 0;
                      };

                      const pct1 = getCyclePct(1);
                      const pct2 = getCyclePct(2);
                      const pct3 = getCyclePct(3);
                      const avgPct = Math.round((pct1 + pct2 + pct3) / 3);

                      return (
                        <tr key={`${sub.id}-${edu}`} className="hover:bg-slate-50/50">
                          {idx === 0 ? (
                            <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100 text-left align-middle" rowSpan={sub.educators.length}>
                              <div className="font-bold">{sub.name}</div>
                              <div className="text-[9px] text-slate-400 font-normal">{sub.framework}</div>
                            </td>
                          ) : null}
                          <td className="p-2.5 text-slate-800 font-bold flex items-center gap-1.5 align-middle">
                            <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                            <span>{edu}</span>
                          </td>
                          <td className="p-2.5 text-center font-mono align-middle">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${pct1 === 100 ? "bg-emerald-50 text-emerald-800" : pct1 > 0 ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-400"}`}>
                              {pct1}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono align-middle">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${pct2 === 100 ? "bg-emerald-50 text-emerald-800" : pct2 > 0 ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-400"}`}>
                              {pct2}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono align-middle">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${pct3 === 100 ? "bg-emerald-50 text-emerald-800" : pct3 > 0 ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-400"}`}>
                              {pct3}%
                            </span>
                          </td>
                          <td className="p-2.5 text-right align-middle">
                            <div className="flex items-center justify-end gap-1.5 font-bold text-slate-900">
                              <span className="font-mono text-xs">{avgPct}%</span>
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-800 h-full" style={{ width: `${avgPct}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Subject Resource Library View */}
      {activeSubView === "library" && (
        <div className="space-y-6" id="subject-resource-library-section">
          {/* Library Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-extrabold uppercase border border-emerald-100">
                  2026 Academic Year • Term {selectedTerm}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {activeSubjectAtp.name} ({activeSubjectAtp.framework})
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-emerald-800" />
                <span>Subject Resource Library & Google Drive Folders</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Central repository of Google Drive folder links for modules, lesson plans, worksheets, and assessment memos aligned to active curriculum pacing.
              </p>
            </div>

            <button
              onClick={() => setIsAddResourceModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all shrink-0"
              id="open-add-resource-modal-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Link Google Drive Folder</span>
            </button>
          </div>

          {/* Category Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "All Categories" },
                { id: "Lesson Plans & Notes", label: "Lesson Plans & Notes" },
                { id: "Worksheets & Memos", label: "Worksheets & Memos" },
                { id: "Assessment Tasks", label: "Assessment Tasks" },
                { id: "Interactive Resources", label: "Interactive Resources" },
                { id: "Past Papers", label: "Past Papers" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setResourceCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    resourceCategoryFilter === cat.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  id={`cat-filter-${cat.id}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-500">
              Showing resources for <strong className="text-slate-800">{activeSubjectAtp.name}</strong> (2026 Term {selectedTerm})
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources
              .filter((res) => {
                const matchesSubject = res.subjectId === activeSubjectAtp.id;
                const matchesTerm = res.term === selectedTerm;
                const matchesCat = resourceCategoryFilter === "all" || res.category === resourceCategoryFilter;
                return matchesSubject && matchesTerm && matchesCat;
              })
              .map((res) => (
                <div key={res.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 text-left flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100">
                        {res.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Term {res.term} • {res.year}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {res.moduleName}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Uploaded by {res.uploadedBy}</span>
                      </span>
                      <span>•</span>
                      <span>{res.dateAdded}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="truncate text-[10px] font-mono text-slate-400 bg-slate-50 p-1.5 rounded border border-slate-100 max-w-[220px]">
                      {res.driveUrl}
                    </div>
                    <a
                      href={res.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all"
                      id={`open-drive-${res.id}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Drive Folder</span>
                    </a>
                  </div>
                </div>
              ))}
          </div>

          {resources.filter((res) => res.subjectId === activeSubjectAtp.id && res.term === selectedTerm && (resourceCategoryFilter === "all" || res.category === resourceCategoryFilter)).length === 0 && (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Google Drive Folders Linked for Term {selectedTerm}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No modules have been linked for {activeSubjectAtp.name} in Term {selectedTerm} under this category. Click the button above to add a Google Drive link.
              </p>
              <button
                onClick={() => setIsAddResourceModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Link Google Drive Folder Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-resource-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Link Google Drive Module Folder</h3>
                  <p className="text-[11px] text-slate-500">Aligned to Active Curriculum Year (2026) & Term {selectedTerm}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                id="close-resource-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Subject Stream / Grade
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                  {activeSubjectAtp.name} ({activeSubjectAtp.framework})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Academic Term
                  </label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                    Term {selectedTerm} (2026)
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Category
                  </label>
                  <select
                    value={newModuleCategory}
                    onChange={(e) => setNewModuleCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    id="new-resource-category"
                  >
                    <option value="Lesson Plans & Notes">Lesson Plans & Notes</option>
                    <option value="Worksheets & Memos">Worksheets & Memos</option>
                    <option value="Assessment Tasks">Assessment Tasks</option>
                    <option value="Interactive Resources">Interactive Resources</option>
                    <option value="Past Papers">Past Papers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Module / Topic Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trigonometry Identities & Reduction Formulas"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-800"
                  id="new-resource-title"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Google Drive Folder Link (URL) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={newDriveUrl}
                    onChange={(e) => setNewDriveUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-800"
                    id="new-resource-url"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Paste the shared Google Drive folder link for teacher collaboration.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Assigned Teacher / Uploader
                </label>
                <select
                  value={newUploader}
                  onChange={(e) => setNewUploader(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                  id="new-resource-uploader"
                >
                  {activeSubjectAtp.educators.map((edu) => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                  <option value="Mpofu (HOD)">Mpofu (HOD)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 cursor-pointer shadow-xs"
                  id="submit-resource-btn"
                >
                  Save Google Drive Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
