"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";

const ROLE_OPTIONS = ["Author", "Editor"] as const;
const AUTHOR_TYPE_OPTIONS = [
  "BIT Faculty",
  "BIT Student",
  "Institute - National",
  "Institute - International",
  "Industry",
  "NA",
] as const;
const BOOK_TYPES = ["Book Chapter", "Book Publication"] as const;
const INDEXING_OPTIONS = ["WOS", "SCOPUS", "Not Indexed"] as const;
const VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"] as const;

type AuthorInfo = {
  name: string;
  type: string;
  details: string;
};

export default function BookPublicationPage() {
  const router = useRouter();
  const [facultyQuery, setFacultyQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<{ id: string; name: string | null } | null>(null);
  const [facultySuggestions, setFacultySuggestions] = useState<Array<{ id: string; name: string | null }>>([]);
  const [showFacultySuggestions, setShowFacultySuggestions] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyFetchError, setFacultyFetchError] = useState("");
  const [taskId, setTaskId] = useState("");
  const [role, setRole] = useState<string>(ROLE_OPTIONS[0]);
  const [numAuthors, setNumAuthors] = useState<number>(1);
  const [authors, setAuthors] = useState<AuthorInfo[]>(
    Array.from({ length: 6 }, () => ({ name: "", type: "NA", details: "" })),
  );
  const [bookType, setBookType] = useState<string>(BOOK_TYPES[1]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [indexing, setIndexing] = useState<string>(INDEXING_OPTIONS[2]);
  const [pubDate, setPubDate] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [claimedBy, setClaimedBy] = useState("");
  const [authorPosition, setAuthorPosition] = useState("");
  const [verification, setVerification] = useState<string>(VERIFICATION_OPTIONS[0]);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNumAuthors = (e: ChangeEvent<HTMLSelectElement>) => {
    const n = Number(e.target.value);
    setNumAuthors(n);
  };

  const handleAuthorChange = (index: number, field: keyof AuthorInfo, value: string) => {
    setAuthors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleProof = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProof(e.target.files[0]);
    }
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
          setFacultyFetchError("");
        }
      } catch (error) {
        if (!cancelled) {
          setFacultySuggestions([]);
          setFacultyFetchError("Unable to fetch faculty list.");
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

  const resetFacultySelection = () => {
    setSelectedFaculty(null);
    setFacultyFetchError("");
  };

  const handleFacultySelect = (faculty: { id: string; name: string | null }) => {
    setSelectedFaculty(faculty);
    setFacultyQuery(faculty.name || faculty.id);
    setShowFacultySuggestions(false);
    setFacultyFetchError("");
  };

  const handleFacultyInputChange = (value: string) => {
    setFacultyQuery(value);
    resetFacultySelection();
    setShowFacultySuggestions(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!selectedFaculty?.id) errors.facultyQuery = "Please select a faculty from the list.";
    if (!bookTitle.trim()) errors.bookTitle = "Book title is required";
    if (!claimedBy.trim()) errors.claimedBy = "Claimed by is required";
    for (let i = 0; i < numAuthors; i += 1) {
      if (!authors[i].name.trim()) {
        errors.authors = "Please fill all visible author names.";
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("FacultyId", selectedFaculty?.id || "");
      fd.append("TaskID", taskId);
      fd.append("Role", role);
      fd.append("BookType", bookType);
      fd.append("ChapterTitle", chapterTitle);
      fd.append("BookTitle", bookTitle);
      fd.append("ISBN_Number", isbn);
      fd.append("PublisherName", publisher);
      fd.append("Indexing", indexing);
      fd.append("DateOfPublication", pubDate);
      fd.append("ClaimedBy", claimedBy);
      fd.append("AuthorPosition", authorPosition);
      fd.append("RD_Verification", verification);

      for (let i = 0; i < numAuthors; i += 1) {
        fd.append(`Author${i + 1}_Type`, authors[i].type);
        fd.append(`Author${i + 1}_Name`, authors[i].name);
        fd.append(`Author${i + 1}_Details`, authors[i].details);
      }

      if (proof) {
        fd.append("proof", proof);
      }

      await apiClient.createBookPublication(fd);
      router.push("/faculty/r-and-d/bookpublications");
    } catch (error) {
      console.error(error);
      alert("Failed to submit book publication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold">Add Book Publication</h1>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Faculty <span className="text-red-500">*</span></label>
                <input
                  value={facultyQuery}
                  onChange={(e) => handleFacultyInputChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Search faculty name or ID..."
                  autoComplete="off"
                />
                {showFacultySuggestions && facultyQuery.trim() && (
                  <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {facultyLoading ? (
                      <div className="px-3 py-3 text-sm text-slate-500">Searching faculties...</div>
                    ) : facultySuggestions.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-500">No matching faculties found.</div>
                    ) : (
                      facultySuggestions.map((faculty) => (
                        <button
                          key={faculty.id}
                          type="button"
                          onClick={() => handleFacultySelect(faculty)}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {faculty.name ? `${faculty.name} (${faculty.id})` : faculty.id}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {(localErrors.facultyQuery || facultyFetchError) && (
                  <p className="mt-1 text-sm text-rose-600">{localErrors.facultyQuery || facultyFetchError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task ID</label>
                <input
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Book Type</label>
                <select
                  value={bookType}
                  onChange={(e) => setBookType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {BOOK_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Indexing</label>
                <select
                  value={indexing}
                  onChange={(e) => setIndexing(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {INDEXING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Book Title</label>
              <input
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {localErrors.bookTitle && <p className="mt-1 text-sm text-rose-600">{localErrors.bookTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chapter Title (optional)</label>
              <input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ISBN Number</label>
                <input
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Publisher Name</label>
                <input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Publication Date</label>
                <input
                  type="date"
                  value={pubDate}
                  onChange={(e) => setPubDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author Position</label>
                <input
                  value={authorPosition}
                  onChange={(e) => setAuthorPosition(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Claimed By</label>
                <input
                  value={claimedBy}
                  onChange={(e) => setClaimedBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                {localErrors.claimedBy && <p className="mt-1 text-sm text-rose-600">{localErrors.claimedBy}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verification Status</label>
                <select
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {VERIFICATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Authors</label>
              <select
                value={String(numAuthors)}
                onChange={handleNumAuthors}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {Array.from({ length: numAuthors }, (_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800">Author {index + 1}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select
                        value={authors[index].type}
                        onChange={(e) => handleAuthorChange(index, "type", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        {AUTHOR_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        value={authors[index].name}
                        onChange={(e) => handleAuthorChange(index, "name", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                    <input
                      value={authors[index].details}
                      onChange={(e) => handleAuthorChange(index, "details", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Designation, department, address"
                    />
                  </div>
                </div>
              ))}
              {localErrors.authors && <p className="text-sm text-rose-600">{localErrors.authors}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proof (PDF)</label>
              <input type="file" accept="application/pdf" onChange={handleProof} />
              {proof && <p className="mt-2 text-sm text-slate-500">{proof.name}</p>}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
