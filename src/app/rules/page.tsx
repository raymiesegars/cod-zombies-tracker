'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  Input,
  Button,
  Modal,
} from '@/components/ui';
import { RULES_GAMES, type UnifiedRules, type RulesSection } from '@/lib/rules/index';
import { isRuleLink, isRuleInlineLinks, getRuleItemText, type RuleItem } from '@/lib/rules/types';
import {
  BookOpen,
  ChevronLeft,
  Search,
  Pencil,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
} from 'lucide-react';

const LINK_CLASS = 'text-white hover:underline underline-offset-2';

function sectionMatchesSearch(section: RulesSection, query: string): { match: boolean; itemIndices?: number[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { match: true };
  const titleMatch = section.title.toLowerCase().includes(q);
  const itemIndices: number[] = [];
  section.items.forEach((item, i) => {
    if (getRuleItemText(item).toLowerCase().includes(q)) itemIndices.push(i);
  });
  if (titleMatch) return { match: true };
  if (itemIndices.length > 0) return { match: true, itemIndices };
  return { match: false };
}

function filterSectionBySearch(section: RulesSection, query: string): RulesSection | null {
  const q = query.trim().toLowerCase();
  if (!q) return section;
  const { match, itemIndices } = sectionMatchesSearch(section, query);
  if (!match) return null;
  if (!itemIndices) return section;
  return { title: section.title, items: section.items.filter((_, i) => itemIndices!.includes(i)) };
}

function RuleItemContent({ item }: { item: RuleItem }) {
  if (isRuleInlineLinks(item)) {
    return (
      <>
        {item.parts.map((part, j) =>
          typeof part === 'string' ? (
            part
          ) : (
            <a
              key={j}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {part.text}
            </a>
          )
        )}
      </>
    );
  }
  if (isRuleLink(item)) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {item.text}
      </a>
    );
  }
  return <>{item}</>;
}

function RulesSectionBlock({
  section,
  isEditing,
  onEditTitle,
  onEditItem,
  onRemoveItem,
  onAddItem,
  onRemoveSection,
}: {
  section: RulesSection;
  isEditing?: boolean;
  onEditTitle?: (title: string) => void;
  onEditItem?: (index: number, item: RuleItem) => void;
  onRemoveItem?: (index: number) => void;
  onAddItem?: () => void;
  onRemoveSection?: () => void;
}) {
  if (!isEditing) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-2">{section.title}</h3>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-white">
          {section.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <RuleItemContent item={item} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-lg border border-bunker-600 bg-bunker-900/50">
      <div className="flex items-center justify-between gap-2 mb-3">
        <Input
          value={section.title}
          onChange={(e) => onEditTitle?.(e.target.value)}
          className="flex-1 bg-bunker-800 border-bunker-600 text-white font-semibold"
          placeholder="Section title"
        />
        <Button variant="secondary" size="sm" onClick={onRemoveSection} leftIcon={<Trash2 className="w-4 h-4" />}>
          Remove
        </Button>
      </div>
      <ul className="space-y-2">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="text-bunker-500 mt-2 cursor-move" aria-hidden>
              <GripVertical className="w-4 h-4" />
            </span>
            <RuleItemEditor
              item={item}
              onChange={(newItem) => onEditItem?.(i, newItem)}
              onRemove={() => onRemoveItem?.(i)}
            />
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" onClick={onAddItem} leftIcon={<Plus className="w-4 h-4" />} className="mt-2">
        Add item
      </Button>
    </div>
  );
}

