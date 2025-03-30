import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { Edit, Trash2, Plus, X, Search } from 'lucide-react';
import { getTeachers, getTeacherAllocations, createTeacher, updateTeacher, deleteTeacher } from '../../services/api';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  subjects: string[];
  availability?: string[];
  password: string;
  branch: string;
}

interface TeacherAllocation {
  _id: string;
  examName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  blocks: Array<{
    number: number;
    location: string;
    invigilator: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

interface TeacherWithAllocations extends Teacher {
  allocations: TeacherAllocation[];
}

export default function TeacherInfoPage() {
  const { branch } = useParams<{ branch: string }>();
  // const navigate = useNavigate();
  
  const [teachers, setTeachers] = useState<TeacherWithAllocations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  
  // Confirmation modal for delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  // Allocation details modal
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [currentAllocations, setCurrentAllocations] = useState<TeacherAllocation[]>([]);
  const [currentTeacherName, setCurrentTeacherName] = useState('');
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');

  useEffect(() => {
    fetchTeachers();
  }, [branch]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all teachers
      console.log('Fetching teachers data...');
      const teachersData = await getTeachers();
      console.log('Teachers data received:', teachersData);
      
      if (!teachersData || !Array.isArray(teachersData)) {
        throw new Error('Invalid teachers data received');
      }
      
      // Filter teachers by branch if branch is specified
      console.log('Filtering teachers by branch:', branch);
      const filteredTeachers = branch 
        ? teachersData.filter(teacher => {
            const matches = (teacher.department === branch) || 
              (teacher.branch && teacher.branch.toString() === branch);
            if (!matches) {
              console.log(`Teacher ${teacher.name} does not match branch ${branch}. Department: ${teacher.department}, Branch: ${teacher.branch}`);
            }
            return matches;
          })
        : teachersData;
      
      console.log('Filtered teachers count:', filteredTeachers.length);
      
      // Fetch allocations for each teacher
      console.log('Fetching allocations for teachers...');
      const teachersWithAllocations = await Promise.all(
        filteredTeachers.map(async (teacher) => {
          try {
            const allocations = await getTeacherAllocations(teacher._id);
            return { ...teacher, allocations };
          } catch (error) {
            console.error(`Error fetching allocations for teacher ${teacher._id}:`, error);
            return { ...teacher, allocations: [] };
          }
        })
      );
      
      console.log('Setting teachers state with data:', teachersWithAllocations);
      setTeachers(teachersWithAllocations);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load teachers';
      console.error('Error fetching teachers:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = () => {
    setCurrentTeacher({
      _id: '',
      name: '',
      email: '',
      phone: '',
      department: branch || '',
      subjects: [],
      password: '',
      branch: branch || '',
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeacherToDelete(teacherId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    
    try {
      // API call to delete teacher
      await deleteTeacher(teacherToDelete);
      
      // Remove the deleted teacher from the state
      setTeachers(teachers.filter(teacher => teacher._id !== teacherToDelete));
      setShowDeleteConfirm(false);
      setTeacherToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete teacher';
      console.error('Error deleting teacher:', error);
      setError(errorMessage);
    }
  };

  const handleSaveTeacher = async (formData: Partial<Teacher>) => {
    try {
      if (modalMode === 'create') {
        // API call to create teacher
        const newTeacherData = {
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          department: formData.department || '',
          subjects: formData.subjects || [],
          password: formData.password || '',
          branch: formData.department || '',
        };
        
        const createdTeacher = await createTeacher(newTeacherData);
        
        // Add the new teacher with empty allocations to the state
        const newTeacherWithAllocations = {
          ...createdTeacher,
          allocations: [],
        };
        
        setTeachers([...teachers, newTeacherWithAllocations]);
      } else if (modalMode === 'edit' && currentTeacher) {
        // API call to update teacher
        const updatedTeacherData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          subjects: formData.subjects,
        };
        
        await updateTeacher(currentTeacher._id, updatedTeacherData);
        
        // Update the teacher in the state
        setTeachers(teachers.map(teacher => 
          teacher._id === currentTeacher._id 
            ? { ...teacher, ...formData }
            : teacher
        ));
      }
      
      setShowModal(false);
      setCurrentTeacher(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save teacher';
      console.error('Error saving teacher:', error);
      setError(errorMessage);
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.department && teacher.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Information {branch && `- ${branch}`}</h1>
        <button
          onClick={handleCreateTeacher}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
        >
          <Plus size={16} className="mr-2" />
          Add Teacher
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search teachers by name, email, or department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subjects
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allocations
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                    {teacher.phone && <div className="text-sm text-gray-500">{teacher.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((subject, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No subjects</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {teacher.allocations && teacher.allocations.length > 0 ? (
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{teacher.allocations.length}</span> allocations
                        <button 
                          onClick={() => {
                            setCurrentAllocations(teacher.allocations);
                            setCurrentTeacherName(teacher.name);
                            setCurrentTeacherId(teacher._id);
                            setShowAllocationModal(true);
                          }}
                          className="ml-2 text-[#9FC0AE] hover:text-[#8BAF9A] text-xs"
                        >
                          View details
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No allocations</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditTeacher(teacher)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this teacher? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTeacher}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Teacher Modal */}
      {showModal && currentTeacher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === 'create' ? 'Add New Teacher' : 'Edit Teacher'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveTeacher({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                department: formData.get('department') as string,
                subjects: (formData.get('subjects') as string).split(',').map(s => s.trim()).filter(Boolean),
                password: formData.get('password') as string,
              });
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={currentTeacher?.name || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={currentTeacher?.email || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
                  />
                </div>
                {modalMode === 'create' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={currentTeacher?.phone || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    defaultValue={currentTeacher?.department || branch || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
                  />
                </div>
                <div>
                  <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">Subjects (comma separated)</label>
                  <input
                    type="text"
                    id="subjects"
                    name="subjects"
                    defaultValue={currentTeacher?.subjects?.join(', ') || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE]"
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  {modalMode === 'create' ? 'Add Teacher' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Allocation Details Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Allocations for {currentTeacherName}
              </h3>
              <button onClick={() => setShowAllocationModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {currentAllocations.length === 0 ? (
                <p className="text-gray-500">No allocations found for this teacher.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exam Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Block
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentAllocations.map((allocation) => {
                        // Format date string to a readable format
                        const formattedDate = new Date(allocation.date).toLocaleDateString();
                        
                        return (
                          <tr key={allocation._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {allocation.examName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {allocation.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formattedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {allocation.startTime} - {allocation.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(() => {
                                const assignedBlock = allocation.blocks?.find(block => 
                                  block.invigilator?._id === currentTeacherId
                                );
                                return assignedBlock ? (
                                  <span className="bg-[#F0F7F4] px-2 py-1 rounded-md text-sm font-medium text-[#2C3E50] border border-[#D4ECDD]">
                                    Block {assignedBlock.number}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Not assigned</span>
                                );
                              })()}
                              {(() => {
                                const assignedBlock = allocation.blocks?.find(block => 
                                  block.invigilator?._id === currentTeacherId
                                );
                                return assignedBlock?.location && (
                                  <span className="ml-2 text-gray-600">
                                    ({assignedBlock.location})
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setShowAllocationModal(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}