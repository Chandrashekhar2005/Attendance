/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, UserPlus, MoreVertical, Trash2, Edit2, X, Check, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const Students: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useApp();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    grade: '',
    section: '',
  });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStudent(editingId, formData);
        toast.success('Student updated successfully');
        setEditingId(null);
      } else {
        await addStudent(formData);
        toast.success('Student added successfully');
        setIsAdding(false);
      }
      setFormData({ name: '', rollNumber: '', grade: '', section: '' });
    } catch (error) {
      toast.error('Failed to save student');
    }
  };

  const handleEdit = (student: any) => {
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      grade: student.grade,
      section: student.section,
    });
    setEditingId(student.id);
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteStudent(deletingId);
      toast.success('Student deleted successfully');
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const studentToDelete = students.find(s => s.id === deletingId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Students</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', rollNumber: '', grade: '', section: '' });
          }}
          className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-gray-100 dark:bg-neutral-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold">{student.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Roll: {student.rollNumber} • {student.grade}-{student.section}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(student)}
                  className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setDeletingId(student.id)}
                  className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Roll Number</label>
                  <input
                    required
                    type="text"
                    value={formData.rollNumber}
                    onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                    placeholder="A-101"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Grade / Class</label>
                    <input
                      required
                      type="text"
                      value={formData.grade}
                      onChange={e => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                      placeholder="10th"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Section</label>
                    <input
                      required
                      type="text"
                      value={formData.section}
                      onChange={e => setFormData({ ...formData, section: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                      placeholder="A"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none mt-4 flex items-center justify-center space-x-2"
                >
                  <Check size={20} />
                  <span>{editingId ? 'Update Student' : 'Save Student'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete Student?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">{studentToDelete?.name}</span>? This action cannot be undone.
                </p>
                <div className="flex w-full space-x-3">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 bg-gray-100 dark:bg-neutral-800 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
