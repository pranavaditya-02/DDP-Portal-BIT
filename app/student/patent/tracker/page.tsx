"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, Filter, ChevronDown, ChevronRight, ChevronUp, FileText, ExternalLink, Clipboard, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface PatentTracker {
  id: number;
  tracker_number?: number;
  student_name: string;
  student_roll_no?: string | null;
  patent_title?: string | null;
  patent_type?: string | null;
  applicants_involved?: string | null;
  experimentation_file_path?: string | null;
  drawings_file_path?: string | null;
  forms_file_path?: string | null;
  iqac_verification: 'initiated' | 'approved' | 'declined' | string;
  reject_reason?: string | null;
}

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
const resolveFileUrl = (p?: string | null) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/')) return `${BACKEND_BASE}${p}`;
  return `${BACKEND_BASE}/${p}`;
};

const getInitials = (name = '') => {
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
};

const renderStatusBadge = (status: PatentTracker['iqac_verification']) => {
  const map: Record<string, { label: string; className: string }> = {
    initiated: { label: 'Initiated', className: 'bg-yellow-50 text-yellow-700 ring-yellow-100' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    declined: { label: 'Declined', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
  };
  const info = map[String(status).toLowerCase()] || { label: String(status || ''), className: 'bg-slate-50 text-slate-700' };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${info.className}`}>
      {String(status).toLowerCase() === 'approved' ? <CheckCircle className="w-3 h-3" /> : String(status).toLowerCase() === 'declined' ? <XCircle className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 rotate-90" />}
      <span className="capitalize">{info.label}</span>
    </span>
  );
};

type TrackerSortKey = "student_name" | "patent_title" | "patent_type";
type SortDirection = "asc" | "desc" | null;

export default function Page() {
  const [trackers, setTrackers] = useState<PatentTracker[]>([]);
  const [query, setQuery] = useState("");
  const [filterPatentType, setFilterPatentType] = useState("");
  const [filterFileName, setFilterFileName] = useState("");
  const [filterIqacStatus, setFilterIqacStatus] = useState("");
  const [sortKey, setSortKey] = useState<TrackerSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [perPage, setPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const computeSortIcon = (column: TrackerSortKey) => {
    if (sortKey !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 inline-block h-3 w-3 text-slate-400" />
    ) : (
      <ChevronDown className="ml-1 inline-block h-3 w-3 text-slate-400" />
    );
  };

  const handleSort = (column: TrackerSortKey) => {
    if (sortKey !== column) {
      setSortKey(column);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    setSortKey(null);
    setSortDirection(null);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedTracker, setSelectedTracker] = useState<PatentTracker | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<{ initiated: boolean; approved: boolean; declined: boolean }>({ initiated: true, approved: true, declined: true });
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied to clipboard');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (err) {
      setCopyMessage('Failed to copy');
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const normalizeErrorMessage = (error: unknown): string => {
    if (!error) return 'An unknown error occurred.';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    try {
      return JSON.stringify(error);
    } catch { return String(error); }
  };

  useEffect(() => {
    const loadTrackers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPatentTrackers();
        setTrackers(response?.trackers || []);
      } catch (loadError: any) {
        console.error('Failed to load patent trackers:', loadError);
        setError(normalizeErrorMessage(loadError) || 'Failed to load patent trackers.');
      } finally {
        setLoading(false);
      }
    };

    loadTrackers();
  }, []);

  const availablePatentTypes = useMemo(() => {
    const vals = trackers.map(t => t.patent_type).filter((v): v is string => v != null && v !== '');
    return [...new Set(vals)].sort();
  }, [trackers]);

  const statusCounts = useMemo(() => ({
    initiated: trackers.filter(t => String(t.iqac_verification).toLowerCase() === 'initiated').length,
    approved: trackers.filter(t => String(t.iqac_verification).toLowerCase() === 'approved').length,
    declined: trackers.filter(t => String(t.iqac_verification).toLowerCase() === 'declined').length,
  }), [trackers]);

  const filteredTrackers = useMemo(() => {
    let data = trackers;
    const normalized = query.trim().toLowerCase();

    if (normalized) {
      data = data.filter((item) =>
        item.tracker_number?.toString().includes(normalized) ||
        item.id.toString().includes(normalized) ||
        item.student_name.toLowerCase().includes(normalized) ||
        item.student_roll_no?.toLowerCase().includes(normalized) ||
        item.patent_title?.toLowerCase().includes(normalized) ||
        item.applicants_involved?.toLowerCase().includes(normalized) ||
        item.iqac_verification?.toLowerCase().includes(normalized) ||
        item.experimentation_file_path?.toLowerCase().includes(normalized) ||
        item.drawings_file_path?.toLowerCase().includes(normalized)
      );
    }

    if (filterPatentType) {
      data = data.filter((item) => item.patent_type === filterPatentType);
    }

    if (filterFileName.trim()) {
      const n = filterFileName.trim().toLowerCase();
      data = data.filter((item) =>
        item.experimentation_file_path?.toLowerCase().includes(n) ||
        item.drawings_file_path?.toLowerCase().includes(n) ||
        item.forms_file_path?.toLowerCase().includes(n)
      );
    }

    if (filterIqacStatus) {
      data = data.filter((item) => String(item.iqac_verification).toLowerCase() === filterIqacStatus);
    }

    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const getValue = (item: PatentTracker) => String(item[sortKey] ?? '').toLowerCase();
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [query, trackers, filterPatentType, filterFileName, filterIqacStatus, sortKey, sortDirection]);

  const visibleTrackers = useMemo(() => filteredTrackers.slice(0, perPage), [filteredTrackers, perPage]);

  const groupedTrackers = useMemo(() => ({
    initiated: visibleTrackers.filter((t) => String(t.iqac_verification).toLowerCase() === 'initiated'),
    approved: visibleTrackers.filter((t) => String(t.iqac_verification).toLowerCase() === 'approved'),
    declined: visibleTrackers.filter((t) => String(t.iqac_verification).toLowerCase() === 'declined'),
  }), [visibleTrackers]);

  const toggleSection = (section: keyof typeof sectionOpen) => setSectionOpen(prev => ({ ...prev, [section]: !prev[section] }));

  const handleUpdateStatus = async (tracker: PatentTracker, iqac_verification: PatentTracker['iqac_verification'], reject_reason?: string) => {
    try {
      setError(null);
      setUpdatingId(tracker.id);
      const response = await apiClient.updatePatentTrackerIqac(tracker.id, iqac_verification as any, reject_reason);
      const updated = response?.tracker;
      if (updated) setTrackers(prev => prev.map(item => item.id === tracker.id ? updated : item));
      setSelectedTracker(updated || null);
      setRejectReason('');
      setIsConfirmingReject(false);
    } catch (err: any) {
      console.error('Failed to update patent tracker status:', err);
      setError(normalizeErrorMessage(err) || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patent Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Keep track of your patent submissions and drafts.</p>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">Initiated</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">{statusCounts.initiated}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">Approved</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">{statusCounts.approved}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">Declined</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">{statusCounts.declined}</span>
            </div>
          </div>
        </div>

        <Link href="/student/patent/tracker/create" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
          <PlusCircle className="w-4 h-4" />
          Create Patent
        </Link>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student, roll, patent title or IQAC..." className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowFilters((prev) => !prev)} className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-400">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex items-center gap-2">
              {(['', 'initiated', 'approved', 'declined'] as const).map((s) => {
                if (s === '') return (
                  <button key="all" onClick={() => setFilterIqacStatus('')} className="text-xs text-slate-500 px-2 py-1">All</button>
                );
                return (
                  <button key={s} onClick={() => setFilterIqacStatus(s)} className={`text-xs px-2 py-1 rounded-full font-medium ${filterIqacStatus === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-400">{filteredTrackers.length} items</span>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Patent type</label>
                <select value={filterPatentType} onChange={(e) => setFilterPatentType(e.target.value)} className="input-base w-full">
                  <option value="">All types</option>
                  {availablePatentTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">File name</label>
                <input value={filterFileName} onChange={(e) => setFilterFileName(e.target.value)} placeholder="Search file name" className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">IQAC verification</label>
                <select value={filterIqacStatus} onChange={(e) => setFilterIqacStatus(e.target.value)} className="input-base w-full">
                  <option value="">All statuses</option>
                  <option value="initiated">Initiated</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Per page</label>
                <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="input-base w-full">{[10,20,50,100].map(v => (<option key={v} value={v}>{v}</option>))}</select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setFilterPatentType(''); setFilterFileName(''); setFilterIqacStatus(''); }} className="btn-outline px-3 py-2">Clear filters</button>
              <span className="text-xs text-slate-500">Showing {visibleTrackers.length} of {filteredTrackers.length} filtered results</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading patent trackers...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : filteredTrackers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3"><PlusCircle className="w-7 h-7 text-slate-400" /></div>
            <h2 className="text-lg font-medium text-slate-700">No Patent Trackers Yet</h2>
            <p className="mt-1 text-sm text-slate-500">Click on Create to add your first patent tracker record.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(['initiated','approved','declined'] as const).map((status) => {
              const items = groupedTrackers[status];
              const title = status === 'initiated' ? 'Initiated' : status === 'approved' ? 'Approved' : 'Declined';
              return (
                <div key={status} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <button type="button" onClick={() => toggleSection(status)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-slate-200 text-slate-600">{sectionOpen[status] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</span>
                      <span>{title}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{items.length}</span>
                    </div>
                    <span className="text-xs text-slate-500">{sectionOpen[status] ? 'Hide' : 'Show'}</span>
                  </button>

                  {sectionOpen[status] && (
                    <div className="overflow-x-auto bg-white px-4 pb-4">
                      {items.length === 0 ? (
                        <div className="px-4 py-5 text-sm text-slate-500">No {title.toLowerCase()} trackers.</div>
                      ) : (
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50 text-slate-700">
                            <tr>
                              <th className="px-4 py-3 text-left">Student</th>
                              <th className="px-4 py-3 text-left"><button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => handleSort('patent_title')}>Title{computeSortIcon('patent_title')}</button></th>
                              <th className="px-4 py-3 text-left"><button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => handleSort('patent_type')}>Type{computeSortIcon('patent_type')}</button></th>
                              <th className="px-4 py-3 text-left">Documents</th>
                              <th className="px-4 py-3 text-left">Status</th>
                              <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map((tracker) => (
                              <tr key={tracker.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTracker(tracker)}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 font-semibold">{getInitials(tracker.student_name)}</div>
                                    <div>
                                      <div className="font-medium text-slate-900">{tracker.student_name}</div>
                                      <div className="text-xs text-slate-500">{tracker.student_roll_no} • #{tracker.tracker_number ?? tracker.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3"><div className="text-sm font-medium">{tracker.patent_title}</div></td>
                                <td className="px-4 py-3"><div className="text-sm">{tracker.patent_type}</div></td>
                                <td className="px-4 py-3 space-x-3">
                                  {tracker.experimentation_file_path ? (
                                    <span className="inline-flex items-center gap-2">
                                      <a title={resolveFileUrl(tracker.experimentation_file_path)} href={resolveFileUrl(tracker.experimentation_file_path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                        <FileText className="w-4 h-4" />
                                        <span className="text-xs">Experiment</span>
                                      </a>
                                      <button title="Copy link" type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(resolveFileUrl(tracker.experimentation_file_path)); }} className="text-slate-500 hover:text-slate-700"><Clipboard className="w-3 h-3" /></button>
                                    </span>
                                  ) : (<span className="text-xs text-slate-400">-</span>)}
                                  {tracker.drawings_file_path ? (
                                    <span className="inline-flex items-center gap-2">
                                      <a title={resolveFileUrl(tracker.drawings_file_path)} href={resolveFileUrl(tracker.drawings_file_path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-xs">Drawings</span>
                                      </a>
                                      <button title="Copy link" type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(resolveFileUrl(tracker.drawings_file_path)); }} className="text-slate-500 hover:text-slate-700"><Clipboard className="w-3 h-3" /></button>
                                    </span>
                                  ) : null}
                                </td>
                                <td className="px-4 py-3">{renderStatusBadge(tracker.iqac_verification)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={(e)=>{e.stopPropagation(); setSelectedTracker(tracker);}} className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 bg-white">Details</button>
                                    {tracker.experimentation_file_path ? (<a onClick={(e)=>e.stopPropagation()} href={`${BACKEND_BASE}${tracker.experimentation_file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-sm text-slate-700"><ExternalLink className="w-3 h-3"/></a>) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => { setSelectedTracker(null); setIsConfirmingReject(false); setRejectReason(''); }}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Patent Request Details</h2>
                <p className="text-sm text-slate-500">Review the request and approve or reject it.</p>
              </div>
              <button type="button" onClick={() => { setSelectedTracker(null); setIsConfirmingReject(false); setRejectReason(''); }} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">Close</button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Request ID</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.tracker_number ?? selectedTracker.id}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.student_name}</div>
                  <div className="text-sm text-slate-500">{selectedTracker.student_roll_no}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Patent Title</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.patent_title}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Patent Type</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.patent_type}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Applicants</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.applicants_involved}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">IQAC status</div>
                  <div className="mt-1">{renderStatusBadge(selectedTracker.iqac_verification)}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Experimentation / Image</div>
                  {selectedTracker.experimentation_file_path ? (
                    <a href={resolveFileUrl(selectedTracker.experimentation_file_path)} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-blue-600 hover:underline">View Experimentation</a>
                  ) : (<div className="mt-2 text-sm text-slate-500">No document uploaded.</div>)}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Drawings / Forms</div>
                  {selectedTracker.drawings_file_path ? (
                    <a href={resolveFileUrl(selectedTracker.drawings_file_path)} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-blue-600 hover:underline">View Drawings</a>
                  ) : (<div className="mt-2 text-sm text-slate-500">No drawings uploaded.</div>)}
                  {selectedTracker.forms_file_path ? (
                    <a href={resolveFileUrl(selectedTracker.forms_file_path)} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-blue-600 hover:underline">View Forms</a>
                  ) : null}
                </div>
              </div>

              {isVerification && (
                <div className="space-y-4">
                  {isConfirmingReject ? (
                    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">Reject reason</label>
                      <textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700" placeholder="Please explain why this tracker is rejected." />
                      <div className="flex flex-wrap gap-3 sm:justify-end">
                        <button type="button" onClick={() => { setIsConfirmingReject(false); setRejectReason(''); }} className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
                        <button type="button" onClick={() => handleUpdateStatus(selectedTracker, 'declined', rejectReason.trim())} disabled={updatingId === selectedTracker.id || !rejectReason.trim()} className="inline-flex justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white">{updatingId === selectedTracker.id ? 'Processing...' : 'Confirm Reject'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button type="button" onClick={() => setIsConfirmingReject(true)} disabled={updatingId === selectedTracker.id} className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">Reject</button>
                      <button type="button" onClick={() => handleUpdateStatus(selectedTracker, 'approved')} disabled={updatingId === selectedTracker.id} className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">{updatingId === selectedTracker.id ? 'Processing...' : 'Approve'}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
