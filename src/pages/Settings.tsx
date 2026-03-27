/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Bell, Shield, Info, Trash2, X, Calendar, Check, Camera, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode, teacher, updateTeacher, deleteAttendanceByDate, attendance } = useApp();
  const [deleteDate, setDeleteDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deletedCount, setDeletedCount] = useState(0);
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | 'success' | 'confirm' | 'no-data' | 'remove-photo' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTeacher({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updateTeacher({ photoUrl: undefined });
    setActiveModal(null);
  };

  const handleDeleteByDate = () => {
    const countBefore = attendance.filter(a => a.date === deleteDate).length;
    
    if (countBefore === 0) {
      setActiveModal('no-data');
      return;
    }

    setDeletedCount(countBefore);
    setActiveModal('confirm');
  };

  const confirmDelete = () => {
    deleteAttendanceByDate(deleteDate);
    setActiveModal('success');
  };

  const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Preferences</h3>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="font-bold text-sm">Dark Mode</p>
                <p className="text-[10px] text-gray-500">Adjust the app's appearance</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Notifications</p>
                <p className="text-[10px] text-gray-500">Attendance reminders</p>
              </div>
            </div>
            <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
              <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Account Info</h3>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button 
                onClick={() => teacher?.photoUrl ? setActiveModal('remove-photo') : fileInputRef.current?.click()}
                className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold overflow-hidden hover:opacity-90 transition-opacity"
              >
                {teacher?.photoUrl ? (
                  <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" />
                ) : (
                  teacher?.name.charAt(0)
                )}
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Camera size={14} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div>
              <p className="font-bold">{teacher?.name}</p>
              <p className="text-xs text-gray-500">{teacher?.email}</p>
              <p className="text-xs text-indigo-600 font-semibold mt-1">{teacher?.schoolName}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Data Management</h3>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-sm">
          <button 
            onClick={() => setActiveModal('privacy')}
            className="w-full p-4 border-b border-gray-50 dark:border-neutral-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-gray-400" />
              <span className="text-sm font-medium">Privacy Policy</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          
          <button 
            onClick={() => setActiveModal('about')}
            className="w-full p-4 border-b border-gray-50 dark:border-neutral-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Info size={20} className="text-gray-400" />
              <span className="text-sm font-medium">About Attendly</span>
            </div>
            <span className="text-xs text-gray-400">v1.0.0</span>
          </button>

          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-3 text-gray-400 mb-1">
              <Trash2 size={20} />
              <span className="text-sm font-bold">Delete Data by Date</span>
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={deleteDate}
                  onChange={(e) => setDeleteDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                onClick={handleDeleteByDate}
                className="bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors active:scale-95"
              >
                Delete
              </button>
            </div>
            <p className="text-[10px] text-gray-500 italic">This will permanently remove all attendance records for the selected date.</p>
          </div>
        </div>
      </section>

      <div className="text-center py-4">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Made with ❤️ for Teachers</p>
      </div>

      <AnimatePresence>
        {activeModal === 'privacy' && (
          <Modal title="Privacy Policy" onClose={() => setActiveModal(null)}>
            <p>At Attendly, we take your privacy seriously. This application is designed to work entirely offline, meaning your data stays on your device.</p>
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Data Collection</h4>
            <p>We do not collect any personal information on our servers. All student names, roll numbers, and attendance records are stored locally in your browser's storage.</p>
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Security</h4>
            <p>Since data is stored locally, its security depends on your device's security. We recommend using a password-protected device.</p>
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Third-Party Services</h4>
            <p>Attendly does not share your data with any third-party services. The app is a standalone utility for teachers.</p>
          </Modal>
        )}

        {activeModal === 'about' && (
          <Modal title="About Attendly" onClose={() => setActiveModal(null)}>
            <p>Attendly is a modern, lightweight attendance management system built specifically for teachers who want a simple, fast, and reliable way to track student presence.</p>
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Key Features</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Quick attendance marking with one-tap actions.</li>
              <li>Comprehensive student management.</li>
              <li>Visual reports and monthly statistics.</li>
              <li>PDF export for easy sharing and record-keeping.</li>
              <li>Dark mode support for comfortable use in any lighting.</li>
            </ul>
            <p className="pt-2">Version: 1.0.0</p>
            <p>Developed with a focus on speed and user experience.</p>
          </Modal>
        )}

        {activeModal === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 w-full max-w-xs rounded-3xl p-8 shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Data Deleted</h3>
              <p className="text-sm text-gray-500 mb-6">{deletedCount} attendance records for {deleteDate} have been removed successfully.</p>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'confirm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 w-full max-w-xs rounded-3xl p-8 shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-500 mb-6">You are about to delete {deletedCount} attendance records for {deleteDate}. This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'no-data' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 w-full max-w-xs rounded-3xl p-8 shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Info size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No Records Found</h3>
              <p className="text-sm text-gray-500 mb-6">There are no attendance records to delete for {deleteDate}.</p>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
        {activeModal === 'remove-photo' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 w-full max-w-xs rounded-3xl p-8 shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Remove Photo?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove your profile photo?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
