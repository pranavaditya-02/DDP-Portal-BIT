"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

interface BookPublicationRecord {
  PublicationID: number;
  FacultyName: string;
  TaskID: string | null;
  Role: string | null;
  Author1_Type: string | null;
  Author1_Name: string | null;
  Author1_Details: string | null;
  Author2_Type: string | null;
  Author2_Name: string | null;
  Author2_Details: string | null;
  Author3_Type: string | null;
  Author3_Name: string | null;
  Author3_Details: string | null;
  Author4_Type: string | null;
  Author4_Name: string | null;
  Author4_Details: string | null;
  Author5_Type: string | null;
  Author5_Name: string | null;
  Author5_Details: string | null;
  Author6_Type: string | null;
  Author6_Name: string | null;
  Author6_Details: string | null;
  BookType: string | null;
  ChapterTitle: string | null;
  BookTitle: string | null;
  ISBN_Number: string | null;
  PublisherName: string | null;
  Indexing: string | null;
  DateOfPublication: string | null;
  ProofFilePath: string | null;
  ClaimedBy: string | null;
  AuthorPosition: string | null;
  RD_Verification: string | null;
}

const STATUS_ORDER = ["Initiated", "Approved", "Rejected"] as const;
const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function renderVerificationBadge(status: string | null) {
  if (!status) {
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Unknown</span>;
  }

  const config: Record<string, { label: string; className: string }> = {
    Initiated: { label: "Initiated", className: "bg-slate-100 text-slate-700" },
    Approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
    Rejected: { label: "Rejected", className: "bg-rose-100 text-rose-800" },
  };

  const meta = config[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>;
}

const BookPublicationsPage: React.FC = () => {
  const [records, setRecords] = useState<BookPublicationRecord[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true);
      setFetchError("");

      try {
        const data = await apiClient.getBookPublications();
        const items = Array.isArray(data.items) ? data.items : [];
        setRecords(items as BookPublicationRecord[]);
      } catch (error: any) {
        setFetchError(error?.message || "Could not fetch book publications.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return records;

    return records.filter((record) => {
      return [
        String(record.PublicationID),
        record.FacultyName,
        record.TaskID,
        record.Role,
        record.BookType,
        record.BookTitle,
        record.PublisherName,
        record.Indexing,
        record.ClaimedBy,
        record.AuthorPosition,
        record.RD_Verification,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [query, records]);

  const statusCounts = useMemo(
    () =>
      STATUS_ORDER.reduce((acc, status) => {
        acc[status] = records.filter((record) => record.RD_Verification === status).length;
        return acc;
      }, {} as Record<string, number>),
    [records],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Book Publications</h1>
          <p className="mt-2 text-sm text-slate-500">
            View submitted book publications and chapters, with quick access to create a new record.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <span className="text-slate-500">{status}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {statusCounts[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/faculty/r-and-d/bookpublications/create"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Publication
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[380px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search faculty, title, publisher or status..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <span className="text-sm text-slate-500">{filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}</span>
        </div>

        <div className="overflow-x-auto p-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading book publications...</div>
          ) : fetchError ? (
            <div className="p-8 text-center text-sm text-rose-600">{fetchError}</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-2 px-3">ID</th>
                  <th className="pb-2 px-3">Faculty</th>
                  <th className="pb-2 px-3">Task ID</th>
                  <th className="pb-2 px-3">Role</th>
                  <th className="pb-2 px-3">Book Title</th>
                  <th className="pb-2 px-3">Publisher</th>
                  <th className="pb-2 px-3">Indexing</th>
                  <th className="pb-2 px-3">Published</th>
                  <th className="pb-2 px-3">Status</th>
                  <th className="pb-2 px-3">Proof</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={record.PublicationID} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.PublicationID}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.FacultyName || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.TaskID || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.Role || "-"}</td>
                      <td className="px-3 py-4 text-sm text-slate-700 min-w-[220px]">{record.BookTitle || "-"}</td>
                      <td className="px-3 py-4 text-sm text-slate-700">{record.PublisherName || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.Indexing || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">
                        {record.DateOfPublication ? new Date(record.DateOfPublication).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-4 text-sm">{renderVerificationBadge(record.RD_Verification)}</td>
                      <td className="px-3 py-4 text-sm">
                        {record.ProofFilePath ? (
                          <a
                            href={`${backendBaseUrl}${record.ProofFilePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            View proof
                          </a>
                        ) : (
                          <span className="text-slate-500">No proof</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-3 py-10 text-center text-sm text-slate-500">
                      No book publications found. Click “Add Publication” to create a new record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookPublicationsPage;
