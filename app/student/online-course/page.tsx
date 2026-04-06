"use client";

import { ChangeEvent, useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Database,
  Search,
  UploadCloud,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  Check,
  X,
  Clock,
  Link,
  BookOpen,
  GraduationCap,
  FlaskConical,
  CalendarDays,
  Building2,
  Eye,
  ExternalLink
} from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";

// ─── Types ────────────────────────────────────────────────────────────────────

type CourseRecord = {
  id: number;
  student_id: number;
  student_name: string;
  year_of_study: string;
  course_type: string;
  start_date: string;
  end_date: string;
  exam_date: string;
  iqac_status: string;
  course_name: string;
  dept_name: string;
  created_at: string;
  originalProofUrl: string;
  attendedProofUrl: string;
};

type FormState = {
  student: string;
  yearOfStudy: string;
  specialLab: string;
  onlineCourse: string;
  courseType: string;
  marksAvailable: string;
  startDate: string;
  endDate: string;
  examDate: string;
  durationWeeks: string;
  partOfAcademic: string;
  semester: string;
  sponsorshipType: string;
  interdisciplinary: string;
  department: string;
  certificateUrl: string;
  iqacVerification: string;
  marksObtained: string;
};

const INITIAL_FORM: FormState = {
  student: "",
  yearOfStudy: "",
  specialLab: "",
  onlineCourse: "",
  courseType: "",
  marksAvailable: "",
  startDate: "",
  endDate: "",
  examDate: "",
  durationWeeks: "",
  partOfAcademic: "",
  semester: "",
  sponsorshipType: "",
  interdisciplinary: "",
  department: "",
  certificateUrl: "",
  iqacVerification: "Initiated",
  marksObtained: "",
};

