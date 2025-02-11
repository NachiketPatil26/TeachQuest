
import { X } from 'lucide-react';

interface Block {
  number: number;
  invigilator?: string;
  capacity: number;
  location: string;
  status: string;
}

interface ExamDetailModalProps {
  exam: {
    id: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    blocks?: Block[];
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdateBlock: (blockNumber: number, blockData: Partial<Block>) => void;
}

export default function ExamDetailModal({ exam, isOpen, onClose, onUpdateBlock }: ExamDetailModalProps) {
  if (!isOpen) return null;

  const blocks = exam.blocks || [];

  const handleBlockUpdate = async (blockNumber: number, field: keyof Block, value: string | number) => {
    try {
      await onUpdateBlock(blockNumber, { [field]: value });
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

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
            <p className="font-medium">{exam.date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{exam.startTime} - {exam.endTime}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Blocks</h3>
            <button
              onClick={() => onUpdateBlock(blocks.length + 1, { number: blocks.length + 1, capacity: 0, location: '', status: 'pending' })}
              className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] text-sm"
            >
              Add Block
            </button>
          </div>
          {[1, 2, 3, 4].map((blockNumber) => {
            const block = blocks.find(b => b.number === blockNumber) || {
              number: blockNumber,
              capacity: 0,
              location: '',
              status: 'pending'
            };

            return (
              <div key={blockNumber} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Block {blockNumber}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={block.capacity}
                      onChange={(e) => handleBlockUpdate(blockNumber, 'capacity', parseInt(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={block.location}
                      onChange={(e) => handleBlockUpdate(blockNumber, 'location', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-500 mb-1">Status</label>
                    <select
                      value={block.status}
                      onChange={(e) => handleBlockUpdate(blockNumber, 'status', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}