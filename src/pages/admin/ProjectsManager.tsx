import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { ApiProject, ProjectCategory, ProjectGalleryImage, MediaAsset, PublishState } from '@/lib/types';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  FolderGit2,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Star,
  Upload,
  Calendar,
  MapPin,
  Building,
  Loader2,
  X,
  Image as ImageIcon,
  Images,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function ProjectsManager() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<ApiProject> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Multiline fields for scope and specs
  const [scopeText, setScopeText] = useState('');
  const [specsText, setSpecsText] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ApiProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'cover' | 'gallery'>('cover');

  const handleAddGalleryPhoto = (url: string, asset?: MediaAsset) => {
    setEditingProject((prev) => {
      if (!prev) return prev;
      const currentGallery = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
      const newPhoto: ProjectGalleryImage = {
        image: url,
        caption: asset?.title || '',
        alt_text: asset?.alt_text || '',
        display_order: currentGallery.length,
      };
      return {
        ...prev,
        gallery: [...currentGallery, newPhoto],
      };
    });
  };

  const handleUpdateGalleryPhoto = (index: number, updates: Partial<ProjectGalleryImage>) => {
    setEditingProject((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
      if (current[index]) {
        current[index] = { ...current[index], ...updates };
      }
      return { ...prev, gallery: current };
    });
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setEditingProject((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
      current.splice(index, 1);
      return { ...prev, gallery: current };
    });
  };

  const handleSetGalleryPhotoAsCover = (index: number) => {
    setEditingProject((prev) => {
      if (!prev || !prev.gallery) return prev;
      const photo = prev.gallery[index];
      if (!photo) return prev;
      return {
        ...prev,
        image: photo.image,
      };
    });
  };

  const handleMoveGalleryPhoto = (index: number, direction: 'up' | 'down') => {
    setEditingProject((prev) => {
      if (!prev || !prev.gallery) return prev;
      const list = [...prev.gallery];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      list.forEach((item, idx) => {
        item.display_order = idx;
      });
      return { ...prev, gallery: list };
    });
  };

  const fetchProjectsAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, catRes] = await Promise.all([
        api.get<unknown>('/cms/projects/'),
        api.get<unknown>('/cms/project-categories/'),
      ]);
      setProjects(unwrapList<ApiProject>(projRes));
      setCategories(unwrapList<ProjectCategory>(catRes));
    } catch (err) {
      error((err as Error).message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchProjectsAndCategories();
  }, [fetchProjectsAndCategories]);

  const handleSlugify = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenAdd = () => {
    setEditingProject({
      name: '',
      slug: '',
      category: categories[0]?.id || null,
      category_name: categories[0]?.name || 'Building',
      client: '',
      location: 'Adama, Ethiopia',
      summary: '',
      overview: '',
      project_status: 'Completed',
      is_featured: false,
      display_order: (projects.length + 1) * 10,
      status: 'published',
      image: null,
      gallery: [],
    });
    setScopeText('');
    setSpecsText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: ApiProject) => {
    setEditingProject({ ...proj });
    setScopeText(Array.isArray(proj.scope) ? proj.scope.join('\n') : '');
    setSpecsText(Array.isArray(proj.specifications) ? proj.specifications.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.name) {
      error('Project name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const parsedScope = scopeText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedSpecs = specsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...editingProject,
        slug: editingProject.slug || handleSlugify(editingProject.name),
        scope: parsedScope,
        specifications: parsedSpecs,
      };

      if (editingProject.id) {
        await api.put(`/cms/projects/${editingProject.id}/`, payload);
        success(`Project "${editingProject.name}" updated successfully.`);
      } else {
        await api.post('/cms/projects/', payload);
        success(`Project "${editingProject.name}" created successfully.`);
      }

      setIsModalOpen(false);
      await fetchProjectsAndCategories();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (proj: ApiProject) => {
    const nextStatus: PublishState = proj.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/cms/projects/${proj.id}/`, { status: nextStatus });
      success(
        `Project "${proj.name}" is now ${nextStatus === 'published' ? 'published live' : 'saved as draft'}.`
      );
      await fetchProjectsAndCategories();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to toggle publication status');
    }
  };

  const handleToggleFeatured = async (proj: ApiProject) => {
    try {
      await api.patch(`/cms/projects/${proj.id}/`, { is_featured: !proj.is_featured });
      success(
        `Project "${proj.name}" is ${!proj.is_featured ? 'now featured on the homepage' : 'removed from featured'}.`
      );
      await fetchProjectsAndCategories();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to toggle featured status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/cms/projects/${deleteTarget.id}/`);
      success(`Project "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await fetchProjectsAndCategories();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      p.location?.toLowerCase().includes(search.toLowerCase().trim()) ||
      p.client?.toLowerCase().includes(search.toLowerCase().trim());
    const matchesCategory =
      selectedCategory === 'All' ||
      p.resolved_category === selectedCategory ||
      p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
            Projects & Portfolio Manager
          </h2>
          <p className="text-xs text-surface-steel/70">
            Manage your verified construction project portfolio, categories, gallery photos, and client records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-heading font-bold tracking-wide shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F2137] border border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07111E]/80 border border-white/10 text-white text-xs placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#07111E]/80 border border-white/10 text-white text-xs"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-surface-steel/70 flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span>Total: <strong className="text-white">{projects.length}</strong></span>
          <span>Featured: <strong className="text-amber-400">{projects.filter((p) => p.is_featured).length}</strong></span>
          <span>Draft: <strong className="text-surface-steel/50">{projects.filter((p) => p.status === 'draft').length}</strong></span>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-[#0F2137] border border-white/10 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-steel/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-surface-steel/60">
            <FolderGit2 className="w-10 h-10 mx-auto text-surface-steel/30 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">No projects found</p>
            <p className="max-w-xs mx-auto mb-4">
              {search ? 'Try adjusting your search criteria.' : 'Create your first project to display it on the website.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07111E] text-surface-steel/70 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((proj) => {
                  const resolvedImg = proj.image ? mediaUrl(proj.image) : null;
                  return (
                    <tr key={proj.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand-navy border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {resolvedImg ? (
                              <img
                                src={resolvedImg}
                                alt={proj.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FolderGit2 className="w-5 h-5 text-surface-steel/40" />
                            )}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-white text-sm">{proj.name}</p>
                            <p className="text-surface-steel/60 font-mono text-[10px] mt-0.5">
                              /projects/{proj.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-surface-steel/80">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                          {proj.resolved_category || proj.category_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-surface-steel/70">
                        {proj.location || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(proj)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            proj.is_featured
                              ? 'text-amber-400 bg-amber-400/10'
                              : 'text-surface-steel/40 hover:text-white'
                          }`}
                          title={proj.is_featured ? 'Featured on homepage' : 'Not featured'}
                        >
                          <Star className={`w-4 h-4 ${proj.is_featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(proj)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            proj.status === 'published'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                          }`}
                        >
                          {proj.status === 'published' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(proj)}
                            className="p-1.5 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(proj)}
                            className="p-1.5 rounded-lg text-surface-steel/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue-light">
                  <FolderGit2 className="w-5 h-5" />
                </span>
                <h3 className="text-base font-heading font-bold text-white">
                  {editingProject.id ? `Edit Project: ${editingProject.name}` : 'Add New Engineering Project'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-surface-steel/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Project Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingProject((prev) => ({
                        ...prev,
                        name,
                        slug: prev?.id ? prev.slug : handleSlugify(name),
                      }));
                    }}
                    placeholder="e.g. Commercial Mixed-Use Complex"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingProject.slug || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="commercial-mixed-use-complex"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Project Category
                  </label>
                  <select
                    value={editingProject.category || ''}
                    onChange={(e) => {
                      const catId = parseInt(e.target.value, 10);
                      const cat = categories.find((c) => c.id === catId);
                      setEditingProject((prev) => ({
                        ...prev,
                        category: catId || null,
                        category_name: cat ? cat.name : prev?.category_name,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingProject.location || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Adama, Ethiopia"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, client: e.target.value }))
                    }
                    placeholder="e.g. Commercial Client"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Project Status
                  </label>
                  <select
                    value={editingProject.project_status || 'Completed'}
                    onChange={(e) =>
                      setEditingProject((prev) => ({
                        ...prev,
                        project_status: e.target.value as 'Completed' | 'Ongoing' | 'Planned',
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={editingProject.completion_date || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, completion_date: e.target.value || null }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingProject.display_order ?? 10}
                    onChange={(e) =>
                      setEditingProject((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Project Summary / Lead Paragraph
                </label>
                <textarea
                  rows={2}
                  value={editingProject.summary || ''}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder="Concise overview shown in project cards..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Full Project Overview & Description
                </label>
                <textarea
                  rows={4}
                  value={editingProject.overview || editingProject.description || ''}
                  onChange={(e) =>
                    setEditingProject((prev) => ({
                      ...prev,
                      overview: e.target.value,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed project description covering engineering milestones and scope execution..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Scope of Work (One item per line)
                  </label>
                  <textarea
                    rows={4}
                    value={scopeText}
                    onChange={(e) => setScopeText(e.target.value)}
                    placeholder="Reinforced concrete foundation&#10;Structural steel framework&#10;Interior mechanical finishing"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Technical Specifications (One item per line)
                  </label>
                  <textarea
                    rows={4}
                    value={specsText}
                    onChange={(e) => setSpecsText(e.target.value)}
                    placeholder="Built area: 3,500 sqm&#10;Stories: G+4 commercial&#10;Design: Eurocode / EBCS compliant"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Primary Image & Multi-Photo Gallery */}
              <div className="space-y-4 pt-2">
                {/* Main Cover Photo */}
                <div className="p-4 rounded-xl bg-[#07111E]/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-heading font-bold text-white uppercase tracking-wider">
                        Primary Cover Image
                      </label>
                      <p className="text-[11px] text-surface-steel/60">
                        The primary image displayed on project cards and search listings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('cover');
                        setMediaPickerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editingProject.image ? 'Change Cover' : 'Select Cover'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl bg-[#07111E] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center relative group shadow-md">
                      {editingProject.image ? (
                        <>
                          <img
                            src={mediaUrl(editingProject.image)}
                            alt="Project cover preview"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-brand-navy/90 text-[9px] font-bold text-brand-blue-light">
                            COVER
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center text-surface-steel/40">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[9px]">No cover</span>
                        </div>
                      )}
                    </div>
                    {editingProject.image && (
                      <button
                        type="button"
                        onClick={() => setEditingProject((prev) => ({ ...prev, image: null }))}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Cover</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Multiple Gallery Photos Section */}
                <div className="p-4 rounded-xl bg-[#07111E]/60 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Images className="w-4 h-4 text-brand-blue-light" />
                      <div>
                        <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                          Project Photo Gallery ({editingProject.gallery?.length || 0})
                        </h4>
                        <p className="text-[11px] text-surface-steel/60">
                          Add multiple photos (site progress, architectural views, construction milestones). Each photo will be displayed in the client project detail page.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('gallery');
                        setMediaPickerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold shadow hover:bg-brand-blue-light transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photo to Gallery</span>
                    </button>
                  </div>

                  {/* Gallery Photos Grid */}
                  {(!editingProject.gallery || editingProject.gallery.length === 0) ? (
                    <div
                      onClick={() => {
                        setMediaPickerTarget('gallery');
                        setMediaPickerOpen(true);
                      }}
                      className="py-8 px-4 text-center border-2 border-dashed border-white/10 rounded-xl hover:border-brand-blue/50 cursor-pointer transition-colors"
                    >
                      <Images className="w-8 h-8 mx-auto text-surface-steel/30 mb-2" />
                      <p className="text-xs font-semibold text-white">No gallery photos added yet</p>
                      <p className="text-[11px] text-surface-steel/50 mt-1">
                        Click to add multiple high-resolution photos for this project.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {editingProject.gallery.map((photo, index) => (
                        <div
                          key={photo.id || index}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 relative group"
                        >
                          <div className="w-20 h-20 rounded-lg bg-[#07111E] border border-white/10 overflow-hidden shrink-0 relative">
                            <img
                              src={mediaUrl(photo.image)}
                              alt={photo.alt_text || photo.caption || `Gallery #${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1 left-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) =>
                                handleUpdateGalleryPhoto(index, { caption: e.target.value })
                              }
                              placeholder="Photo caption (e.g. South elevation)"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#07111E] border border-white/15 text-white text-xs"
                            />

                            <div className="flex items-center gap-2 text-[11px]">
                              <button
                                type="button"
                                onClick={() => handleSetGalleryPhotoAsCover(index)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                  editingProject.image === photo.image
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-white/5 hover:bg-white/10 text-surface-steel/80'
                                }`}
                              >
                                <Star className="w-3 h-3" />
                                <span>{editingProject.image === photo.image ? 'Is Cover' : 'Set as Cover'}</span>
                              </button>

                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveGalleryPhoto(index, 'up')}
                                  className="p-1 rounded hover:bg-white/10 text-surface-steel/70 hover:text-white"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                              )}
                              {index < (editingProject.gallery?.length || 0) - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveGalleryPhoto(index, 'down')}
                                  className="p-1 rounded hover:bg-white/10 text-surface-steel/70 hover:text-white"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryPhoto(index)}
                                className="ml-auto text-rose-400 hover:text-rose-300 p-1"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingProject.is_featured || false}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, is_featured: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-[#07111E] border-white/20 text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="text-xs text-white font-medium">
                    Feature on Homepage (Top 6 showcase)
                  </span>
                </label>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Publication Status
                </label>
                <select
                  value={editingProject.status || 'published'}
                  onChange={(e) =>
                    setEditingProject((prev) => ({
                      ...prev,
                      status: e.target.value as PublishState,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                >
                  <option value="published">Published (Visible on Public Website)</option>
                  <option value="draft">Draft (Private, CMS Only)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-xs font-semibold text-white shadow disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        currentValue={mediaPickerTarget === 'cover' ? editingProject?.image : null}
        onSelect={(url, asset) => {
          if (mediaPickerTarget === 'cover') {
            setEditingProject((prev) => ({ ...prev, image: url }));
          } else {
            handleAddGalleryPhoto(url, asset);
          }
        }}
        title={mediaPickerTarget === 'cover' ? 'Select Project Cover Image' : 'Select Photo for Project Gallery'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Project Portfolio Record"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
