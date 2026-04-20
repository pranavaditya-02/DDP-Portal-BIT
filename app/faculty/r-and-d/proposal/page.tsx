"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";

const FUNDING_AGENCIES = [
  "Department of Science and Technology (DST)",
  "Science and Engineering Research Board (SERB)",
  "Council of Scientific and Industrial Research (CSIR)",
  "Department of Biotechnology (DBT)",
  "University Grants Commission (UGC)",
  "All India Council for Technical Education (AICTE)",
  "Others",
];

const SDGS = [
  "SDG 1 – No Poverty",
  "SDG 2 – Zero Hunger",
  "SDG 3 – Good Health and Well-being",
  "SDG 4 – Quality Education",
  "SDG 5 – Gender Equality",
  "SDG 6 – Clean Water and Sanitation",
  "SDG 7 – Affordable and Clean Energy",
  "SDG 8 – Decent Work and Economic Growth",
  "SDG 9 – Industry, Innovation and Infrastructure",
  "SDG 10 – Reduced Inequalities",
  "SDG 11 – Sustainable Cities and Communities",
  "SDG 12 – Responsible Consumption and Production",
  "SDG 13 – Climate Action",
  "SDG 14 – Life Below Water",
  "SDG 15 – Life on Land",
  "SDG 16 – Peace, Justice and Strong Institutions",
  "SDG 17 – Partnerships for the Goals",
];

const VERIFICATION = ["Initiated", "Approved", "Rejected"];

export default function FundingProposalPage() {
  const router = useRouter();
  const [industryInvolved, setIndustryInvolved] = useState<string>("No");
  const [role, setRole] = useState<string>("PI");
  const [fundingAgency, setFundingAgency] = useState(FUNDING_AGENCIES[0]);
  const [fundingScheme, setFundingScheme] = useState("");
  const [grantType, setGrantType] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalArea, setProposalArea] = useState<string[]>([]);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [durationYears, setDurationYears] = useState<number>(1);
  const [collaboration, setCollaboration] = useState<string>("NA");
  const [coPIs, setCoPIs] = useState<string[]>([]);
  const [submissionDate, setSubmissionDate] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [verification, setVerification] = useState(VERIFICATION[0]);

  const toggleProposalArea = (value: string) => {
    setProposalArea((prev) => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  };

  const addCoPI = () => setCoPIs((p) => [...p, ""]);
  const updateCoPI = (idx: number, val: string) => setCoPIs((p) => p.map((v,i) => i===idx?val:v));
  const removeCoPI = (idx: number) => setCoPIs((p) => p.filter((_,i)=>i!==idx));

  const handleProof = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setProofFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string,string> = {};
    if (!proposalTitle.trim()) nextErrors.proposalTitle = 'Proposal title is required';
    if (!requestedAmount.trim()) nextErrors.requestedAmount = 'Requested amount is required';
    if (Object.keys(nextErrors).length) {
      setLocalErrors(nextErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLocalErrors({});
    const fd = new FormData();
    fd.append('industryInvolved', industryInvolved);
    fd.append('role', role);
    fd.append('fundingAgency', fundingAgency);
    fd.append('fundingScheme', fundingScheme);
    fd.append('grantType', grantType);
    fd.append('proposalTitle', proposalTitle);
    proposalArea.forEach((a) => fd.append('proposalArea[]', a));
    fd.append('requestedAmount', requestedAmount);
    fd.append('durationYears', String(durationYears));
    fd.append('collaboration', collaboration);
    coPIs.forEach((c, i) => fd.append(`coPI_${i+1}`, String(c)));
    fd.append('submissionDate', submissionDate);
    if (proofFile) fd.append('proof', proofFile);
    fd.append('verification', verification);

    try {
      const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backend}/api/funding-proposals`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('submit failed');
      router.push('/faculty/r-and-d');
    } catch (err) {
      console.error(err);
      alert('Failed to submit proposal');
    }
  };

  const [localErrors, setLocalErrors] = useState<Record<string,string>>({});

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold">Funding Proposal (Applied / Sanctioned)</h1>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block text-sm font-medium text-slate-700">Industry Involved</label>
              <div className="col-span-2">
                <select value={industryInvolved} onChange={(e) => setIndustryInvolved(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option>PI</option>
                  <option>Co-ordinator</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Funding Agency</label>
                <select value={fundingAgency} onChange={(e) => setFundingAgency(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  {FUNDING_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Funding Scheme / Type of Grant</label>
              <input value={fundingScheme} onChange={(e) => setFundingScheme(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Proposal Title</label>
              <input value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              {localErrors.proposalTitle && <p className="mt-1 text-sm text-red-600">{localErrors.proposalTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Proposal Area (map to SDGs)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-auto border p-2 rounded">
                {SDGS.map(s => (
                  <label key={s} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={proposalArea.includes(s)} onChange={() => toggleProposalArea(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Requested Funding Amount</label>
                <input value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                {localErrors.requestedAmount && <p className="mt-1 text-sm text-red-600">{localErrors.requestedAmount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Project Duration (Years)</label>
                <input type="number" min={0} value={durationYears} onChange={(e) => setDurationYears(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Collaboration</label>
                <select value={collaboration} onChange={(e) => setCollaboration(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option>Academic</option>
                  <option>Industry</option>
                  <option>Foreign University</option>
                  <option>NA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Co-PI Involved</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={addCoPI} className="px-3 py-2 border rounded">Add Co-PI</button>
              </div>
              <div className="space-y-2">
                {coPIs.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={c} onChange={(e) => updateCoPI(i, e.target.value)} className="flex-1 px-3 py-2 border rounded-md" placeholder={`Co-PI ${i+1} details`} />
                    <button type="button" onClick={() => removeCoPI(i)} className="px-3 py-2 border rounded text-red-600">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Submission Date</label>
                <input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Submitted Document Proof (PDF)</label>
                <input type="file" accept="application/pdf" onChange={handleProof} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">R & D Verification</label>
              <select value={verification} onChange={(e) => setVerification(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                {VERIFICATION.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md border">Cancel</button>
              <button type="submit" className="inline-flex items-center px-4 py-2 rounded-md bg-[#2572ed] text-white">
                <Save className="h-4 w-4 mr-2" /> Submit Proposal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
