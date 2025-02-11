import React, { useState } from 'react';
import { FileText, Send } from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState({
    date: '',
    subject: '',
    room: '',
    comments: '',
    issues: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle report submission logic here
    console.log('Submitting report:', report);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <FileText className="w-8 h-8 text-[#9FC0AE] mr-4" />
          <h1 className="text-2xl font-bold">Submit Duty Report</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={report.date}
                onChange={(e) => setReport({ ...report, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                id="subject"
                value={report.subject}
                onChange={(e) => setReport({ ...report, subject: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                required
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700">Room</label>
              <input
                type="text"
                id="room"
                value={report.room}
                onChange={(e) => setReport({ ...report, room: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                required
              />
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
              <textarea
                id="comments"
                rows={4}
                value={report.comments}
                onChange={(e) => setReport({ ...report, comments: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="issues"
                checked={report.issues}
                onChange={(e) => setReport({ ...report, issues: e.target.checked })}
                className="h-4 w-4 text-[#9FC0AE] focus:ring-[#9FC0AE] border-gray-300 rounded"
              />
              <label htmlFor="issues" className="ml-2 block text-sm text-gray-700">
                Any issues or incidents to report?
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}