function RuleItemEditorInlineLinks({
  item,
  onChange,
  onRemove,
}: {
  item: { parts: (string | { text: string; href: string })[] };
  onChange: (item: RuleItem) => void;
  onRemove: () => void;
}) {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(item.parts, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonMode) setJsonText(JSON.stringify(item.parts, null, 2));
  }, [item.parts, jsonMode]);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Must be an array');
      const valid = parsed.every(
        (p: unknown) => typeof p === 'string' || (p && typeof p === 'object' && 'text' in p && 'href' in p)
      );
      if (!valid) throw new Error('Each part must be string or {text, href}');
      onChange({ parts: parsed });
      setJsonError(null);
      setJsonMode(false);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="flex-1">
      {jsonMode ? (
        <div className="space-y-2">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setJsonError(null);
            }}
            className="w-full min-h-[4rem] px-3 py-2 rounded bg-bunker-800 border border-bunker-600 text-white text-xs font-mono"
            placeholder='[ "text ", { "text": "link", "href": "https://..." } ]'
          />
          {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={applyJson}>
              Apply
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setJsonMode(false); setJsonError(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 items-start">
          <div className="flex-1 py-2 px-3 rounded bg-bunker-800/50 border border-bunker-700 text-sm text-bunker-300">
            <RuleItemContent item={item} />
          </div>
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" onClick={() => setJsonMode(true)}>
              Edit JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={onRemove} aria-label="Remove item">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RuleItemEditor({
  item,
  onChange,
  onRemove,
}: {
  item: RuleItem;
  onChange: (item: RuleItem) => void;
  onRemove: () => void;
}) {
  if (typeof item === 'string') {
    return (
      <div className="flex-1 flex gap-2">
        <textarea
          value={item}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-h-[2.5rem] px-3 py-2 rounded bg-bunker-800 border border-bunker-600 text-white text-sm resize-y"
          rows={2}
        />
        <Button variant="secondary" size="sm" onClick={onRemove} aria-label="Remove item">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }
  if (isRuleLink(item)) {
    return (
      <div className="flex-1 flex flex-col sm:flex-row gap-2">
        <Input
          value={item.text}
          onChange={(e) => onChange({ ...item, text: e.target.value })}
          placeholder="Link text"
          className="bg-bunker-800 border-bunker-600 text-white"
        />
        <Input
          value={item.href}
          onChange={(e) => onChange({ ...item, href: e.target.value })}
          placeholder="https://..."
          className="bg-bunker-800 border-bunker-600 text-white"
        />
        <Button variant="secondary" size="sm" onClick={onRemove} aria-label="Remove item">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }
  if (isRuleInlineLinks(item)) {
    return (
      <RuleItemEditorInlineLinks
        item={item}
        onChange={onChange}
        onRemove={onRemove}
      />
    );
  }
  return null;
}

function formatChallengeType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .toLowerCase()
    .replace(/speedrun/gi, 'Speedrun')
    .replace(/ee\b/gi, 'EE')
    .replace(/round\s+(\d+)/gi, 'Round $1');
}

const DEFAULT_VERIFICATION_ITEMS: string[] = [
  'Full recording required. To verify a run on CoD Zombies Tracker, you must provide a full recording of the game from start to finish. Partial clips or screenshots are not sufficient for verified status.',
  'Verified vs normal logging. Any run can be logged with proof links for your own tracking. Verified runs are reviewed by staff and require proof that covers the entire run and follows all rules for the category (e.g. round milestones, challenge restrictions, platform/client rules where applicable). Verified runs appear on leaderboards and can earn verified XP.',
  'What verified runs require. Proof must show the run from start to finish and must comply with the official rules for that map/category (game-specific rules, challenge rules, and any client or script requirements listed for that game).',
  'Strict rules (clients, scripts, patches). Stricter requirements—such as specific clients (e.g. BOIII Community Client) or approved scripts/patches—apply in full to runs that are within 5% of the world record for that map and category. For runs outside that margin, vanilla gameplay is acceptable as long as the run is recorded in full and there is nothing blatantly suspicious in the gameplay. When in doubt, follow the full rules for the category.',
];

export default function RulesPage() {
  const [selectedGame, setSelectedGame] = useState<string>(RULES_GAMES[0]?.shortName ?? 'BO3');
  const [activeTab, setActiveTab] = useState<'general' | 'challenges'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeFilter, setChallengeFilter] = useState<string>('');
  const [unified, setUnified] = useState<UnifiedRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<UnifiedRules | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!selectedGame) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rules/${encodeURIComponent(selectedGame)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUnified(data);
        setEditDraft(data);
      } else {
        setUnified(null);
        setEditDraft(null);
      }
    } catch {
      setUnified(null);
      setEditDraft(null);
    } finally {
      setLoading(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { admin: null }))
      .then((d: { admin?: { isSuperAdmin?: boolean } | null }) => {
        setIsSuperAdmin(d?.admin?.isSuperAdmin === true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editMode) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [editMode, hasUnsavedChanges]);

  useEffect(() => {
    setChallengeFilter('');
  }, [selectedGame]);

  const draft = editMode ? editDraft : unified;

  const challengeFilterOptions = useMemo(() => {
    if (!draft) return [{ value: '', label: 'All challenges' }];
    const types = Object.keys(draft.challengeRulesByType);
    return [
      { value: '', label: 'All challenges' },
      ...types.map((type) => ({ value: type, label: formatChallengeType(type) })),
    ];
  }, [draft]);

  const filteredGeneralSections = useMemo(() => {
    if (!draft) return [];
    if (editMode) return draft.generalSections;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return draft.generalSections;
    return draft.generalSections
      .map((s) => filterSectionBySearch(s, searchQuery))
      .filter((s): s is RulesSection => s !== null);
  }, [draft, searchQuery, editMode]);

  const filteredChallengeSections = useMemo(() => {
    if (!draft) return [];
    let sections = draft.challengeSections;
    if (challengeFilter && !editMode) {
      const wantTitle = formatChallengeType(challengeFilter);
      sections = sections.filter((s) => s.title === wantTitle);
    }
    if (editMode) return sections;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => filterSectionBySearch(s, searchQuery))
      .filter((s): s is RulesSection => s !== null);
  }, [draft, searchQuery, challengeFilter, editMode]);

  const filteredChallengeByType = useMemo(() => {
    if (!draft) return [];
    const entries = Object.entries(draft.challengeRulesByType);
    let filtered = entries;
    if (challengeFilter && !editMode) filtered = entries.filter(([type]) => type === challengeFilter);
    if (editMode) return filtered;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(
      ([type, desc]) =>
        formatChallengeType(type).toLowerCase().includes(q) || desc.toLowerCase().includes(q)
    );
  }, [draft, searchQuery, challengeFilter, editMode]);

  const hasSearchResults =
    activeTab === 'general'
      ? filteredGeneralSections.length > 0
      : filteredChallengeSections.length > 0 || filteredChallengeByType.length > 0;

  const updateDraft = useCallback((updater: (prev: UnifiedRules) => UnifiedRules) => {
    setEditDraft((prev) => (prev ? updater(prev) : null));
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    if (!draft || !selectedGame) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rules/${encodeURIComponent(selectedGame)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          generalSections: draft.generalSections,
          challengeSections: draft.challengeSections,
          challengeRulesByType: draft.challengeRulesByType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Failed to save');
        return;
      }
      setHasUnsavedChanges(false);
      setEditMode(false);
      await fetchRules();
    } catch {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedGame) return;
    setResetConfirmOpen(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rules/${encodeURIComponent(selectedGame)}/reset`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        alert('Failed to reset');
        return;
      }
      setHasUnsavedChanges(false);
      setEditMode(false);
      await fetchRules();
    } catch {
      alert('Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const addSection = (tab: 'general' | 'challenges') => {
    updateDraft((prev) => {
      const section: RulesSection = { title: 'New section', items: ['New item'] };
      if (tab === 'general') {
        return { ...prev, generalSections: [...prev.generalSections, section] };
      }
      return { ...prev, challengeSections: [...prev.challengeSections, section] };
    });
    setActiveTab(tab);
  };

  const addChallengeType = () => {
    const type = prompt('Challenge type (e.g. NO_DOWNS, ROUND_30_SPEEDRUN):');
    if (!type?.trim()) return;
    const key = type.trim().toUpperCase().replace(/\s+/g, '_');
    if (draft?.challengeRulesByType[key] && !confirm(`"${key}" already exists. Overwrite?`)) return;
    const desc = prompt('Rule description:') ?? 'Official rules coming soon.';
    updateDraft((prev) => ({
      ...prev,
      challengeRulesByType: { ...prev.challengeRulesByType, [key]: desc },
    }));
    setActiveTab('challenges');
  };

  return (
    <div className="min-h-screen bg-bunker-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white text-sm mb-6 transition-colors hover:opacity-90"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-blood-900/40 border border-blood-700/40">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide">
              Rules & Verification
            </h1>
            <p className="text-white text-sm mt-0.5 opacity-90">
              Verification process, proof requirements, and per-game rules
            </p>
          </div>
        </div>

        <Card variant="bordered" className="mb-8 border-blood-800/50 bg-blood-950/30">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Verification & proof</h2>
            <div className="space-y-4 text-sm text-white leading-relaxed">
              {DEFAULT_VERIFICATION_ITEMS.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="rules-game" className="block text-sm font-medium text-white mb-2">
              Game
            </label>
            <Select
              id="rules-game"
              value={selectedGame}
              onChange={(e) => {
                if (hasUnsavedChanges && !confirm('Discard unsaved changes?')) return;
                setSelectedGame(e.target.value);
                setChallengeFilter('');
              }}
              options={RULES_GAMES.map((g) => ({ value: g.shortName, label: g.name }))}
              className="w-full sm:w-64 bg-bunker-800 border-bunker-600 text-white"
            />
          </div>
          {isSuperAdmin && (
            <div className="flex items-end gap-2">
              {editMode ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setResetConfirmOpen(true)}
                    disabled={saving}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Reset to default
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (hasUnsavedChanges && !confirm('Discard unsaved changes?')) return;
                      setEditMode(false);
                      setEditDraft(unified);
                      setHasUnsavedChanges(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditMode(true);
                    setEditDraft({ ...unified! });
                    setHasUnsavedChanges(false);
                  }}
                  disabled={!unified || loading}
                  leftIcon={<Pencil className="w-4 h-4" />}
                >
                  Edit rules
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-bunker-500" />
          </div>
        ) : draft ? (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bunker-400 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search this page..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full bg-bunker-800 border-bunker-600 text-white placeholder:text-bunker-500"
                    aria-label="Search rules"
                  />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-white mb-4">
                {draft.gameName} — Official rules
                {hasUnsavedChanges && <span className="ml-2 text-amber-400 text-sm">(unsaved)</span>}
              </h2>
              <Tabs
                value={activeTab}
                onChange={(v) => {
                  setActiveTab(v as 'general' | 'challenges');
                  setChallengeFilter('');
                }}
                className="w-full"
                variant="separate"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4 p-2 gap-2">
                  <TabsTrigger value="general" className="py-2 px-3 text-sm">
                    General rules
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="py-2 px-3 text-sm">
                    Challenge rules
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-0 space-y-2">
                  {editMode && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addSection('general')}
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="mb-4"
                    >
                      Add section
                    </Button>
                  )}
                  {searchQuery.trim() && !hasSearchResults ? (
                    <p className="text-white text-sm opacity-90">
                      No matches for &quot;{searchQuery.trim()}&quot; in general rules.
                    </p>
                  ) : filteredGeneralSections.length > 0 ? (
                    filteredGeneralSections.map((section, idx) => {
                      const safeIdx = idx;
                      return (
                        <RulesSectionBlock
                          key={`${section.title}-${safeIdx}`}
                          section={section}
                          isEditing={editMode}
                          onEditTitle={
                            editMode
                              ? (title) =>
                                  updateDraft((p) => {
                                    const next = [...p.generalSections];
                                    next[safeIdx] = { ...next[safeIdx], title };
                                    return { ...p, generalSections: next };
                                  })
                              : undefined
                          }
                          onEditItem={
                            editMode
                              ? (itemIdx, item) =>
                                  updateDraft((p) => {
                                    const next = [...p.generalSections];
                                    const items = [...next[safeIdx].items];
                                    items[itemIdx] = item;
                                    next[safeIdx] = { ...next[safeIdx], items };
                                    return { ...p, generalSections: next };
                                  })
                              : undefined
                          }
                          onRemoveItem={
                            editMode
                              ? (itemIdx) =>
                                  updateDraft((p) => {
                                    const next = [...p.generalSections];
                                    const items = next[safeIdx].items.filter((_, i) => i !== itemIdx);
                                    next[safeIdx] = { ...next[safeIdx], items };
                                    return { ...p, generalSections: next };
                                  })
                              : undefined
                          }
                          onAddItem={
                            editMode
                              ? () =>
                                  updateDraft((p) => {
                                    const next = [...p.generalSections];
                                    next[safeIdx] = {
                                      ...next[safeIdx],
                                      items: [...next[safeIdx].items, 'New item'],
                                    };
                                    return { ...p, generalSections: next };
                                  })
                              : undefined
                          }
                          onRemoveSection={
                            editMode
                              ? () =>
                                  updateDraft((p) => ({
                                    ...p,
                                    generalSections: p.generalSections.filter((_, i) => i !== safeIdx),
                                  }))
                              : undefined
                          }
                        />
                      );
                    })
                  ) : (
                    <p className="text-white text-sm opacity-90">No general rules defined for this game.</p>
                  )}
                </TabsContent>
                <TabsContent value="challenges" className="mt-0 space-y-4">
                  {draft && (
                    <div className="mb-4 flex flex-wrap gap-3">
                      <div>
                        <label htmlFor="rules-challenge-filter" className="block text-sm font-medium text-white mb-2">
                          Show challenge
                        </label>
                        <Select
                          id="rules-challenge-filter"
                          value={challengeFilter}
                          onChange={(e) => setChallengeFilter(e.target.value)}
                          options={challengeFilterOptions}
                          className="w-full sm:w-64 bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      {editMode && (
                        <>
                          <div className="flex items-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => addSection('challenges')}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Add section
                            </Button>
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={addChallengeType}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Add challenge type
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {searchQuery.trim() && !hasSearchResults ? (
                    <p className="text-white text-sm opacity-90">
                      No matches for &quot;{searchQuery.trim()}&quot; in challenge rules.
                    </p>
                  ) : (
                    <>
                      {filteredChallengeSections.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-white mb-3">Full challenge sections</h3>
                          {filteredChallengeSections.map((section, idx) => {
                            const safeIdx = idx;
                            return (
                              <RulesSectionBlock
                                key={`${section.title}-${safeIdx}`}
                                section={section}
                                isEditing={editMode}
                                onEditTitle={
                                  editMode
                                    ? (title) =>
                                        updateDraft((p) => {
                                          const next = [...p.challengeSections];
                                          next[safeIdx] = { ...next[safeIdx], title };
                                          return { ...p, challengeSections: next };
                                        })
                                    : undefined
                                }
                                onEditItem={
                                  editMode
                                    ? (itemIdx, item) =>
                                        updateDraft((p) => {
                                          const next = [...p.challengeSections];
                                          const items = [...next[safeIdx].items];
                                          items[itemIdx] = item;
                                          next[safeIdx] = { ...next[safeIdx], items };
                                          return { ...p, challengeSections: next };
                                        })
                                    : undefined
                                }
                                onRemoveItem={
                                  editMode
                                    ? (itemIdx) =>
                                        updateDraft((p) => {
                                          const next = [...p.challengeSections];
                                          const items = next[safeIdx].items.filter((_, i) => i !== itemIdx);
                                          next[safeIdx] = { ...next[safeIdx], items };
                                          return { ...p, challengeSections: next };
                                        })
                                    : undefined
                                }
                                onAddItem={
                                  editMode
                                    ? () =>
                                        updateDraft((p) => {
                                          const next = [...p.challengeSections];
                                          next[safeIdx] = {
                                            ...next[safeIdx],
                                            items: [...next[safeIdx].items, 'New item'],
                                          };
                                          return { ...p, challengeSections: next };
                                        })
                                    : undefined
                                }
                                onRemoveSection={
                                  editMode
                                    ? () =>
                                        updateDraft((p) => ({
                                          ...p,
                                          challengeSections: p.challengeSections.filter((_, i) => i !== safeIdx),
                                        }))
                                    : undefined
                                }
                              />
                            );
                          })}
                        </div>
                      )}
                      <h3 className="text-sm font-semibold text-white mb-2">By category</h3>
                      {editMode ? (
                        <ul className="space-y-3">
                          {Object.entries(draft.challengeRulesByType).map(([type, desc]) => (
                            <li key={type} className="flex gap-2 items-start p-3 rounded-lg border border-bunker-600 bg-bunker-900/50">
                              <span className="font-medium text-white text-sm shrink-0 mt-1">
                                {formatChallengeType(type)}
                              </span>
                              <div className="flex-1 flex gap-2">
                                <textarea
                                  value={desc}
                                  onChange={(e) =>
                                    updateDraft((p) => ({
                                      ...p,
                                      challengeRulesByType: { ...p.challengeRulesByType, [type]: e.target.value },
                                    }))
                                  }
                                  className="flex-1 min-h-[2.5rem] px-3 py-2 rounded bg-bunker-800 border border-bunker-600 text-white text-sm resize-y"
                                  rows={2}
                                />
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    updateDraft((p) => {
                                      const next = { ...p.challengeRulesByType };
                                      delete next[type];
                                      return { ...p, challengeRulesByType: next };
                                    })
                                  }
                                  aria-label={`Remove ${type}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-3">
                          {filteredChallengeByType.map(([type, desc]) => (
                            <li key={type}>
                              <span className="font-medium text-white text-sm">{formatChallengeType(type)}</span>
                              <p className="text-sm text-white mt-0.5 leading-relaxed opacity-90">{desc}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card variant="bordered">
            <CardContent className="p-6 text-center text-white">
              No rules data for this game.
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset to default?"
        description="This will delete your custom rules and restore the original static rules for this game."
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setResetConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
