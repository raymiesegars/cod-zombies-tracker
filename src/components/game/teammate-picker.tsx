'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Avatar } from '@/components/ui/avatar';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import { getRankForLevel, getRankIconPath } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { Search, UserPlus, X } from 'lucide-react';

export type TeammateUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
  level?: number;
};

export type TeammatePickerValue = {
  teammateUserIds: string[];
  teammateNonUserNames: string[];
};

type TeammatePickerProps = {
  value: TeammatePickerValue;
  onChange: (value: TeammatePickerValue) => void;
  disabled?: boolean;
  /** Max total teammates (users + non-users) */
  maxTeammates?: number;
  className?: string;
  /** Optional: pre-filled user details for display (e.g. from loaded log) */
  userDetails?: TeammateUser[];
  /** Current user id – excluded from search and cannot be added as teammate */
  currentUserId?: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export function TeammatePicker({
  value,
  onChange,
  disabled = false,
  maxTeammates = 10,
  className,
  userDetails = [],
  currentUserId,
}: TeammatePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TeammateUser[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [nonUserInput, setNonUserInput] = useState('');
  const [showNonUserInput, setShowNonUserInput] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const addedBySearchRef = useRef<Record<string, TeammateUser>>({});

  const selectedUsers: TeammateUser[] = value.teammateUserIds.map((id) => {
    return (
      addedBySearchRef.current[id] ??
      userDetails.find((u) => u.id === id) ??
      { id, username: id, displayName: null }
    );
  });
  const selectedNonUserNames = value.teammateNonUserNames;
  const totalSelected = selectedUsers.length + selectedNonUserNames.length;
  const canAdd = totalSelected < maxTeammates;

  const fetchSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q.trim())}&limit=15`, {
        credentials: 'same-origin',
      });
      const data = await res.json();
      const users = (data.users ?? []) as (TeammateUser & { level?: number })[];
      setSearchResults(users);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearch(searchQuery);
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addUser = (user: TeammateUser) => {
    if (currentUserId && user.id === currentUserId) return;
    if (value.teammateUserIds.includes(user.id) || !canAdd) return;
    addedBySearchRef.current[user.id] = { ...user };
    onChange({
      teammateUserIds: [...value.teammateUserIds, user.id],
      teammateNonUserNames: value.teammateNonUserNames,
    });
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  const removeUser = (id: string) => {
    delete addedBySearchRef.current[id];
    onChange({
      teammateUserIds: value.teammateUserIds.filter((x) => x !== id),
      teammateNonUserNames: value.teammateNonUserNames,
    });
  };

  const addNonUser = () => {
    const name = nonUserInput.trim();
    if (!name || value.teammateNonUserNames.includes(name) || !canAdd) return;
    onChange({
      teammateUserIds: value.teammateUserIds,
      teammateNonUserNames: [...value.teammateNonUserNames, name],
    });
    setNonUserInput('');
    setShowNonUserInput(false);
  };

  const removeNonUser = (name: string) => {
    onChange({
      teammateUserIds: value.teammateUserIds,
      teammateNonUserNames: value.teammateNonUserNames.filter((x) => x !== name),
    });
  };

  return (
    <div ref={wrapperRef} className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-bunker-200">Teammates</label>
      <p className="text-xs text-bunker-500 mb-2">
        Search for users on the site or add a name for someone not registered.
      </p>

      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((u) => {
          const level = u.level ?? 1;
          const rank = getRankForLevel(level);
          const rankIcon = rank ? getRankIconPath(rank.icon) : null;
          const displayName = u.displayName || u.username;
          return (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-bunker-800 border border-bunker-600 pl-1 pr-2 py-1 text-sm min-w-0 max-w-full"
            >
              {rankIcon && (
                <span className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded flex items-center justify-center" title={`Level ${level}`}>
                  <Image
                    src={rankIcon}
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </span>
              )}
              <Avatar
                src={getDisplayAvatarUrl({ avatarUrl: u.avatarUrl, avatarPreset: u.avatarPreset })}
                fallback={displayName}
                size="sm"
                className="shrink-0"
              />
              <span className="text-bunker-200 truncate min-w-0 max-w-[100px] sm:max-w-[160px]">
                {displayName}
              </span>
              <span className="text-xs text-bunker-400 shrink-0">Lvl {level}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeUser(u.id)}
                  className="rounded-full p-0.5 text-bunker-400 hover:text-white hover:bg-bunker-600 transition-colors shrink-0"
                  aria-label={`Remove ${displayName}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          );
        })}
        {selectedNonUserNames.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-2 rounded-full bg-bunker-800/80 border border-bunker-600 pl-2 pr-2 py-1 text-sm text-bunker-300"
          >
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{name}</span>
            <span className="text-xs text-bunker-500">(not on site)</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeNonUser(name)}
                className="rounded-full p-0.5 text-bunker-400 hover:text-white hover:bg-bunker-600 transition-colors"
                aria-label={`Remove ${name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        ))}
      </div>

      {!disabled && canAdd && (
        <div className="flex flex-col sm:flex-row gap-2">
          {/* User search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bunker-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
              placeholder="Search users..."
              className="w-full bg-bunker-800 border border-bunker-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-bunker-500 focus:outline-none focus:ring-2 focus:ring-blood-500/50 focus:border-blood-600"
              role="combobox"
              aria-expanded={searchOpen}
              aria-autocomplete="list"
              aria-controls="teammate-search-results"
            />
            {searchOpen && searchQuery.trim().length >= 2 && (
              <ul
                id="teammate-search-results"
                role="listbox"
                className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-bunker-600 bg-bunker-900 shadow-xl py-1"
              >
                {searching ? (
                  <li className="px-3 py-4 text-center text-sm text-bunker-500">Searching...</li>
                ) : searchResults.length === 0 ? (
                  <li className="px-3 py-4 text-center text-sm text-bunker-500">No users found</li>
                ) : (
                  searchResults
                    .filter((u) => !value.teammateUserIds.includes(u.id) && u.id !== currentUserId)
                    .map((u) => {
                      const level = u.level ?? 1;
                      const rank = getRankForLevel(level);
                      const rankIcon = rank ? getRankIconPath(rank.icon) : null;
                      return (
                        <li
                          key={u.id}
                          role="option"
                          aria-selected={false}
                          className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 cursor-pointer hover:bg-bunker-800 text-left min-w-0"
                          onClick={() => addUser(u)}
                        >
                          {rankIcon && (
                            <span className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded flex items-center justify-center" title={`Level ${level}`}>
                              <Image
                                src={rankIcon}
                                alt=""
                                width={36}
                                height={36}
                                className="w-full h-full object-contain"
                              />
                            </span>
                          )}
                          <Avatar
                            src={getDisplayAvatarUrl({ avatarUrl: u.avatarUrl, avatarPreset: u.avatarPreset })}
                            fallback={u.displayName || u.username}
                            size="sm"
                            className="shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {u.displayName || u.username}
                            </p>
                            <p className="text-xs text-bunker-500 truncate">@{u.username}</p>
                          </div>
                          {u.level != null && (
                            <span className="text-xs text-blood-400 font-medium shrink-0">Lvl {u.level}</span>
                          )}
                        </li>
                      );
                    })
                )}
              </ul>
            )}
          </div>
          {/* Add non-user */}
          {!showNonUserInput ? (
            <button
              type="button"
              onClick={() => setShowNonUserInput(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-bunker-600 bg-bunker-800 px-3 py-2 text-sm text-bunker-300 hover:bg-bunker-700 hover:text-white transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Add non-user
            </button>
          ) : (
            <div className="flex gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={nonUserInput}
                onChange={(e) => setNonUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNonUser();
                  }
                  if (e.key === 'Escape') {
                    setShowNonUserInput(false);
                    setNonUserInput('');
                  }
                }}
                placeholder="Name (not on site)"
                className="flex-1 min-w-0 bg-bunker-800 border border-bunker-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-bunker-500 focus:outline-none focus:ring-2 focus:ring-blood-500/50"
                autoFocus
              />
              <button
                type="button"
                onClick={addNonUser}
                className="rounded-lg bg-blood-600 hover:bg-blood-500 px-3 py-2 text-sm font-medium text-white shrink-0"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowNonUserInput(false); setNonUserInput(''); }}
                className="rounded-lg border border-bunker-600 px-3 py-2 text-sm text-bunker-400 hover:text-white shrink-0"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      {!canAdd && (
        <p className="text-xs text-bunker-500">Maximum teammates reached ({maxTeammates}).</p>
      )}
    </div>
  );
}
