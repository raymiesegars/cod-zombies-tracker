'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Select, Input } from '@/components/ui';
import { RULES_GAMES, getUnifiedRulesForGame, type UnifiedRules, type RulesSection } from '@/lib/rules/index';
import { isRuleLink, isRuleInlineLinks, getRuleItemText, type RuleItem } from '@/lib/rules/types';
import { BookOpen, ChevronLeft, Search } from 'lucide-react';

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

function RulesSectionBlock({ section }: { section: RulesSection }) {
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

function formatChallengeType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .toLowerCase()
    .replace(/speedrun/gi, 'Speedrun')
    .replace(/ee\b/gi, 'EE')
    .replace(/round\s+(\d+)/gi, 'Round $1');
}

export default function RulesPage() {
  const [selectedGame, setSelectedGame] = useState<string>(RULES_GAMES[0]?.shortName ?? 'BO3');
  const [activeTab, setActiveTab] = useState<'general' | 'challenges'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeFilter, setChallengeFilter] = useState<string>('');
  const unified = getUnifiedRulesForGame(selectedGame);

  const challengeFilterOptions = useMemo(() => {
    if (!unified) return [{ value: '', label: 'All challenges' }];
    const types = Object.keys(unified.challengeRulesByType);
    return [
      { value: '', label: 'All challenges' },
      ...types.map((type) => ({ value: type, label: formatChallengeType(type) })),
    ];
  }, [unified]);

  const filteredGeneralSections = useMemo(() => {
    if (!unified) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return unified.generalSections;
    return unified.generalSections
      .map((s) => filterSectionBySearch(s, searchQuery))
      .filter((s): s is RulesSection => s !== null);
  }, [unified, searchQuery]);

  const filteredChallengeSections = useMemo(() => {
    if (!unified) return [];
    const q = searchQuery.trim().toLowerCase();
    let sections = unified.challengeSections;
    if (challengeFilter) {
      const wantTitle = formatChallengeType(challengeFilter);
      sections = sections.filter((s) => s.title === wantTitle);
    }
    if (!q) return sections;
    return sections
      .map((s) => filterSectionBySearch(s, searchQuery))
      .filter((s): s is RulesSection => s !== null);
  }, [unified, searchQuery, challengeFilter]);

  const filteredChallengeByType = useMemo(() => {
    if (!unified) return [];
    const entries = Object.entries(unified.challengeRulesByType);
    let filtered = entries;
    if (challengeFilter) filtered = entries.filter(([type]) => type === challengeFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(
      ([type, desc]) =>
        formatChallengeType(type).toLowerCase().includes(q) || desc.toLowerCase().includes(q)
    );
  }, [unified, searchQuery, challengeFilter]);

  const hasSearchResults =
    activeTab === 'general'
      ? filteredGeneralSections.length > 0
      : filteredChallengeSections.length > 0 || filteredChallengeByType.length > 0;

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
            <h2 className="text-lg font-semibold text-white mb-3">
              Verification & proof
            </h2>
            <div className="space-y-4 text-sm text-white leading-relaxed">
              <p>
                <strong>Full recording required.</strong> To verify a run on CoD Zombies Tracker, you must provide a <strong>full recording of the game</strong> from start to finish. Partial clips or screenshots are not sufficient for verified status.
              </p>
              <p>
                <strong>Verified vs normal logging.</strong> Any run can be logged with proof links for your own tracking. <strong>Verified runs</strong> are reviewed by staff and require proof that covers the entire run and follows all rules for the category (e.g. round milestones, challenge restrictions, platform/client rules where applicable). Verified runs appear on leaderboards and can earn verified XP.
              </p>
              <p>
                <strong>What verified runs require.</strong> Proof must show the run from start to finish and must comply with the official rules for that map/category (game-specific rules, challenge rules, and any client or script requirements listed for that game).
              </p>
              <p>
                <strong>Strict rules (clients, scripts, patches).</strong> Stricter requirements—such as specific clients (e.g. BOIII Community Client) or approved scripts/patches—apply in full to runs that are <strong>within 5% of the world record</strong> for that map and category. For runs outside that margin, <strong>vanilla gameplay is acceptable</strong> as long as the run is <strong>recorded in full</strong> and there is nothing blatantly suspicious in the gameplay. When in doubt, follow the full rules for the category.
              </p>
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
                setSelectedGame(e.target.value);
                setChallengeFilter('');
              }}
              options={RULES_GAMES.map((g) => ({ value: g.shortName, label: g.name }))}
              className="w-full sm:w-64 bg-bunker-800 border-bunker-600 text-white"
            />
          </div>
        </div>

        {unified ? (
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
                {unified.gameName} — Official rules
              </h2>
              <Tabs value={activeTab} onChange={(v) => { setActiveTab(v as 'general' | 'challenges'); setChallengeFilter(''); }} className="w-full" variant="separate">
                <TabsList className="grid w-full grid-cols-2 mb-4 p-2 gap-2">
                  <TabsTrigger value="general" className="py-2 px-3 text-sm">
                    General rules
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="py-2 px-3 text-sm">
                    Challenge rules
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-0 space-y-2">
                  {searchQuery.trim() && !hasSearchResults ? (
                    <p className="text-white text-sm opacity-90">No matches for &quot;{searchQuery.trim()}&quot; in general rules.</p>
                  ) : filteredGeneralSections.length > 0 ? (
                    filteredGeneralSections.map((section) => (
                      <RulesSectionBlock key={section.title} section={section} />
                    ))
                  ) : (
                    <p className="text-white text-sm opacity-90">No general rules defined for this game.</p>
                  )}
                </TabsContent>
                <TabsContent value="challenges" className="mt-0 space-y-4">
                  {unified && (
                    <div className="mb-4">
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
                  )}
                  {searchQuery.trim() && !hasSearchResults ? (
                    <p className="text-white text-sm opacity-90">No matches for &quot;{searchQuery.trim()}&quot; in challenge rules.</p>
                  ) : (
                    <>
                      {filteredChallengeSections.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-white mb-3">Full challenge sections</h3>
                          {filteredChallengeSections.map((section) => (
                            <RulesSectionBlock key={section.title} section={section} />
                          ))}
                        </div>
                      )}
                      <h3 className="text-sm font-semibold text-white mb-2">By category</h3>
                      <ul className="space-y-3">
                        {filteredChallengeByType.map(([type, desc]) => (
                          <li key={type}>
                            <span className="font-medium text-white text-sm">
                              {formatChallengeType(type)}
                            </span>
                            <p className="text-sm text-white mt-0.5 leading-relaxed opacity-90">{desc}</p>
                          </li>
                        ))}
                      </ul>
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
    </div>
  );
}
