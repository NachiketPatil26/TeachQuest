import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ExamFormProps {
  onSubmit: (examData: ExamFormData) => void;
  initialData?: ExamFormData;
  isEditing?: boolean;
}

interface ExamFormData {
  subject: string;
  date: string;
  startTime: string;
  duration: number;
  venue: string;
  block: string;
  maxStudents: number;
}

export default function ExamForm({ onSubmit, initialData, isEditing = false }: ExamFormProps) {
  const [formData, setFormData] = useState<ExamFormData>(initialData || {
    subject: '',
    date: '',
    startTime: '',
    duration: 180, // Default 3 hours
    venue: '',
    block: '',
    maxStudents: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    onSubmit({ ...formData});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'maxStudents' ? parseInt(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="subject"
              id="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              name="startTime"
              id="startTime"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="duration"
              id="duration"
              required
              min="30"
              max="360"
              value={formData.duration}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
            Venue
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="venue"
              id="venue"
              required
              value={formData.venue}
              onChange={handleChange}
              className="focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Block */}
        <div>
          <label htmlFor="block" className="block text-sm font-medium text-gray-700">
            Block
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="block"
              id="block"
              required
              value={formData.block}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Max Students */}
        <div>
          <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">
            Maximum Students
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="maxStudents"
              id="maxStudents"
              required
              min="1"
              value={formData.maxStudents}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
        >
          {isEditing ? 'Update Exam' : 'Create Exam'}
        </button>
      </div>
    </form>
  );
}