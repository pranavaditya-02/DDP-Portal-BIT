"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface InternshipReportSummary {
  id: number;
  tracker_id?: number;
  student_name?: string | null;
  special_lab_name?: string | null;
  year_of_study: number;
  sector: string;
  industry_address_line_1?: string | null;
  industry_address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  industry_website?: string | null;
  industry_contact_details?: string | null;
  referred_by?: string | null;
  referee_name?: string | null;
  referee_mobile_number?: string | null;
  stipend_received?: string | null;
  stipend_amount?: number | string;
  is_through_aicte?: string | null;
  claim_type?: string | null;
  sdg_goal_name?: string | null;
  full_document_proof_url?: string | null;
  original_certificate_url?: string | null;
  attested_certificate_url?: string | null;
  iqac_verification: string;
  created_at: string;
}

export default function Page() {
  const [reports, setReports] = useState<InternshipReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<InternshipReportSummary | null>(null);

  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        const response = await apiClient.getInternshipReports();
        setReports(response?.reports || []);
      } catch (loadError: any) {
        console.error('Failed to load internship reports:', loadError);
        setError('Failed to load internship reports.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleUpdateReportStatus = async (reportId: number, iqac_verification: 'Initiated' | 'Approved' | 'Rejected') => {
    setError(null);
    setStatusMessage(null);
    setUpdatingReportId(reportId);

    try {
      const response = await apiClient.updateInternshipReportIqac(reportId, iqac_verification);
      setReports((prev) => prev.map((report) => report.id === reportId ? { ...report, iqac_verification } : report));
      setSelectedReport((current) => current && current.id === reportId ? { ...current, iqac_verification } : current);
      setStatusMessage(response?.message || `Report ${iqac_verification.toLowerCase()} successfully.`);
    } catch (updateError: any) {
      console.error('Failed to update report status:', updateError);
      setError(updateError?.response?.data?.error || 'Failed to update report status.');
    } finally {
      setUpdatingReportId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Internship Report</h1>
          <p className="mt-2 text-slate-400">View submitted reports or create a new internship report.</p>
        </div>

        <Link
          href="/student/internship/report/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Create Report
        </Link>
      </div>

      <div className="mt-8">
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {statusMessage}
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Student</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Lab</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Year</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Sector</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">SDG Goal</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">IQAC</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No internship reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{report.student_name || 'Unknown'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{report.special_lab_name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{report.year_of_study}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{report.sector}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{report.sdg_goal_name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{report.iqac_verification}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{new Date(report.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Internship Report Details</h2>
                <p className="text-sm text-slate-500">Review the report details and approve or reject it.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 px-6 py-6 overflow-y-auto max-h-[70vh]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.student_name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Special Lab</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.special_lab_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Year</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.year_of_study}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Sector</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.sector}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">SDG Goal</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.sdg_goal_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">IQAC Status</div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
                    {selectedReport.iqac_verification}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Industry Website</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.industry_website || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Industry Contact</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.industry_contact_details || 'N/A'}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Address</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.industry_address_line_1 || 'N/A'}
                    {selectedReport.industry_address_line_2 ? `, ${selectedReport.industry_address_line_2}` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Location</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.city || 'N/A'}, {selectedReport.state || 'N/A'} {selectedReport.postal_code || ''}
                    {selectedReport.country ? `, ${selectedReport.country}` : ''}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Referred By</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.referred_by || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Referee</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.referee_name || 'N/A'}{selectedReport.referee_mobile_number ? ` • ${selectedReport.referee_mobile_number}` : ''}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Stipend Received</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.stipend_received || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Stipend Amount</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.stipend_amount !== undefined && selectedReport.stipend_amount !== null
                      ? (() => {
                          const amount = Number(selectedReport.stipend_amount);
                          return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : 'N/A';
                        })()
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Through AICTE</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.is_through_aicte || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Claim Type</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.claim_type || 'N/A'}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Created</div>
                  <div className="mt-1 font-medium text-slate-900">{new Date(selectedReport.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">SDG Goal</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.sdg_goal_name || 'N/A'}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Full Document Proof</div>
                  {selectedReport.full_document_proof_url ? (
                    <a
                      href={selectedReport.full_document_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                    >
                      View document
                    </a>
                  ) : (
                    <div className="mt-2 text-sm text-slate-500">Not available</div>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Original Certificate</div>
                  {selectedReport.original_certificate_url ? (
                    <a
                      href={selectedReport.original_certificate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                    >
                      View document
                    </a>
                  ) : (
                    <div className="mt-2 text-sm text-slate-500">Not available</div>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Attested Certificate</div>
                  {selectedReport.attested_certificate_url ? (
                    <a
                      href={selectedReport.attested_certificate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                    >
                      View document
                    </a>
                  ) : (
                    <div className="mt-2 text-sm text-slate-500">Not available</div>
                  )}
                </div>
              </div>

              {isVerification && selectedReport.iqac_verification === 'Initiated' && (
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'Rejected')}
                    disabled={updatingReportId === selectedReport.id}
                    className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {updatingReportId === selectedReport.id ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'Approved')}
                    disabled={updatingReportId === selectedReport.id}
                    className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {updatingReportId === selectedReport.id ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
