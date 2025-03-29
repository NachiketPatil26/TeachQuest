
import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { addBlock, deleteBlock } from '../../services/api';

interface Block {
  number: number;
  capacity: number;
  location: string;
  invigilator?: string | null;
}

interface ExamDetailModalProps {
  exam: {
    _id: string;
    subject: string;
    examName: string;
    date: string;
    startTime: string;
    endTime: string;
    allocatedTeachers: string[];
    blocks?: Block[];
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ExamDetailModal({ exam: initialExam, isOpen, onClose, onUpdate }: ExamDetailModalProps) {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [exam, setExam] = useState(initialExam);

  // Update exam state when initialExam changes
  useEffect(() => {
    setExam(initialExam);
  }, [initialExam]);
  const [blockData, setBlockData] = useState<Omit<Block, 'invigilator'>>({ 
    number: 1,
    capacity: 0,
    location: '',
  });

  const handleAddBlock = async () => {
    try {
      const updatedExam = await addBlock(exam._id, blockData);
      setExam(updatedExam);
      setShowBlockForm(false);
      setBlockData({ number: 1, capacity: 20, location: 'Old Building' });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add block:', error);
    }
  };

  const handleDeleteBlock = async (blockNumber: number) => {
    try {
      const updatedExam = await deleteBlock(exam._id, blockNumber);
      setExam(updatedExam);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Exam Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium">{exam.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{exam.startTime} - {exam.endTime}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Blocks</h3>
            <button
              onClick={() => setShowBlockForm(true)}
              className="flex items-center gap-2 px-3 py-1 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] text-sm"
            >
              <Plus className="h-4 w-4" /> Add Block
            </button>
          </div>

          {showBlockForm && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                  <input
                    type="number"
                    value={blockData.number}
                    onChange={(e) => setBlockData({ ...blockData, number: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1101, 1103, 1109, 809, 909, 908, 307, 305, 303].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBlockData({ ...blockData, number: num })}
                        className="px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        type="button"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={blockData.capacity}
                    onChange={(e) => setBlockData({ ...blockData, capacity: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={blockData.location}
                    onChange={(e) => setBlockData({ ...blockData, location: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBlock}
                  className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] text-sm"
                >
                  Add Block
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {exam.blocks?.map((block) => (
              <div key={block.number} className="border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Block Number</p>
                    <p className="font-medium">{block.number}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteBlock(block.number)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-medium">{block.capacity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{block.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
