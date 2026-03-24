"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { useRoles } from "@/lib/hooks/useRoles";
import { useTheme } from "@/lib/hooks/useTheme";
import { ROLE_TEMPLATES, COLOR_CLASSES, ROLE_COLORS } from "@/lib/role-templates";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User, Palette, Users, Plus, Trash2, Edit2, Sun, Moon, Monitor, Check } from "lucide-react";

interface CustomRole {
  id: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  challenge_rules: string;
  color: string;
  icon: string;
  artifact_type: string;
  default_model: string;
  is_default: boolean;
  is_active: boolean;
}

interface ModelOption {
  slug: string;
  display_name: string;
  provider: string;
  category: string;
  cost_tier: string;
}

export default function SettingsPage() {
  const { workspaceId, profile } = useWorkspace();
  const { refreshRoles } = useRoles();
  const { theme, setTheme } = useTheme();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [tab, setTab] = useState<'profile' | 'personas' | 'appearance'>('profile');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/roles?workspaceId=${workspaceId}`)
      .then(r => r.json())
      .then(data => setRoles(data.roles || []))
      .catch(console.error);
    fetch('/api/models')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setModels(data); })
      .catch(console.error);
  }, [workspaceId]);

  const updateProfile = async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName }),
    });
    setSaving(false);
  };

  const createRole = async () => {
    if (!newRoleName.trim() || !workspaceId) return;
    const template = ROLE_TEMPLATES.find(t => t.slug === selectedTemplate);

    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        name: newRoleName,
        title: newRoleTitle || template?.title || newRoleName,
        templateSlug: selectedTemplate || undefined,
      }),
    });

    const role = await res.json();
    if (role.id) {
      setRoles(prev => [...prev, role]);
      setShowCreateDialog(false);
      setNewRoleName('');
      setNewRoleTitle('');
      setSelectedTemplate('');
      await refreshRoles();
    }
  };

  const updateRole = async (roleId: string, updates: Partial<CustomRole>) => {
    const res = await fetch(`/api/roles/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    if (updated.id) {
      setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
    setEditingRole(null);
    await refreshRoles();
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Deactivate this persona? Chat history will be preserved.')) return;
    await fetch(`/api/roles/${roleId}`, { method: 'DELETE' });
    setRoles(prev => prev.filter(r => r.id !== roleId));
    await refreshRoles();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Settings</h1>

        {/* Tab buttons */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: 'profile' as const, icon: User, label: 'Profile' },
            { key: 'personas' as const, icon: Users, label: 'Personas' },
            { key: 'appearance' as const, icon: Palette, label: 'Appearance' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Plan</label>
                <span className="text-sm px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {profile?.subscription_status === 'active' ? 'Pro' : 'Free'}
                </span>
              </div>
              <Button onClick={updateProfile} size="sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Personas Tab */}
        {tab === 'personas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Executive Team</h2>
              <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Persona
              </Button>
            </div>

            <div className="grid gap-3">
              {roles.filter(r => r.is_active).map(role => {
                const colors = COLOR_CLASSES[role.color] || COLOR_CLASSES.indigo;
                return (
                  <div key={role.id} className={`bg-white dark:bg-zinc-900 rounded-xl border ${colors.border} p-4 flex items-start gap-4`}>
                    <div className={`h-10 w-10 rounded-full ${colors.bgDark} text-white flex items-center justify-center font-bold shrink-0`}>
                      {role.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{role.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bgLight} ${colors.text} font-medium`}>{role.title}</span>
                        {role.is_default && <span className="text-[10px] text-zinc-400">Default</span>}
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">{role.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingRole(role)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      {!role.is_default && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteRole(role.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {tab === 'appearance' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Theme</h2>
            <div className="flex gap-3">
              {[
                { value: 'light' as const, icon: Sun, label: 'Light' },
                { value: 'dark' as const, icon: Moon, label: 'Dark' },
                { value: 'system' as const, icon: Monitor, label: 'System' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    theme === value
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                  {theme === value && <Check className="h-4 w-4 ml-1" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Persona Dialog */}
        {showCreateDialog && (
        <Dialog open onOpenChange={() => setShowCreateDialog(false)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogTitle>Add New Persona</DialogTitle>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Alex, Sarah..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Title</label>
                <input
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g., CTO, Sales Lead..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Or pick a template:</label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {ROLE_TEMPLATES.map(t => {
                    const colors = COLOR_CLASSES[t.color] || COLOR_CLASSES.indigo;
                    return (
                      <button
                        key={t.slug}
                        onClick={() => {
                          setSelectedTemplate(t.slug === selectedTemplate ? '' : t.slug);
                          if (t.slug !== selectedTemplate) {
                            setNewRoleName(t.name);
                            setNewRoleTitle(t.title);
                          }
                        }}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          selectedTemplate === t.slug
                            ? `${colors.border} ${colors.bgLight}`
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <span className="font-medium text-sm">{t.title}</span>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={createRole} disabled={!newRoleName.trim()}>Create Persona</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}

        {/* Edit Persona Dialog */}
        {editingRole && (
          <Dialog open onOpenChange={() => setEditingRole(null)}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogTitle>Edit {editingRole.name}</DialogTitle>
              <EditRoleForm
                role={editingRole}
                models={models}
                onSave={(updates) => updateRole(editingRole.id, updates)}
                onCancel={() => setEditingRole(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function EditRoleForm({ role, models, onSave, onCancel }: { role: CustomRole; models: ModelOption[]; onSave: (u: Partial<CustomRole>) => void; onCancel: () => void }) {
  const [name, setName] = useState(role.name);
  const [title, setTitle] = useState(role.title);
  const [description, setDescription] = useState(role.description);
  const [personality, setPersonality] = useState(role.personality);
  const [color, setColor] = useState(role.color);
  const [defaultModel, setDefaultModel] = useState(role.default_model || 'anthropic/claude-sonnet-4-6');

  // Group models by provider
  const modelsByProvider = models.reduce((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  return (
    <div className="space-y-4 mt-2">
      <div>
        <label className="text-sm font-medium block mb-1">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Title / Role</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Default Model</label>
        <select
          value={defaultModel}
          onChange={e => setDefaultModel(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none"
        >
          {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
            <optgroup key={provider} label={provider}>
              {providerModels.map(m => (
                <option key={m.slug} value={m.slug}>
                  {m.display_name} ({m.cost_tier})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="text-xs text-zinc-400 mt-1">This model will be used by default for this persona&apos;s responses.</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Personality & Instructions</label>
        <textarea value={personality} onChange={e => setPersonality(e.target.value)} rows={6} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none resize-y" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Color</label>
        <div className="flex flex-wrap gap-2">
          {ROLE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full ${COLOR_CLASSES[c]?.bgDark || 'bg-zinc-400'} transition-all ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ name, title, description, personality, color, default_model: defaultModel })}>Save</Button>
      </div>
    </div>
  );
}
