import { AcademicYearConfig, DepartmentEducator } from "../types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char] || char));
}

export function printTeacherAllocation(year: AcademicYearConfig) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    window.alert("Please allow pop-ups to print the teacher allocation.");
    return;
  }
  const educators = year.educators.filter((e) => e.status === "active");
  const rows = educators.flatMap((e) =>
    e.allocations.length
      ? e.allocations.map((a) => `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.role)}</td><td>${escapeHtml(a.grade)}</td><td>${escapeHtml(a.subject)}</td><td>${escapeHtml(a.curriculum)}</td></tr>`)
      : `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.role)}</td><td colspan="3">No teaching allocation recorded</td></tr>`
  ).join("");
  win.document.write(`<!doctype html><html><head><title>Eagle House Teacher Allocation ${year.year}</title>
  <style>
    @page { size:A4 landscape; margin:12mm; }
    *{box-sizing:border-box} body{font-family:Arial,sans-serif;color:#172033;margin:0}
    header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #123b68;padding-bottom:10px;margin-bottom:12px}
    h1{font-size:19px;margin:0 0 4px} h2{font-size:12px;color:#526174;margin:0;font-weight:normal}
    .meta{font-size:10px;color:#526174;margin:8px 0 14px}.badge{font-size:10px;border:1px solid #9aa8b8;padding:5px 8px;border-radius:4px}
    table{width:100%;border-collapse:collapse;font-size:9.5px} th{background:#e9eff6;text-align:left;font-weight:700}
    th,td{border:1px solid #b9c3cf;padding:6px;vertical-align:top} tbody tr:nth-child(even){background:#f8fafc}
    .sign{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:50px;font-size:10px}.line{border-top:1px solid #526174;padding-top:5px}
    footer{margin-top:16px;font-size:8.5px;color:#667085;display:flex;justify-content:space-between}
  </style></head><body>
  <header><div><h1>EAGLE HOUSE SCHOOL — SECONDARY DEPARTMENT</h1><h2>Mathematics & Mathematical Literacy — Teacher Allocation Schedule</h2></div><div class="badge">Academic Year ${year.year}</div></header>
  <div class="meta">Official allocation record generated from the live Department Configuration. Inactive educators are excluded from the active allocation list.</div>
  <table><thead><tr><th>Educator</th><th>Role</th><th>Grade / Class</th><th>Subject</th><th>Curriculum</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No active teacher allocations have been recorded.</td></tr>'}</tbody></table>
  <div class="sign"><div class="line">Head of Department: ______________________________</div><div class="line">Date: ______________________________</div></div>
  <footer><span>Teacher Allocation Schedule — Eagle House School</span><span>Printed ${new Date().toLocaleDateString("en-ZA")}</span></footer>
  <script>window.onload=function(){window.print();}</script></body></html>`);
  win.document.close();
}
