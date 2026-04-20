"use client";

import { useEffect, useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const FACULTY_DEPARTMENT_OPTIONS = [
  "Choose an option",
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Technology",
  "Science & Humanities",
  "Management Sciences",
  "Architecture & planning",
];

const VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"] as const;

const FILE_FIELDS = [
  "recognitionOrder",
  "completedProof",
  "pursuingProof",
] as const;

type Status = (typeof VERIFICATION_OPTIONS)[number];
type FileField = (typeof FILE_FIELDS)[number];

type FormData = {
  faculty: string;
  completionDate: string;
  recognitionDate: string;
  phdAwardDate: string;
  phdDiscipline: string;
  recognitionReceivedDate: string;
  recognitionNumber: string;
  facultyDepartment: string;
  researchArea: string;
  eligibleScholars: string;
  scholarsCompleted: string;
  scholarsPursuing: string;
  recognitionOrder: File | null;
  completedProof: File | null;
  pursuingProof: File | null;
  verification: Status;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type DragStates = Partial<Record<FileField, boolean>>;

interface FileInputProps {
  fieldName: FileField;
  label: string;
  formData: FormData;
  errors: FormErrors;
  dragActiveStates: DragStates;
  onFileChange: (e: ChangeEvent<HTMLInputElement>, fieldName: FileField) => void;
  onClearFile: (fieldName: FileField) => void;
  onDrag: (e: DragEvent<HTMLDivElement>, fieldName: FileField) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, fieldName: FileField) => void;
}

function FileInput({
  fieldName,
  label,
  formData,
  errors,
  dragActiveStates,
  onFileChange,
  onClearFile,
  onDrag,
  onDrop,
}: FileInputProps) {
  const file = formData[fieldName];
  const active = !!dragActiveStates[fieldName];
  const hasError = !!errors[fieldName];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div
        className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
          hasError
            ? "border-red-500"
            : active
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300"
        } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
        onDragEnter={(e) => onDrag(e, fieldName)}
        onDragLeave={(e) => onDrag(e, fieldName)}
        onDragOver={(e) => onDrag(e, fieldName)}
        onDrop={(e) => onDrop(e, fieldName)}
        onClick={() => document.getElementById(`${fieldName}-upload`)?.click()}
      >
        <div className="space-y-1 text-center">
          <UploadCloud
            className={`mx-auto h-10 w-10 ${active ? "text-indigo-600" : "text-slate-400"}`}
          />
          <div className="flex text-sm text-slate-600">
            <label
              htmlFor={`${fieldName}-upload`}
              className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id={`${fieldName}-upload`}
                name={fieldName}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => onFileChange(e, fieldName)}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">PDF up to 10MB</p>
        </div>
      </div>
      {file && (
        <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
          <FileText size={16} className="mr-2 shrink-0 text-indigo-600" />
          <span className="font-medium mr-2 truncate">{file.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearFile(fieldName);
            }}
            className="ml-auto text-red-500 hover:text-red-700 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {errors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
      )}
    </div>
  );
}

export default function RecognizedSupervisorDetailSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [facultyQuery, setFacultyQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<{ id: string; name: string | null } | null>(null);
  const [facultySuggestions, setFacultySuggestions] = useState<Array<{ id: string; name: string | null }>>([]);
  const [showFacultySuggestions, setShowFacultySuggestions] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultiesError, setFacultiesError] = useState("");

  useEffect(() => {
    if (user?.name) {
      setFacultyQuery(user.name);
      setSelectedFaculty({ id: String(user.id || ""), name: user.name });
      setFormData((prev) => ({ ...prev, faculty: user.name }));
    }
  }, [user?.id, user?.name]);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    completionDate: "",
    recognitionDate: "",
    phdAwardDate: "",
    phdDiscipline: "",
    recognitionReceivedDate: "",
    recognitionNumber: "",
    facultyDepartment: "Choose an option",
    researchArea: "",
    eligibleScholars: "",
    scholarsCompleted: "",
    scholarsPursuing: "",
    recognitionOrder: null,
    completedProof: null,
    pursuingProof: null,
    verification: "Initiated",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActiveStates, setDragActiveStates] = useState<DragStates>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof FormErrors];
      return next;
    });
  };

  const handleFacultyInputChange = (value: string) => {
    setFacultyQuery(value);
    setSelectedFaculty(null);
    setFormData((prev) => ({ ...prev, faculty: value }));
    setErrors((prev) => ({ ...prev, faculty: "" }));
    setShowFacultySuggestions(true);
  };

  const handleFacultySelect = (faculty: { id: string; name: string | null }) => {
    setSelectedFaculty(faculty);
    const selectedName = faculty.name || faculty.id;
    setFacultyQuery(selectedName);
    setFormData((prev) => ({ ...prev, faculty: selectedName }));
    setErrors((prev) => ({ ...prev, faculty: "" }));
    setShowFacultySuggestions(false);
  };

  useEffect(() => {
    let cancelled = false;
    if (!facultyQuery.trim()) {
      setFacultySuggestions([]);
      setFacultyLoading(false);
      return;
    }

    setFacultyLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await apiClient.getFaculties(facultyQuery.trim());
        if (!cancelled) {
          setFacultySuggestions(Array.isArray(response.faculties) ? response.faculties : []);
          setFacultiesError("");
        }
      } catch (err) {
        if (!cancelled) {
          setFacultySuggestions([]);
          setFacultiesError("Unable to fetch faculty suggestions.");
        }
      } finally {
        if (!cancelled) setFacultyLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [facultyQuery]);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: FileField,
  ) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const clearFile = (fieldName: FileField) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, fieldName: FileField) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveStates((prev) => ({ ...prev, [fieldName]: true }));
    } else if (e.type === "dragleave") {
      setDragActiveStates((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, fieldName: FileField) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveStates((prev) => ({ ...prev, [fieldName]: false }));
    if (e.dataTransfer.files?.[0]) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.dataTransfer.files[0] }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!selectedFaculty) nextErrors.faculty = "Please select a faculty from the suggestions.";
    if (!facultyQuery.trim()) nextErrors.faculty = "Faculty is required";
    if (!formData.completionDate) nextErrors.completionDate = "Date of completion of PhD is required";
    if (!formData.recognitionDate) nextErrors.recognitionDate = "Date of Supervisor Recognition is required";
    if (!formData.phdAwardDate) nextErrors.phdAwardDate = "Date of Ph.D. degree awarded is required";
    if (!formData.phdDiscipline) nextErrors.phdDiscipline = "Ph.D. discipline is required";
    if (!formData.recognitionReceivedDate) nextErrors.recognitionReceivedDate = "Supervisor Recognition received date is required";
    if (!formData.recognitionNumber) nextErrors.recognitionNumber = "Recognition number is required";
    if (formData.facultyDepartment === "Choose an option") {
      nextErrors.facultyDepartment = "Faculty department is required";
    }
    if (!formData.researchArea) nextErrors.researchArea = "Area of research is required";
    if (!formData.recognitionOrder) nextErrors.recognitionOrder = "Supervisor recognition order PDF is required";
    if (!formData.eligibleScholars) nextErrors.eligibleScholars = "Number of eligible scholars is required";
    if (!formData.scholarsCompleted) nextErrors.scholarsCompleted = "Number of scholars completed is required";
    if (!formData.completedProof) nextErrors.completedProof = "Upload proof for completed scholars";
    if (!formData.scholarsPursuing) nextErrors.scholarsPursuing = "Number of scholars pursuing is required";
    if (!formData.pursuingProof) nextErrors.pursuingProof = "Upload proof for pursuing scholars";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('faculty', facultyQuery);
      fd.append('faculty_id', selectedFaculty?.id || String(user?.id || ''));
      fd.append('completionDate', formData.completionDate);
      fd.append('recognitionDate', formData.recognitionDate);
      fd.append('phdAwardDate', formData.phdAwardDate);
      fd.append('phdDiscipline', formData.phdDiscipline);
      fd.append('recognitionReceivedDate', formData.recognitionReceivedDate);
      fd.append('recognitionNumber', formData.recognitionNumber);
      fd.append('facultyDepartment', formData.facultyDepartment);
      fd.append('researchArea', formData.researchArea);
      fd.append('eligibleScholars', String(formData.eligibleScholars));
      fd.append('scholarsCompleted', String(formData.scholarsCompleted));
      fd.append('scholarsPursuing', String(formData.scholarsPursuing));
      fd.append('verification', formData.verification);
      if (formData.recognitionOrder) fd.append('recognitionOrder', formData.recognitionOrder);
      if (formData.completedProof) fd.append('completedProof', formData.completedProof);
      if (formData.pursuingProof) fd.append('pursuingProof', formData.pursuingProof);

      const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const normalizedBackend = backend.replace(/\/+$/, '');
      const endpoint = normalizedBackend.endsWith('/api')
        ? `${normalizedBackend}/supervisor-details`
        : `${normalizedBackend}/api/supervisor-details`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error('Failed to submit');

      router.push('/faculty/r-and-d/recognized-supervisor-detail');
    } catch (error) {
      console.error("Error submitting supervisor details:", error);
      alert("Failed to submit supervisor details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add Recognized Supervisor Detail
            </h1>
            <p className="text-sm text-slate-500">
              Fill the supervisor recognition record and upload required proofs.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label htmlFor="faculty" className="block text-sm font-medium text-slate-700 mb-1">
                  Faculty <RequiredAst />
                </label>
                <input
                  type="text"
                  id="faculty"
                  name="faculty"
                  value={facultyQuery}
                  onChange={(e) => handleFacultyInputChange(e.target.value)}
                  onFocus={() => setShowFacultySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFacultySuggestions(false), 150)}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.faculty ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Type faculty name and select from suggestions"
                  autoComplete="off"
                />
                {showFacultySuggestions && facultyQuery.trim() && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {facultyLoading ? (
                      <div className="px-3 py-3 text-sm text-slate-500">Searching faculties...</div>
                    ) : facultySuggestions.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-500">No matching faculties found.</div>
                    ) : (
                      facultySuggestions.map((faculty) => (
                        <button
                          key={faculty.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFacultySelect(faculty)}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {faculty.name || faculty.id}
                        </button>
                      ))
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Start typing a faculty name, then choose a suggestion to save the record.
                </p>
                {facultiesError && <p className="mt-1 text-sm text-red-600">{facultiesError}</p>}
                {errors.faculty && <p className="mt-1 text-sm text-red-600">{errors.faculty}</p>}
              </div>
              <div>
                <label htmlFor="completionDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Date of completion of PhD <RequiredAst />
                </label>
                <input
                  type="date"
                  id="completionDate"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.completionDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.completionDate && <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="recognitionDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Supervisor Recognition <RequiredAst />
                </label>
                <input
                  type="date"
                  id="recognitionDate"
                  name="recognitionDate"
                  value={formData.recognitionDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.recognitionDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.recognitionDate && <p className="mt-1 text-sm text-red-600">{errors.recognitionDate}</p>}
              </div>
              <div>
                <label htmlFor="phdAwardDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Ph.D Degree Awarded <RequiredAst />
                </label>
                <input
                  type="date"
                  id="phdAwardDate"
                  name="phdAwardDate"
                  value={formData.phdAwardDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.phdAwardDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.phdAwardDate && <p className="mt-1 text-sm text-red-600">{errors.phdAwardDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phdDiscipline" className="block text-sm font-medium text-slate-700 mb-1">
                  Ph.D. Degree Awarded Discipline <RequiredAst />
                </label>
                <input
                  type="text"
                  id="phdDiscipline"
                  name="phdDiscipline"
                  value={formData.phdDiscipline}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.phdDiscipline ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter discipline"
                />
                {errors.phdDiscipline && <p className="mt-1 text-sm text-red-600">{errors.phdDiscipline}</p>}
              </div>
              <div>
                <label htmlFor="recognitionReceivedDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Supervisor Recognition Received <RequiredAst />
                </label>
                <input
                  type="date"
                  id="recognitionReceivedDate"
                  name="recognitionReceivedDate"
                  value={formData.recognitionReceivedDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.recognitionReceivedDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.recognitionReceivedDate && <p className="mt-1 text-sm text-red-600">{errors.recognitionReceivedDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="recognitionNumber" className="block text-sm font-medium text-slate-700 mb-1">
                  Supervisor Recognition Number <RequiredAst />
                </label>
                <input
                  type="text"
                  id="recognitionNumber"
                  name="recognitionNumber"
                  value={formData.recognitionNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.recognitionNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter recognition number"
                />
                {errors.recognitionNumber && <p className="mt-1 text-sm text-red-600">{errors.recognitionNumber}</p>}
              </div>
              <div>
                <label htmlFor="facultyDepartment" className="block text-sm font-medium text-slate-700 mb-1">
                  Faculty with respect to Supervisor Recognition <RequiredAst />
                </label>
                <select
                  id="facultyDepartment"
                  name="facultyDepartment"
                  value={formData.facultyDepartment}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.facultyDepartment ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {FACULTY_DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option} disabled={option === "Choose an option"}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.facultyDepartment && <p className="mt-1 text-sm text-red-600">{errors.facultyDepartment}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="researchArea" className="block text-sm font-medium text-slate-700 mb-1">
                Area of Research <RequiredAst />
              </label>
              <input
                type="text"
                id="researchArea"
                name="researchArea"
                value={formData.researchArea}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.researchArea ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter area of research"
              />
              {errors.researchArea && <p className="mt-1 text-sm text-red-600">{errors.researchArea}</p>}
            </div>

            <div>
              <FileInput
                fieldName="recognitionOrder"
                label="Attach The Supervisor Recognition Order (PDF) <RequiredAst />"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="eligibleScholars" className="block text-sm font-medium text-slate-700 mb-1">
                  No. of eligible scholars as per AU-CFR <RequiredAst />
                </label>
                <input
                  type="number"
                  id="eligibleScholars"
                  name="eligibleScholars"
                  value={formData.eligibleScholars}
                  onChange={handleChange}
                  min={0}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eligibleScholars ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter number"
                />
                {errors.eligibleScholars && <p className="mt-1 text-sm text-red-600">{errors.eligibleScholars}</p>}
              </div>
              <div>
                <label htmlFor="scholarsCompleted" className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Scholars Completed under Your Guidance <RequiredAst />
                </label>
                <input
                  type="number"
                  id="scholarsCompleted"
                  name="scholarsCompleted"
                  value={formData.scholarsCompleted}
                  onChange={handleChange}
                  min={0}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.scholarsCompleted ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter number"
                />
                {errors.scholarsCompleted && <p className="mt-1 text-sm text-red-600">{errors.scholarsCompleted}</p>}
              </div>
              <div>
                <label htmlFor="scholarsPursuing" className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Scholars Pursuing under Your Guidance <RequiredAst />
                </label>
                <input
                  type="number"
                  id="scholarsPursuing"
                  name="scholarsPursuing"
                  value={formData.scholarsPursuing}
                  onChange={handleChange}
                  min={0}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.scholarsPursuing ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter number"
                />
                {errors.scholarsPursuing && <p className="mt-1 text-sm text-red-600">{errors.scholarsPursuing}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput
                fieldName="completedProof"
                label="Attach Proof (Available in the AU-CFR Portal under Supervisor Section)"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="pursuingProof"
                label="Attach Proof (Available in the AU-CFR Portal under Supervisor Section)"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="verification" className="block text-sm font-medium text-slate-700 mb-1">
                  R & D Verification <RequiredAst />
                </label>
                <select
                  id="verification"
                  name="verification"
                  value={formData.verification}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {VERIFICATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#2572ed] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
