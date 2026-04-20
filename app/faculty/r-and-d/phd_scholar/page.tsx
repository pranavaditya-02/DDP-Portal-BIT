"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";

const DEPARTMENTS = [
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

const VERIFICATION = ["Initiated", "Approved", "Rejected"];

export default function PhdScholarPage() {
  const router = useRouter();
  const [faculty, setFaculty] = useState("");
  const [supervisorType, setSupervisorType] = useState("BIT");
  const [supervisorInfo, setSupervisorInfo] = useState("");
  const [supervisorRecognitionNo, setSupervisorRecognitionNo] = useState("");
  const [scholarType, setScholarType] = useState("BIT");
  const [scholarInfo, setScholarInfo] = useState("");
  const [scholarRegNo, setScholarRegNo] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [modeOfStudy, setModeOfStudy] = useState("Full Time");
  const [registrationDate, setRegistrationDate] = useState("");
  const [areaOfResearch, setAreaOfResearch] = useState("");
  const [tentativeTitle, setTentativeTitle] = useState("");
  const [provisionalOrder, setProvisionalOrder] = useState<File | null>(null);
  const [jointSupervisor, setJointSupervisor] = useState("No");
  const [jointSupervisorInfo, setJointSupervisorInfo] = useState("");
  const [courseWorkCompleted, setCourseWorkCompleted] = useState("No");
  const [courseListFile, setCourseListFile] = useState<File | null>(null);
  const [comprehensiveExamDate, setComprehensiveExamDate] = useState("");
  const [registrationConfirmedDate, setRegistrationConfirmedDate] = useState("");
  const [synopsisSubmitted, setSynopsisSubmitted] = useState("No");
  const [synopsisTitle, setSynopsisTitle] = useState("");
  const [synopsisDate, setSynopsisDate] = useState("");
  const [thesisSubmitted, setThesisSubmitted] = useState("No");
  const [thesisTitle, setThesisTitle] = useState("");
  const [vivaCompleted, setVivaCompleted] = useState("No");
  const [vivaDateTime, setVivaDateTime] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [verification, setVerification] = useState(VERIFICATION[0]);

  const onFile = (setter: (f: File | null) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setter(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string,string> = {};
    if (!faculty.trim()) nextErrors.faculty = 'Faculty is required';
    if (!scholarInfo.trim()) nextErrors.scholarInfo = 'Scholar information is required';
    if (Object.keys(nextErrors).length) {
      setLocalErrors(nextErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLocalErrors({});
    const fd = new FormData();
    fd.append('faculty', faculty);
    fd.append('supervisorType', supervisorType);
    fd.append('supervisorInfo', supervisorInfo);
    fd.append('supervisorRecognitionNo', supervisorRecognitionNo);
    fd.append('scholarType', scholarType);
    fd.append('scholarInfo', scholarInfo);
    fd.append('scholarRegNo', scholarRegNo);
    fd.append('universityName', universityName);
    fd.append('modeOfStudy', modeOfStudy);
    fd.append('registrationDate', registrationDate);
    fd.append('areaOfResearch', areaOfResearch);
    fd.append('tentativeTitle', tentativeTitle);
    if (provisionalOrder) fd.append('provisionalOrder', provisionalOrder);
    fd.append('jointSupervisor', jointSupervisor);
    fd.append('jointSupervisorInfo', jointSupervisorInfo);
    fd.append('courseWorkCompleted', courseWorkCompleted);
    if (courseListFile) fd.append('courseListFile', courseListFile);
    fd.append('comprehensiveExamDate', comprehensiveExamDate);
    fd.append('registrationConfirmedDate', registrationConfirmedDate);
    fd.append('synopsisSubmitted', synopsisSubmitted);
    fd.append('synopsisTitle', synopsisTitle);
    fd.append('synopsisDate', synopsisDate);
    fd.append('thesisSubmitted', thesisSubmitted);
    fd.append('thesisTitle', thesisTitle);
    fd.append('vivaCompleted', vivaCompleted);
    fd.append('vivaDateTime', vivaDateTime);
    if (photoFile) fd.append('photoFile', photoFile);
    fd.append('department', department);
    fd.append('articlesCount', String(articlesCount));
    fd.append('verification', verification);

    try {
      const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backend}/api/phd-scholars`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('submit failed');
      router.push('/faculty/r-and-d');
    } catch (err) {
      console.error(err);
      alert('Failed to submit Ph.D. scholar details');
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
          <h1 className="text-2xl font-bold">Ph.D Scholar Details</h1>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Faculty</label>
              <input value={faculty} onChange={(e) => setFaculty(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              {localErrors.faculty && <p className="mt-1 text-sm text-red-600">{localErrors.faculty}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Supervisor Type</label>
                <select value={supervisorType} onChange={(e) => setSupervisorType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option>BIT</option>
                  <option>External</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Supervisor Recognition No.</label>
                <input value={supervisorRecognitionNo} onChange={(e) => setSupervisorRecognitionNo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Supervisor Information</label>
              <textarea value={supervisorInfo} onChange={(e) => setSupervisorInfo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Scholar Type</label>
              <select value={scholarType} onChange={(e) => setScholarType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option>BIT</option>
                <option>External</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Scholar Information</label>
              <textarea value={scholarInfo} onChange={(e) => setScholarInfo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              {localErrors.scholarInfo && <p className="mt-1 text-sm text-red-600">{localErrors.scholarInfo}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Scholar Registration No.</label>
                <input value={scholarRegNo} onChange={(e) => setScholarRegNo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">University Name</label>
                <input value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Mode of Study</label>
                <select value={modeOfStudy} onChange={(e) => setModeOfStudy(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option>Full Time</option>
                  <option>Part Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Ph.D. Registration</label>
                <input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Area of Research</label>
              <input value={areaOfResearch} onChange={(e) => setAreaOfResearch(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Tentative Title of Research</label>
              <input value={tentativeTitle} onChange={(e) => setTentativeTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Provisional Registration Order (PDF)</label>
              <input type="file" accept="application/pdf" onChange={onFile(setProvisionalOrder)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Does the research have Joint Supervisor?</label>
                <select value={jointSupervisor} onChange={(e) => setJointSupervisor(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Joint Supervisor Info</label>
                <input value={jointSupervisorInfo} onChange={(e) => setJointSupervisorInfo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Course Work Completed</label>
              <select value={courseWorkCompleted} onChange={(e) => setCourseWorkCompleted(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">List of courses (scanned pdf)</label>
              <input type="file" accept="application/pdf" onChange={onFile(setCourseListFile)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Comprehensive Exam</label>
                <input type="date" value={comprehensiveExamDate} onChange={(e) => setComprehensiveExamDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Registration Confirmed Date</label>
                <input type="date" value={registrationConfirmedDate} onChange={(e) => setRegistrationConfirmedDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Synopsis Submitted</label>
              <select value={synopsisSubmitted} onChange={(e) => setSynopsisSubmitted(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Synopsis Title</label>
                <input value={synopsisTitle} onChange={(e) => setSynopsisTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Synopsis Submission</label>
                <input type="date" value={synopsisDate} onChange={(e) => setSynopsisDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Thesis Submitted</label>
              <select value={thesisSubmitted} onChange={(e) => setThesisSubmitted(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Thesis Title</label>
              <input value={thesisTitle} onChange={(e) => setThesisTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Viva Voce Completed</label>
              <select value={vivaCompleted} onChange={(e) => setVivaCompleted(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Date & time of Viva Voce</label>
              <input type="datetime-local" value={vivaDateTime} onChange={(e) => setVivaDateTime(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Photo of the Scholar (JPEG)</label>
              <input type="file" accept="image/*" onChange={onFile(setPhotoFile)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Scholar Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">No. of articles published in AU Annexure</label>
              <input type="number" min={0} value={articlesCount} onChange={(e) => setArticlesCount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
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
                <Save className="h-4 w-4 mr-2" /> Submit Scholar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