type Department = { id: number; dept_name: string };
type Student = { id: number; name: string };

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Student info" },
  { id: 2, label: "Course details" },
  { id: 3, label: "Documents" },
  { id: 4, label: "Verification" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateOnlineCoursePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [labs, setLabs] = useState<{ id: number; specialLabName: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [records, setRecords] = useState<CourseRecord[]>([]);
  const [files, setFiles] = useState<{ originalProof: File | null; attendedProof: File | null }>({
    originalProof: null,
    attendedProof: null,
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CourseRecord | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const handleSearchableChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
      setError(null);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setForm(INITIAL_FORM);
    setFiles({ originalProof: null, attendedProof: null });
    setError(null);
    setSuccess(false);
    setActiveStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!files.originalProof || !files.attendedProof) {
        setError("Both certificate files are required");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("originalProof", files.originalProof);
      formData.append("attendedProof", files.attendedProof);

      const response = await fetch("http://localhost:5000/api/student-online-courses", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create online course");

      setSuccess(true);
      setForm(INITIAL_FORM);
      setFiles({ originalProof: null, attendedProof: null });
      setTimeout(() => {
        setShowCreateForm(false);
        setSuccess(false);
        setActiveStep(1);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, labRes, deptRes, recordRes, studentRes] = await Promise.all([
          fetch("http://localhost:5000/courses/active"),
          fetch("http://localhost:5000/speciallabs/active"),
          fetch("http://localhost:5000/departments"),
          fetch("http://localhost:5000/api/student-online-courses"),
          fetch("http://localhost:5000/students"),
        ]);
        setCourses(await courseRes.json());
        setLabs(await labRes.json());
        setDepartments(await deptRes.json());
        const recordsData = await recordRes.json();
        const studentData = await studentRes.json();
        setStudents(studentData);
        setRecords(recordsData);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── List view ──────────────────────────────────────────────────────────────

  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-500">Resources</span>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-indigo-600">Online Course</span>
          </nav>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Online Courses</h1>
              <p className="mt-0.5 text-xs text-gray-500">Manage and track student online course records</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus size={15} />
                Create Record
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-[220px]">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search courses, students…"
                  className="w-full bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>
            </div>

            {/* ── DROP-IN REPLACEMENT ── */}
            {/* Add to your lucide-react imports: ExternalLink, ChevronRight (if not already there) */}

            {recordsLoading ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-2 px-4 py-12">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-xs text-gray-400">Loading records…</p>
              </div>

            ) : records.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100">
                  <Database size={22} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No course records found</p>
                  <p className="mt-0.5 text-xs text-gray-400">Get started by creating your first online course entry.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={13} />
                  Create Online Course
                </button>
              </div>

            ) : (
              <>
                {/* ── TABLE ─────────────────────────────────────────── */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        {["Student / Course", "Type", "Start Date", "End Date", "Exam Date", "Status", ""].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map((record) => {
                        const typeColors: Record<string, string> = {
                          "Swayam-NPTEL": "bg-violet-50 text-violet-700 border border-violet-200",
                          "Coursera": "bg-blue-50   text-blue-700   border border-blue-200",
                          "Others (MBA)": "bg-orange-50 text-orange-700 border border-orange-200",
                          "Others (Project-Outcome)": "bg-teal-50   text-teal-700   border border-teal-200",
                        };
                        const statusMap: Record<string, { cls: string; dot: string }> = {
                          Verified: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
                          Rejected: { cls: "bg-red-50     text-red-700     border border-red-200", dot: "bg-red-500" },
                          Initiated: { cls: "bg-amber-50   text-amber-700   border border-amber-200", dot: "bg-amber-400" },
                        };
                        const s = statusMap[record.iqac_status] ?? statusMap["Initiated"];
                        const fmt = (d: string) =>
                          new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                        return (
                          <tr
                            key={record.id}
                            onClick={() => setSelected(record)}
                            className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3.5 max-w-[200px]">
                              <p className="font-semibold text-gray-800 leading-tight truncate">{record.course_name}</p>
                              <p className="text-gray-400 mt-0.5 truncate">{record.student_name}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${typeColors[record.course_type] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                {record.course_type}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{fmt(record.start_date)}</td>
                            <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{fmt(record.end_date)}</td>
                            <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{fmt(record.exam_date)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                {record.iqac_status}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors inline-block" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── CENTERED MODAL ────────────────────────────────── */}
                {selected && (
                  <>
                    {/* Backdrop */}
                    <div
                      onClick={() => setSelected(null)}
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal header */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                          <div className="min-w-0 pr-4">
                            <p className="text-base font-bold text-gray-900 leading-snug">{selected.course_name}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{selected.student_name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {(() => {
                                const statusMap: Record<string, { cls: string; dot: string }> = {
                                  Verified: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
                                  Rejected: { cls: "bg-red-50     text-red-700     border border-red-200", dot: "bg-red-500" },
                                  Initiated: { cls: "bg-amber-50   text-amber-700   border border-amber-200", dot: "bg-amber-400" },
                                };
                                const typeColors: Record<string, string> = {
                                  "Swayam-NPTEL": "bg-violet-50 text-violet-700 border border-violet-200",
                                  "Coursera": "bg-blue-50   text-blue-700   border border-blue-200",
                                  "Others (MBA)": "bg-orange-50 text-orange-700 border border-orange-200",
                                  "Others (Project-Outcome)": "bg-teal-50   text-teal-700   border border-teal-200",
                                };
                                const s = statusMap[selected.iqac_status] ?? statusMap["Initiated"];
                                return (
                                  <>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.cls}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                      {selected.iqac_status}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${typeColors[selected.course_type] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                      {selected.course_type}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelected(null)}
                            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Modal body — scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                          {/* Info grid — 2 columns */}
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Course Details</p>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "Student Name", value: selected.student_name },
                                { label: "Year of Study", value: selected.year_of_study },
                                { label: "Department", value: selected.dept_name },
                                { label: "Course Type", value: selected.course_type },
                                {
                                  label: "Start Date",
                                  value: new Date(selected.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
                                },
                                {
                                  label: "End Date",
                                  value: new Date(selected.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
                                },
                                {
                                  label: "Exam Date",
                                  value: new Date(selected.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
                                },
                                {
                                  label: "Created At",
                                  value: new Date(selected.created_at).toLocaleString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                  }),
                                },
                              ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                                  <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                                  <p className="text-xs font-semibold text-gray-800">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Certificates */}
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Certificate Documents</p>
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { label: "Original Certificate", url: selected.originalProofUrl },
                                { label: "Attested Certificate", url: selected.attendedProofUrl },
                              ].map(({ label, url }) => (
                                <a
                                  key={label}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                                >
                                  <div className="relative bg-gray-100 h-40 overflow-hidden">
                                    {url ? (<img
                                      src={url}
                                      alt={label}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />) : <div>No preview</div>
                                    }
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <ExternalLink size={20} className="text-white drop-shadow" />
                                    </div>
                                  </div>
                                  <div className="px-3 py-2.5 bg-white flex items-center justify-between gap-1">
                                    <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
                                    <ExternalLink size={11} className="text-gray-300 shrink-0" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
                          <button
                            onClick={() => setSelected(null)}
                            className="px-5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Form header */}
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4">
            <span className="font-medium">Resources</span>
            <ChevronRight size={12} className="text-gray-300" />
            <button
              type="button"
              onClick={handleCancel}
              className="font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Online Course
            </button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-semibold text-gray-700">Create Record</span>
          </nav>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Create Online Course</h1>
              <p className="mt-0.5 text-xs text-gray-500">Fill all required fields and upload valid proof documents.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                Draft
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                aria-label="Close create record page"
                title="Close"
              >
                <X size={13} />
                Close
              </button>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const isDone = step.id < activeStep;
              const isActive = step.id === activeStep;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 bg-white text-gray-400"
                        }`}
                    >
                      {isDone ? <Check size={11} strokeWidth={2.5} /> : step.id}
                    </div>
                    <span
                      className={`hidden sm:block text-xs transition-colors ${isActive ? "font-medium text-gray-800" : "text-gray-400"
                        }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-3 h-px flex-1 transition-colors ${isDone ? "bg-emerald-400" : "bg-gray-200"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <X size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs font-medium text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">Online course record created successfully!</p>
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7 space-y-7">

          {/* Section 1 – Student */}
          <FormSection
            icon={<GraduationCap size={14} />}
            title="Student information"
            onActivate={() => setActiveStep(1)}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SearchableSelect
                label="Student"
                required
                name="student"
                value={form.student}
                placeholder="Choose student"
                options={students.map((s) => ({
                  value: String(s.id),
                  label: `${s.name}`,
                }))}
                onChange={handleSearchableChange}
              />
              <SelectField
                label="Year of study"
                required
                name="yearOfStudy"
                value={form.yearOfStudy}
                options={["Choose year", "First", "Second", "Third", "Fourth"]}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Section 2 – Course details */}
          <FormSection
            icon={<BookOpen size={14} />}
            title="Course details"
            onActivate={() => setActiveStep(2)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SearchableSelect
                  label="Special lab"
                  required
                  name="specialLab"
                  value={form.specialLab}
                  placeholder="Choose lab"
                  options={labs.map((l) => ({ value: String(l.id), label: l.specialLabName }))}
                  onChange={handleSearchableChange}
                />
                <SearchableSelect
                  label="Online course"
                  required
                  name="onlineCourse"
                  value={form.onlineCourse}
                  placeholder="Choose course"
                  options={courses.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={handleSearchableChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Course type"
                  required
                  name="courseType"
                  value={form.courseType}
                  options={["Choose course type", "Swayam-NPTEL", "Coursera", "Others (MBA)", "Others (Project-Outcome)"]}
                  onChange={handleChange}
                />
                <SelectField
                  label="Marks available in certificate"
                  required
                  name="marksAvailable"
                  value={form.marksAvailable}
                  options={["Choose an option", "Yes", "No"]}
                  onChange={handleChange}
                />
              </div>

              {form.marksAvailable === "Yes" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <InputField
                    label="Marks obtained"
                    required
                    name="marksObtained"
                    value={form.marksObtained}
                    placeholder="Enter marks obtained in certificate"
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InputField label="Start date" required type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                <InputField label="End date" required type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                <InputField label="Exam date" required type="date" name="examDate" value={form.examDate} onChange={handleChange} />
              </div>

              <InputField
                label="Duration (weeks)"
                required
                name="durationWeeks"
                value={form.durationWeeks}
                placeholder="e.g. 12"
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SelectField
                  label="Part of academic?"
                  required
                  name="partOfAcademic"
                  value={form.partOfAcademic}
                  options={["Choose an option", "Yes", "No"]}
                  onChange={handleChange}
                />
                <SelectField
                  label="Sponsorship type"
                  required
                  name="sponsorshipType"
                  value={form.sponsorshipType}
                  options={["Choose an option", "Self", "Institution", "Government", "Industry"]}
                  onChange={handleChange}
                />
                <SelectField
                  label="Interdisciplinary"
                  required
                  name="interdisciplinary"
                  value={form.interdisciplinary}
                  options={["Choose an option", "Yes", "No"]}
                  onChange={handleChange}
                />
              </div>

              {form.partOfAcademic === "Yes" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <SelectField
                    label="Semester"
                    required
                    name="semester"
                    value={form.semester}
                    options={["Choose semester", "1", "2", "3", "4", "5", "6", "7", "8"]}
                    onChange={handleChange}
                  />
                </div>
              )}

              {form.interdisciplinary === "Yes" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <SearchableSelect
                    label="Department"
                    required
                    name="department"
                    value={form.department}
                    placeholder="Choose department"
                    options={departments.map((d) => ({ value: String(d.id), label: d.dept_name }))}
                    onChange={handleSearchableChange}
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Section 3 – Documents */}
          <FormSection
            icon={<UploadCloud size={14} />}
            title="Document uploads"
            onActivate={() => setActiveStep(3)}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <FileField
                  label="Original certificate proof"
                  required
                  name="originalProof"
                  onChange={handleFileChange}
                  fileName={files.originalProof?.name}
                />
                <p className="text-xs text-red-500 font-medium">
                  Format: Reg.No – ODC – Date of Event
                </p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Attended certificate"
                  required
                  name="attendedProof"
                  onChange={handleFileChange}
                  fileName={files.attendedProof?.name}
                />
                <p className="text-xs text-red-500 font-medium">
                  Format: Reg.No – ODC – Date of Event
                </p>
              </div>
            </div>
          </FormSection>

          {/* Section 4 – Verification */}
          <FormSection
            icon={<Link size={14} />}
            title="Verification & links"
            onActivate={() => setActiveStep(4)}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Certificate URL"
                required
                type="url"
                name="certificateUrl"
                value={form.certificateUrl}
                placeholder="https://example.com/certificate"
                onChange={handleChange}
              />
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  IQAC verification <span className="text-red-500">*</span>
                </label>
                <IqacToggle
                  value={form.iqacVerification}
                  onChange={(val) => setForm((prev) => ({ ...prev, iqacVerification: val }))}
                />
              </div>
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              Create &amp; Add Another
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Check size={14} />
                  Create Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({
  icon,
  title,
  children,
  onActivate,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onActivate?: () => void;
}) {
  return (
    <div className="space-y-4" onClick={onActivate}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md border border-gray-200 bg-gray-50 text-gray-500">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

// ─── IQAC toggle ─────────────────────────────────────────────────────────────

const IQAC_OPTIONS = [
  {
    value: "Initiated",
    label: "Initiated",
    icon: <Clock size={12} />,
    active: "bg-indigo-50 text-indigo-700 border-indigo-300",
    inactive: "border-gray-200 text-gray-500 hover:bg-gray-50",
  },
  {
    value: "Verified",
    label: "Verified",
    icon: <Check size={12} />,
    active: "bg-emerald-50 text-emerald-700 border-emerald-300",
    inactive: "border-gray-200 text-gray-500 hover:bg-gray-50",
  },
  {
    value: "Rejected",
    label: "Rejected",
    icon: <X size={12} />,
    active: "bg-red-50 text-red-700 border-red-300",
    inactive: "border-gray-200 text-gray-500 hover:bg-gray-50",
  },
];

function IqacToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {IQAC_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors ${value === opt.value ? opt.active : opt.inactive
            }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type BaseFieldProps = { label: string; name: string; required?: boolean };

type InputFieldProps = BaseFieldProps & {
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ label, name, required, type = "text", value, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

type SelectFieldProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function SelectField({ label, name, required, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] px-3 py-2 pr-8 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option.startsWith("Choose") ? "" : option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

type FileFieldProps = BaseFieldProps & {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
};

function FileField({ label, required, name, onChange, fileName }: FileFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <label
        className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${fileName
          ? "border-emerald-300 bg-emerald-50"
          : "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
          }`}
      >
        <div
          className={`flex items-center justify-center rounded-lg p-2 transition-colors ${fileName ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
            }`}
        >
          {fileName ? <Check size={16} /> : <UploadCloud size={16} />}
        </div>
        <div>
          <p className={`text-xs font-medium ${fileName ? "text-emerald-700" : "text-gray-600 group-hover:text-indigo-600"}`}>
            {fileName ? fileName : "Click to upload or drag & drop"}
          </p>
          {!fileName && <p className="mt-0.5 text-xs text-gray-400">PDF, JPG, PNG</p>}
        </div>
        <input
          name={name}
          type="file"
          className="hidden"
          onChange={onChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </label>
    </div>
  );
}