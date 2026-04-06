"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Award,
  Upload,
  Calendar,
  ChevronDown,
  X,
  AlertCircle,
  Plus,
  Database,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";
/* ─── tiny helpers ─── */
const RequiredStar = () => <span className="text-rose-500 ml-0.5">*</span>;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
      <AlertCircle size={11} /> {msg}
    </p>
  ) : null;

const Label = ({ children, htmlFor }: { children: ReactNode; htmlFor: string }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
  >
    {children}
  </label>
);

const inputCls = (err?: string) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-slate-700 bg-white outline-none transition
   placeholder:text-slate-300 focus:ring-3 focus:ring-amber-100
   ${err ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-amber-400"}`;

const selectCls = (err?: string) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-slate-700 bg-white outline-none transition appearance-none cursor-pointer
   focus:ring-3 focus:ring-amber-100
   ${err ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-amber-400"}`;

/* file upload mini-component */
type FileUploadProps = {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

const FileUpload = ({ id, value, onChange, error }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition
          ${error ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/30"}`}
      >
        <Upload size={16} className="text-slate-400 shrink-0" />
        {value ? (
          <span className="text-sm text-slate-700 truncate flex-1">{value.name}</span>
        ) : (
          <span className="text-sm text-slate-400">Drop file or click to choose</span>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="ml-auto text-slate-400 hover:text-rose-500"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={ref}
        id={id}
        type="file"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <p className="mt-1 text-[10px] text-slate-400">
        * Please specify the Proof name only in the following format
      </p>
    </div>
  );
};

/* ─── main form ─── */
type FormValues = {
  studentId: string;
  studentName: string;
  titleOfEvent: string;
  levelOfEvent: string;
  individualOrBatch: string;
  academicProject: string;
  specifyProject: string;
  fromDate: string;
  toDate: string;
  typeOfSponsorship: string;
  sdgGoals: string;
  imageProof: File | null;
  abstractProof: File | null;
  status: string;
  originalCertProof: File | null;
  attestedCertProof: File | null;
  iqacVerification: string;
  parentalDepartment: string;
  numberOfParticipants: string;
  sponsorshipAmount: string;
};

type FormKey = keyof FormValues;
type FormErrors = Partial<Record<FormKey, string>>;

type CompetitionRecord = {
  id: number;
  student_name: string;
  title_of_event: string;
  level_of_event: string;
  from_date: string;
  to_date: string;
  status: string;
  iqac_status: string;
  type_of_sponsorship: string;
  sdg_goals: string;
  image_proof_url?: string;
  abstract_proof_url?: string;
  original_cert_proof_url?: string;
  attested_cert_proof_url?: string;
  created_at: string;
};

const INITIAL: FormValues = {
  studentId: "",
  studentName: "",
  titleOfEvent: "",
  levelOfEvent: "",
  individualOrBatch: "Individual",
  academicProject: "Yes",
  specifyProject: "",
  fromDate: "",
  toDate: "",
  typeOfSponsorship: "",
  sdgGoals: "",
  imageProof: null,
  abstractProof: null,
  status: "",
  originalCertProof: null,
  attestedCertProof: null,
  iqacVerification: "Initiated",
  parentalDepartment: "",
  numberOfParticipants: "",
  sponsorshipAmount: "",
};

const REQUIRED_FIELDS: FormKey[] = [
  "studentName", "titleOfEvent", "levelOfEvent", "individualOrBatch", "academicProject",
  "fromDate", "toDate", "typeOfSponsorship", "sdgGoals",
  "imageProof", "abstractProof", "status", "originalCertProof", "attestedCertProof",
];

export default function CreateCompetitionReport() {
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [records, setRecords] = useState<CompetitionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CompetitionRecord | null>(null);
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [sdgList, setSdgList] = useState<
    { id: number; sdg_number: number; title: string }[]
  >([]);

  const handleSearchableChange = (name: string, value: string) => {
    if (name === "student") {
      const selectedStudent = students.find((s) => String(s.id) === value);
      set("studentId", value);
      set("studentName", selectedStudent?.name ?? "");
      return;
    }
    set(name as FormKey, value as FormValues[FormKey]);
  };


  const set = <K extends FormKey>(key: K, val: FormValues[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  useEffect(() => {
    const endpoints = [
      "http://localhost:5000/api/student-competition-reports",
      "http://localhost:5000/api/competition-reports",
      "http://localhost:5000/api/student/competition-reports",
    ];


    const normalizeRecord = (r: Record<string, unknown>, i: number): CompetitionRecord => ({
      id: Number(r.id ?? i + 1),
      student_name: String(r.student_name ?? r.studentName ?? r.student ?? "Unknown Student"),
      title_of_event: String(r.title_of_event ?? r.titleOfEvent ?? r.title ?? "Competition Event"),
      level_of_event: String(r.level_of_event ?? r.levelOfEvent ?? "-"),
      from_date: String(r.from_date ?? r.fromDate ?? r.start_date ?? r.created_at ?? new Date().toISOString()),
      to_date: String(r.to_date ?? r.toDate ?? r.end_date ?? r.created_at ?? new Date().toISOString()),
      status: String(r.status ?? "Participant"),
      iqac_status: String(r.iqac_status ?? r.iqacStatus ?? "Initiated"),
      type_of_sponsorship: String(r.type_of_sponsorship ?? r.typeOfSponsorship ?? "-"),
      sdg_goals: String(r.sdg_goals ?? r.sdgGoals ?? "-"),
      image_proof_url: r.image_proof_url ? String(r.image_proof_url) : undefined,
      abstract_proof_url: r.abstract_proof_url ? String(r.abstract_proof_url) : undefined,
      original_cert_proof_url: r.original_cert_proof_url ? String(r.original_cert_proof_url) : undefined,
      attested_cert_proof_url: r.attested_cert_proof_url ? String(r.attested_cert_proof_url) : undefined,
      created_at: String(r.created_at ?? new Date().toISOString()),
    });

    const loadRecords = async () => {
      try {
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            if (!response.ok) continue;
            const data = await response.json();
            if (Array.isArray(data)) {
              setRecords(data.map((item, index) => normalizeRecord(item as Record<string, unknown>, index)));
              return;
            }
          } catch {
            continue;
          }
        }
        setRecords([]);
      } finally {
        setRecordsLoading(false);
      }
    };

    loadRecords();
  }, []);
  useEffect(() => {
    fetch("http://localhost:5000/sdg")
      .then((res) => res.json())
      .then((data) => setSdgList(data))
      .catch(() => setSdgList([]));
  }, []);
  useEffect(() => {
    fetch("http://localhost:5000/students")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => setStudents([]));
  }, []);
  useEffect(() => {
    if (form.individualOrBatch !== "Batch") {
      set("numberOfParticipants", "");
    }
  }, [form.individualOrBatch]);

  useEffect(() => {
    if (form.typeOfSponsorship !== "Management") {
      set("sponsorshipAmount", "");
    }
  }, [form.typeOfSponsorship]);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    REQUIRED_FIELDS.forEach((key) => {
      if (!form[key] || (typeof form[key] === "string" && !form[key].trim())) {
        newErrors[key] = "This field is required";
      }
    });

    // ✅ Conditional: Academic Project
    if (form.academicProject === "Yes" && !form.specifyProject) {
      newErrors.specifyProject = "This field is required";
    }

    // ✅ Conditional: Batch → Participants
    if (form.individualOrBatch === "Batch" && !form.numberOfParticipants) {
      newErrors.numberOfParticipants = "This field is required";
    }

    // ✅ Conditional: Management → Amount
    if (form.typeOfSponsorship === "Management" && !form.sponsorshipAmount) {
      newErrors.sponsorshipAmount = "This field is required";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = REQUIRED_FIELDS.find((k) => errs[k]);
      if (firstKey) {
        document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    const now = new Date().toISOString();
    const newRecord: CompetitionRecord = {
      id: Date.now(),
      student_name: form.studentName,
      title_of_event: form.titleOfEvent,
      level_of_event: form.levelOfEvent,
      from_date: form.fromDate,
      to_date: form.toDate,
      status: form.status,
      iqac_status: form.iqacVerification,
      type_of_sponsorship: form.typeOfSponsorship,
      sdg_goals: form.sdgGoals,
      created_at: now,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setShowCreateForm(false);
    setForm(INITIAL);
    setErrors({});
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    setShowCreateForm(false);
  };

  const filteredRecords = records.filter((record) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      record.title_of_event.toLowerCase().includes(q) ||
      record.student_name.toLowerCase().includes(q) ||
      record.level_of_event.toLowerCase().includes(q) ||
      record.status.toLowerCase().includes(q)
    );
  });
  const handleCancel = () => {
    setShowCreateForm(false);
  };

  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-500">Resources</span>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-indigo-600">Competition Report</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Competition Reports</h1>
              <p className="mt-0.5 text-xs text-gray-500">View all submitted reports and create new entries</p>
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
                Create Report
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-[220px]">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports, students..."
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

            {recordsLoading ? (
              <div className="flex min-h-[340px] items-center justify-center px-4 py-12">
                <p className="text-xs text-gray-500">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100">
                  <Database size={22} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No competition reports found</p>
                  <p className="mt-0.5 text-xs text-gray-400">Create your first competition report to get started.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={13} />
                  Create Competition Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Student / Event</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Level</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">From Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">To Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">IQAC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-gray-700 font-medium">{record.title_of_event}</p>
                          <p className="text-gray-500">{record.student_name}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{record.level_of_event}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(record.from_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(record.to_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-600">{record.status}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${record.iqac_status === "Verified" ? "bg-emerald-50 text-emerald-700" :
                            record.iqac_status === "Rejected" ? "bg-red-50 text-red-700" :
                              "bg-indigo-50 text-indigo-700"
                            }`}>
                            {record.iqac_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedRecord && (
            <>
              <div
                onClick={() => setSelectedRecord(null)}
                className="fixed inset-0 z-40 bg-black/40"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-base font-bold text-gray-900">{selectedRecord.title_of_event}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{selectedRecord.student_name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Level", value: selectedRecord.level_of_event },
                        { label: "Status", value: selectedRecord.status },
                        { label: "IQAC", value: selectedRecord.iqac_status },
                        { label: "Sponsorship", value: selectedRecord.type_of_sponsorship },
                        { label: "SDG Goal", value: selectedRecord.sdg_goals },
                        { label: "Created At", value: new Date(selectedRecord.created_at).toLocaleString() },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                          <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                          <p className="text-xs font-semibold text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Proof Documents</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Image Proof", url: selectedRecord.image_proof_url },
                          { label: "Abstract Proof", url: selectedRecord.abstract_proof_url },
                          { label: "Original Certificate", url: selectedRecord.original_cert_proof_url },
                          { label: "Attested Certificate", url: selectedRecord.attested_cert_proof_url },
                        ].map(({ label, url }) => (
                          <a
                            key={label}
                            href={url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-xl border px-3 py-2.5 text-xs font-medium flex items-center justify-between ${url ? "border-gray-200 hover:border-indigo-300 text-gray-700" : "border-gray-100 text-gray-400 pointer-events-none"}`}
                          >
                            <span className="truncate">{label}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="px-5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const SelectWrapper = ({ children }: { children: ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4">
          <span className="font-medium">Resources</span>
          <ChevronRight size={12} className="text-gray-300" />
          <button
            type="button"
            onClick={handleCancel}
            className="font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Competition Report
          </button>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="font-semibold text-gray-700">Create Report</span>
        </nav>

        {/* ── Form card ── */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-8">

          {/* Student */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SearchableSelect
              label="Student"
              required
              name="student"
              value={form.studentId}
              placeholder="Choose student"
              options={students.map((s) => ({
                value: String(s.id),
                label: `${s.name}`,
              }))}
              onChange={handleSearchableChange}
            />
          </div>

          {/* Title of Event */}
          <div>
            <Label htmlFor="titleOfEvent">Title of Event <RequiredStar /></Label>
            <input id="titleOfEvent" type="text" placeholder="Title of Event" value={form.titleOfEvent} onChange={(e) => set("titleOfEvent", e.target.value)} className={inputCls(errors.titleOfEvent)} />
            <FieldError msg={errors.titleOfEvent} />
          </div>

          {/* Level of Event */}
          <div>
            <Label htmlFor="levelOfEvent">Level of Event <RequiredStar /></Label>
            <SelectWrapper>
              <select id="levelOfEvent" value={form.levelOfEvent} onChange={(e) => set("levelOfEvent", e.target.value)} className={selectCls(errors.levelOfEvent)}>
                <option value="">Choose an option</option>
                <option>Round 1</option>
                <option>Round 2</option>
                <option>Round 3</option>
                <option>Round 4</option>
                <option>Winner</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.levelOfEvent} />
          </div>

          {/* Individual or Batch */}
          <div>
            <Label htmlFor="individualOrBatch">Whether Product Developed By Individual Or Batch <RequiredStar /></Label>
            <SelectWrapper>
              <select id="individualOrBatch" value={form.individualOrBatch} onChange={(e) => set("individualOrBatch", e.target.value)} className={selectCls(errors.individualOrBatch)}>
                <option>Individual</option>
                <option>Batch</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.individualOrBatch} />
          </div>
          {form.individualOrBatch === "Batch" && (
            <div>
              <Label htmlFor="numberOfParticipants">
                Number of the Participants <RequiredStar />
              </Label>
              <input
                id="numberOfParticipants"
                type="number"
                placeholder="Enter number of participants"
                value={form.numberOfParticipants}
                onChange={(e) => set("numberOfParticipants", e.target.value)}
                className={inputCls(errors.numberOfParticipants)}
              />
              <FieldError msg={errors.numberOfParticipants} />
            </div>
          )}

          {/* Academic Project */}
          <div>
            <Label htmlFor="academicProject">Are you claiming this as the outcome of an academic project <RequiredStar /></Label>
            <SelectWrapper>
              <select id="academicProject" value={form.academicProject} onChange={(e) => set("academicProject", e.target.value)} className={selectCls(errors.academicProject)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.academicProject} />
          </div>

          {/* Specify Project */}
          {form.academicProject === "Yes" && (
            <div>
              <Label htmlFor="specifyProject">
                If Yes, specify the project <RequiredStar />
              </Label>
              <SelectWrapper>
                <select
                  id="specifyProject"
                  value={form.specifyProject}
                  onChange={(e) => set("specifyProject", e.target.value)}
                  className={selectCls(errors.specifyProject)}
                >
                  <option value="">Choose an option</option>
                  <option>Final Year Project</option>
                  <option>Mini Project</option>
                  <option>Research Project</option>
                  <option>Internship Project</option>
                </select>
              </SelectWrapper>
              <FieldError msg={errors.specifyProject} />
            </div>
          )}

          {/* Dates */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="fromDate">From Date <RequiredStar /></Label>
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="fromDate" type="date" value={form.fromDate} onChange={(e) => set("fromDate", e.target.value)} className={`${inputCls(errors.fromDate)} pl-10`} />
              </div>
              <FieldError msg={errors.fromDate} />
            </div>
            <div>
              <Label htmlFor="toDate">To Date <RequiredStar /></Label>
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="toDate" type="date" value={form.toDate} onChange={(e) => set("toDate", e.target.value)} className={`${inputCls(errors.toDate)} pl-10`} />
              </div>
              <FieldError msg={errors.toDate} />
            </div>
          </div>

          {/* Type of Sponsorship */}
          <div>
            <Label htmlFor="typeOfSponsorship">Type of Sponsorship <RequiredStar /></Label>
            <SelectWrapper>
              <select id="typeOfSponsorship" value={form.typeOfSponsorship} onChange={(e) => set("typeOfSponsorship", e.target.value)} className={selectCls(errors.typeOfSponsorship)}>
                <option value="">Choose an option</option>
                <option>Self</option>
                <option>Management</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.typeOfSponsorship} />
          </div>
          {form.typeOfSponsorship === "Management" && (
            <div>
              <Label htmlFor="sponsorshipAmount">
                Amount in Rs <RequiredStar />
              </Label>
              <input
                id="sponsorshipAmount"
                type="number"
                placeholder="Enter amount"
                value={form.sponsorshipAmount}
                onChange={(e) => set("sponsorshipAmount", e.target.value)}
                className={inputCls(errors.sponsorshipAmount)}
              />
              <FieldError msg={errors.sponsorshipAmount} />
            </div>
          )}
          
          <div>
            <SelectWrapper>
              <SearchableSelect
                label="SDG Goals"
                required
                name="sdgGoals"
                value={form.sdgGoals}
                placeholder="Choose SDG Goal"
                options={sdgList.map((sdg) => ({
                  value: sdg.title,
                  label: `SDG ${sdg.sdg_number}: ${sdg.title}`,
                }))}
                onChange={(name, value) => set(name as FormKey, value)}
              />
              <FieldError msg={errors.sdgGoals} />
            </SelectWrapper>
            <FieldError msg={errors.sdgGoals} />
          </div>

          {/* Upload Image / Photo / Geotagg */}
          <div>
            <Label htmlFor="imageProof">Upload Image / Photo / Geotagg <RequiredStar /></Label>
            <FileUpload id="imageProof" value={form.imageProof} onChange={(v) => set("imageProof", v)} error={errors.imageProof} />
            <FieldError msg={errors.imageProof} />
          </div>

          {/* Abstract Document Proof */}
          <div>
            <Label htmlFor="abstractProof">Abstract Document Proof <RequiredStar /></Label>
            <FileUpload id="abstractProof" value={form.abstractProof} onChange={(v) => set("abstractProof", v)} error={errors.abstractProof} />
            <FieldError msg={errors.abstractProof} />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status <RequiredStar /></Label>
            <SelectWrapper>
              <select id="status" value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls(errors.status)}>
                <option value="">Choose an option</option>
                <option>Winner</option>
                <option>Participant</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.status} />
          </div>

          {/* Original Certificate Proof */}
          <div>
            <Label htmlFor="originalCertProof">Original Certificate Proof <RequiredStar /></Label>
            <FileUpload id="originalCertProof" value={form.originalCertProof} onChange={(v) => set("originalCertProof", v)} error={errors.originalCertProof} />
            <FieldError msg={errors.originalCertProof} />
          </div>

          {/* Attested Certificate Document Proof */}
          <div>
            <Label htmlFor="attestedCertProof">Attested Certificate Document Proof <RequiredStar /></Label>
            <FileUpload id="attestedCertProof" value={form.attestedCertProof} onChange={(v) => set("attestedCertProof", v)} error={errors.attestedCertProof} />
            <FieldError msg={errors.attestedCertProof} />
          </div>

          {/* Divider */}
          <hr className="border-slate-100" />

          {/* IQAC Verification (read-only) */}
          <div>
            <Label htmlFor="iqacVerification">IQAC Verification</Label>
            <SelectWrapper>
              <select id="iqacVerification" value={form.iqacVerification} disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none appearance-none cursor-not-allowed">
                <option>Initiated</option>
                <option>Under Review</option>
                <option>Verified</option>
              </select>
            </SelectWrapper>
          </div>
          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const errs = validate();
                if (Object.keys(errs).length) { setErrors(errs); return; }
                // "save & add another" just resets
                setForm(INITIAL); setErrors({});
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
            >
              <Plus size={15} /> Create &amp; Add Another
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-[#12233d] px-8 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition shadow-sm"
            >
              Create Competition Report
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-slate-400 pb-4">
          ICT Information Portal • All fields marked <span className="text-rose-400">*</span> are required
        </p>
      </div>
    </div>
  );
}