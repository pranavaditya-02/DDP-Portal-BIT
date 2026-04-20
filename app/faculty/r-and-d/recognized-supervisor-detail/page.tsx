"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Users, Plus, Trash2 } from "lucide-react";

type Status = "Initiated" | "Approved" | "Rejected";

interface SupervisorRecord {
  id: string;
  faculty: string;
  recognitionNumber: string;
  discipline: string;
  eligibleScholars: number;
  scholarsCompleted: number;
  scholarsPursuing: number;
  verification: Status;
  submittedOn: string;
}

const sampleData: SupervisorRecord[] = [];

const STATUS_OPTIONS: Array<"All" | Status> = [
  "All",
  "Initiated",
  "Approved",
  "Rejected",
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Initiated: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function RecognizedSupervisorDetailPage() {
  const [records, setRecords] = useState<SupervisorRecord[]>(sampleData);
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRecords = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getSupervisorDetails();
        if (cancelled) return;
        if (Array.isArray(response)) {
          setRecords(response.map((item) => ({
            id: String(item.id),
            faculty: item.faculty_name || item.faculty || '',
            recognitionNumber: item.recognition_number || item.recognitionNumber || '',
            discipline: item.discipline || item.phd_degree_discipline || '',
            eligibleScholars: Number(item.eligible_scholars_count ?? item.eligibleScholars ?? 0),
            scholarsCompleted: Number(item.scholars_completed_count ?? item.scholarsCompleted ?? 0),
            scholarsPursuing: Number(item.scholars_pursuing_count ?? item.scholarsPursuing ?? 0),
            verification: item.verification || 'Initiated',
            submittedOn: item.submitted_on || item.submittedOn || '',
          })));
        } else {
          setError('Invalid supervisor details response from server.');
        }
      } catch (fetchError: any) {
        setError(fetchError?.message || 'Failed to load supervisor details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = records.filter(
    (record) => statusFilter === "All" || record.verification === statusFilter,
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Recognized Supervisor Detail
              </h1>
              <p className="text-sm text-slate-500">
                Supervisor recognition records and verification status.
              </p>
            </div>
          </div>
          <Link
            href="/faculty/r-and-d/recognized-supervisor-detail/submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2572ed] hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Verification
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "All" | Status)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 text-sm text-slate-600">
            Loading supervisor records...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 mb-6 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "ID",
                    "Faculty",
                    "Recognition No.",
                    "Discipline",
                    "Eligible Scholars",
                    "Completed",
                    "Pursuing",
                    "Verification",
                    "Submitted",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-400 text-sm">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {record.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{record.faculty}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.recognitionNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{record.discipline}</td>
                      <td className="px-4 py-3 text-slate-600 text-center">{record.eligibleScholars}</td>
                      <td className="px-4 py-3 text-slate-600 text-center">{record.scholarsCompleted}</td>
                      <td className="px-4 py-3 text-slate-600 text-center">{record.scholarsPursuing}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={record.verification} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {record.submittedOn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {record.verification === "Initiated" && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            Showing {filtered.length} of {records.length} record{records.length !== 1 ? "s" : ""}.
          </div>
        </div>
      </div>
    </div>
  );
}
