'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

type Parent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: number;
};

type Student = {
  id: string;
  name: string;
  email?: string;
  icNumber?: string;
  parentId: string;
  parentName: string;
  schoolType: string;
  grade: string;
  schoolName?: string;
  gender?: string;
  xp: number;
  level: number;
};

type UserTab = 'parents' | 'students';

export default function StaffUsersPage() {
  const [activeTab, setActiveTab] = useState<UserTab>('parents');
  const [query, setQuery] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Action states
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingUser, setEditingUser] = useState<{ type: 'parent' | 'student'; data: any } | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addUserType, setAddUserType] = useState<'parent' | 'student'>('parent');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for adding new user
  const [formData, setFormData] = useState<Record<string, any>>({});

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/users');
      const json = await res.json();
      if (json.success) {
        setParents(json.data.parents || []);
        setStudents(json.data.students || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat turun rekod pengguna', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleParents = useMemo(
    () =>
      parents.filter((parent) =>
        Object.values(parent).some((value) =>
          String(value).toLowerCase().includes(normalizedQuery),
        ),
      ),
    [parents, normalizedQuery],
  );
  const visibleStudents = useMemo(
    () =>
      students.filter((student) =>
        Object.values(student).some((value) =>
          String(value).toLowerCase().includes(normalizedQuery),
        ),
      ),
    [students, normalizedQuery],
  );
  const recordCount = activeTab === 'parents' ? visibleParents.length : visibleStudents.length;

  // Handle Add User
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        type: addUserType,
        ...formData,
      };

      const res = await fetch('/api/staff/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          addUserType === 'parent'
            ? 'Ibu bapa berjaya didaftarkan ke pangkalan data!'
            : 'Pelajar berjaya didaftarkan ke pangkalan data!',
        );
        setIsAddModalOpen(false);
        setFormData({});
        fetchUsers();
      } else {
        showToast(json.error || 'Gagal mendaftar pengguna', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditUser = (type: 'parent' | 'student', item: any) => {
    setEditingUser({ type, data: item });
    if (type === 'parent') {
      setEditFormData({
        fullName: item.name,
        email: item.email,
        phone: item.phone || '',
      });
    } else {
      setEditFormData({
        fullName: item.name,
        email: item.email || '',
        icNumber: item.icNumber || '',
        parentId: item.parentId || '',
        schoolType: item.schoolType || 'SK',
        grade: item.grade || '',
        gender: item.gender || 'Lelaki',
      });
    }
  };

  // Handle Edit User Submit
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingUser.type,
          id: editingUser.data.id,
          data: editFormData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          editingUser.type === 'parent'
            ? 'Maklumat ibu bapa berjaya dikemaskini!'
            : 'Maklumat pelajar berjaya dikemaskini!',
        );
        setEditingUser(null);
        setEditFormData({});
        setSelectedParent(null);
        setSelectedStudent(null);
        fetchUsers();
      } else {
        showToast(json.error || 'Gagal mengemaskini maklumat pengguna', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (type: 'parent' | 'student', id: string, name: string) => {
    if (!confirm(`Adakah anda pasti ingin memadamkan ${type === 'parent' ? 'penjaga' : 'pelajar'} "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/staff/users?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Pengguna berjaya dipadam dari pangkalan data!');
        setSelectedParent(null);
        setSelectedStudent(null);
        fetchUsers();
      } else {
        showToast(json.error || 'Gagal memadam pengguna', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat semasa memadam', 'error');
    }
  };

  return (
    <div className="staff-section-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`staff-toast ${toastMessage.type}`} role="alert">
          {toastMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <header className="staff-section-heading">
        <div>
          <span className="staff-section-eyebrow">PENGURUSAN PENGGUNA</span>
          <h1>Pengurusan pengguna</h1>
          <p>Semak maklumat ibu bapa dan pelajar yang berdaftar di Exploria.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchUsers}
            title="Muat semula data pangkalan data"
            className="staff-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
            type="button"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <Link className="staff-section-back" href="/staff">
            Dashboard <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </header>

      <section className="staff-section-workspace">
        <div className="staff-section-toolbar">
          <div className="staff-section-toolbar-title">
            <span className="staff-section-icon">
              {activeTab === 'parents'
                ? <UsersRound aria-hidden="true" size={19} />
                : <UserRound aria-hidden="true" size={19} />}
            </span>
            <div>
              <h2>{activeTab === 'parents' ? 'Senarai ibu bapa' : 'Senarai pelajar'}</h2>
              <p>{loading ? 'Memuatkan...' : `${recordCount} rekod dipaparkan`}</p>
            </div>
          </div>
          <button
            className="staff-section-add"
            onClick={() => {
              setFormData({});
              setAddUserType(activeTab === 'parents' ? 'parent' : 'student');
              setIsAddModalOpen(true);
            }}
            type="button"
          >
            <span>+</span>
            {activeTab === 'parents' ? 'Tambah ibu bapa' : 'Tambah pelajar'}
          </button>
        </div>

        <div className="staff-section-controls">
          <div aria-label="Jenis pengguna" className="staff-section-filters" role="tablist">
            <button
              aria-selected={activeTab === 'parents'}
              className={activeTab === 'parents' ? 'is-active' : ''}
              onClick={() => setActiveTab('parents')}
              role="tab"
              type="button"
            >
              Ibu bapa ({parents.length})
            </button>
            <button
              aria-selected={activeTab === 'students'}
              className={activeTab === 'students' ? 'is-active' : ''}
              onClick={() => setActiveTab('students')}
              role="tab"
              type="button"
            >
              Pelajar ({students.length})
            </button>
          </div>
          <label className="staff-section-search">
            <Search aria-hidden="true" size={16} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Cari ${activeTab === 'parents' ? 'ibu bapa' : 'pelajar'}...`}
              value={query}
            />
          </label>
        </div>

        <div aria-label={activeTab === 'parents' ? 'Senarai ibu bapa' : 'Senarai pelajar'} className="staff-section-table-wrap" role="tabpanel">
          {activeTab === 'parents' ? (
            <table className="staff-section-table">
              <thead>
                <tr>
                  <th>Nama ibu bapa</th>
                  <th>E-mel &amp; telefon</th>
                  <th>Bilangan anak</th>
                  <th aria-label="Tindakan">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {visibleParents.map((parent, index) => (
                  <tr key={parent.id}>
                    <td>
                      <div className="staff-section-record">
                        <span className={`staff-section-record-avatar staff-section-record-avatar-${index % 4}`}>
                          {parent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                        </span>
                        <span><strong>{parent.name}</strong><small>Penjaga berdaftar</small></span>
                      </div>
                    </td>
                    <td className="staff-section-value">{parent.email}<small className="staff-user-secondary">{parent.phone}</small></td>
                    <td className="staff-section-value">{parent.children} orang</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          aria-label={`Lihat ${parent.name}`}
                          className="staff-user-view"
                          onClick={() => setSelectedParent(parent)}
                          type="button"
                        >
                          Lihat
                        </button>
                        <button
                          aria-label={`Edit ${parent.name}`}
                          className="staff-user-view"
                          style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenEditUser('parent', parent)}
                          type="button"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          aria-label={`Padam ${parent.name}`}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          onClick={() => handleDeleteUser('parent', parent.id, parent.name)}
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="staff-section-table">
              <thead>
                <tr>
                  <th>Nama pelajar</th>
                  <th>Ibu bapa</th>
                  <th>Sekolah / darjah</th>
                  <th>E-mel pelajar</th>
                  <th aria-label="Tindakan">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>
                      <div className="staff-section-record">
                        <span className={`staff-section-record-avatar staff-section-record-avatar-${index % 4}`}>
                          {student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                        </span>
                        <span><strong>{student.name}</strong><small>Pelajar berdaftar</small></span>
                      </div>
                    </td>
                    <td className="staff-section-value">{student.parentName || '-'}</td>
                    <td className="staff-section-value">{student.schoolType}<small className="staff-user-secondary">{student.grade}</small></td>
                    <td className="staff-section-value">{student.email || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          aria-label={`Lihat ${student.name}`}
                          className="staff-user-view"
                          onClick={() => setSelectedStudent(student)}
                          type="button"
                        >
                          Lihat
                        </button>
                        <button
                          aria-label={`Edit ${student.name}`}
                          className="staff-user-view"
                          style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenEditUser('student', student)}
                          type="button"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          aria-label={`Padam ${student.name}`}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          onClick={() => handleDeleteUser('student', student.id, student.name)}
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {loading && <p className="staff-section-empty">Memuatkan rekod dari database...</p>}
          {!loading && recordCount === 0 && (
            <p className="staff-section-empty">Tiada rekod yang sepadan dengan carian ini.</p>
          )}
        </div>
      </section>

      {/* ─── MODAL: VIEW PARENT DETAILS ─────────────────────────────────── */}
      {selectedParent && (
        <div className="staff-modal-overlay" onClick={() => setSelectedParent(null)}>
          <div className="staff-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>
                <UsersRound size={18} style={{ color: '#db2777' }} />
                Profil Ibu Bapa / Penjaga
              </h3>
              <button className="staff-modal-close" onClick={() => setSelectedParent(null)} type="button">
                <X size={16} />
              </button>
            </div>
            <div className="staff-modal-body">
              <div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{selectedParent.name}</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>Akaun Penjaga Berdaftar</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Alamat E-mel
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {selectedParent.email}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Nombor Telefon
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {selectedParent.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Bilangan Anak
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {selectedParent.children} orang berdaftar
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      ID Profil (Supabase)
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#475569' }}>
                      {selectedParent.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="staff-modal-footer">
              <button
                className="staff-btn-secondary"
                onClick={() => setSelectedParent(null)}
                type="button"
              >
                Tutup
              </button>
              <button
                className="staff-btn-primary"
                onClick={() => {
                  const toEdit = selectedParent;
                  setSelectedParent(null);
                  handleOpenEditUser('parent', toEdit);
                }}
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Pencil size={14} /> Edit Profil
              </button>
              <button
                className="staff-btn-danger"
                onClick={() => handleDeleteUser('parent', selectedParent.id, selectedParent.name)}
                type="button"
              >
                Padam Penjaga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW STUDENT DETAILS ─────────────────────────────────── */}
      {selectedStudent && (
        <div className="staff-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="staff-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>
                <UserRound size={18} style={{ color: '#db2777' }} />
                Profil Pelajar
              </h3>
              <button className="staff-modal-close" onClick={() => setSelectedStudent(null)} type="button">
                <X size={16} />
              </button>
            </div>
            <div className="staff-modal-body">
              <div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{selectedStudent.name}</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                  {selectedStudent.grade} {selectedStudent.icNumber ? `· No. ID/IC: ${selectedStudent.icNumber}` : ''}
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Ibu Bapa / Penjaga
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {selectedStudent.parentName || '-'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Kategori Sekolah
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {selectedStudent.schoolType} ({selectedStudent.grade})
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Alamat E-mel Pelajar
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {selectedStudent.email || '-'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      ID Pelajar (Database)
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#475569' }}>
                      {selectedStudent.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="staff-modal-footer">
              <button className="staff-btn-secondary" onClick={() => setSelectedStudent(null)} type="button">
                Tutup
              </button>
              <button
                className="staff-btn-primary"
                onClick={() => {
                  const toEdit = selectedStudent;
                  setSelectedStudent(null);
                  handleOpenEditUser('student', toEdit);
                }}
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Pencil size={14} /> Edit Profil
              </button>
              <button
                className="staff-btn-danger"
                onClick={() => handleDeleteUser('student', selectedStudent.id, selectedStudent.name)}
                type="button"
              >
                Padam Pelajar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE USER (PARENT / STUDENT) ───────────────────────── */}
      {isAddModalOpen && (
        <div className="staff-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="staff-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>
                <Plus size={18} style={{ color: '#db2777' }} />
                {addUserType === 'parent' ? 'Daftar Ibu Bapa Baharu' : 'Daftar Pelajar Baharu'}
              </h3>
              <button className="staff-modal-close" onClick={() => setIsAddModalOpen(false)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit}>
              <div className="staff-modal-body">
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <button
                    type="button"
                    className={addUserType === 'parent' ? 'staff-btn-primary' : 'staff-btn-secondary'}
                    onClick={() => {
                      setAddUserType('parent');
                      setFormData({});
                    }}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Ibu Bapa / Penjaga
                  </button>
                  <button
                    type="button"
                    className={addUserType === 'student' ? 'staff-btn-primary' : 'staff-btn-secondary'}
                    onClick={() => {
                      setAddUserType('student');
                      setFormData({});
                    }}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Pelajar
                  </button>
                </div>

                {addUserType === 'parent' ? (
                  <>
                    <div className="staff-form-group">
                      <label>Nama Penuh Ibu Bapa</label>
                      <input
                        required
                        placeholder="Contoh: Siti Khadijah binti Wan"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Alamat E-mel</label>
                        <input
                          required
                          type="email"
                          placeholder="siti@example.com"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Nombor Telefon</label>
                        <input
                          placeholder="019-8765432"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Ibu Bapa / Penjaga</label>
                      <select
                        required
                        value={formData.parentId || ''}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      >
                        <option value="">-- Pilih Penjaga Pelajar --</option>
                        {parents.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="staff-form-group">
                      <label>Nama Penuh Pelajar</label>
                      <input
                        required
                        placeholder="Contoh: Danial bin Ahmad"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label>Alamat E-mel Pelajar</label>
                      <input
                        type="email"
                        placeholder="danial@exploria.my"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Kategori Sekolah</label>
                        <select
                          value={formData.schoolType || 'SK'}
                          onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                        >
                          <option value="SK">Sekolah Rendah (SK)</option>
                          <option value="SMK">Sekolah Menengah (SMK)</option>
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label>Darjah / Tingkatan</label>
                        <input
                          required
                          placeholder="Contoh: Darjah 3 / Tingkatan 1"
                          value={formData.grade || ''}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>No. ID / IC Anak <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          required
                          placeholder="Contoh: 150201-10-1234 atau ID12345"
                          value={formData.icNumber || ''}
                          onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Jantina</label>
                        <select
                          value={formData.gender || 'Lelaki'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Lelaki">Lelaki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="staff-modal-footer">
                <button className="staff-btn-secondary" onClick={() => setIsAddModalOpen(false)} type="button">
                  Batal
                </button>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Daftar ke Pangkalan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT USER (PARENT / STUDENT) ────────────────────────── */}
      {editingUser && (
        <div className="staff-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="staff-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>
                <Pencil size={18} style={{ color: '#db2777' }} />
                {editingUser.type === 'parent' ? 'Kemaskini Maklumat Penjaga' : 'Kemaskini Maklumat Pelajar'}
              </h3>
              <button className="staff-modal-close" onClick={() => setEditingUser(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit}>
              <div className="staff-modal-body">
                {editingUser.type === 'parent' ? (
                  <>
                    <div className="staff-form-group">
                      <label>Nama Penuh Ibu Bapa / Penjaga</label>
                      <input
                        required
                        placeholder="Contoh: Ahmad bin Razak"
                        value={editFormData.fullName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Alamat E-mel</label>
                        <input
                          required
                          type="email"
                          placeholder="ahmad@example.com"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Nombor Telefon</label>
                        <input
                          placeholder="012-3456789"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Ibu Bapa / Penjaga</label>
                      <select
                        required
                        value={editFormData.parentId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, parentId: e.target.value })}
                      >
                        <option value="">-- Pilih Penjaga --</option>
                        {parents.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="staff-form-group">
                      <label>Nama Penuh Pelajar</label>
                      <input
                        required
                        placeholder="Contoh: Danial bin Ahmad"
                        value={editFormData.fullName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label>Alamat E-mel Pelajar</label>
                      <input
                        type="email"
                        placeholder="danial@exploria.my"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Kategori Sekolah</label>
                        <select
                          value={editFormData.schoolType || 'SK'}
                          onChange={(e) => setEditFormData({ ...editFormData, schoolType: e.target.value })}
                        >
                          <option value="SK">Sekolah Rendah (SK)</option>
                          <option value="SMK">Sekolah Menengah (SMK)</option>
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label>Darjah / Tingkatan</label>
                        <input
                          required
                          placeholder="Contoh: Darjah 3 / Tingkatan 1"
                          value={editFormData.grade || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>No. ID / IC Anak</label>
                        <input
                          placeholder="Contoh: 150201-10-1234 atau ID12345"
                          value={editFormData.icNumber || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, icNumber: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Jantina</label>
                        <select
                          value={editFormData.gender || 'Lelaki'}
                          onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                        >
                          <option value="Lelaki">Lelaki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="staff-modal-footer">
                <button
                  className="staff-btn-secondary"
                  onClick={() => setEditingUser(null)}
                  type="button"
                >
                  Batal
                </button>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengemaskini...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
