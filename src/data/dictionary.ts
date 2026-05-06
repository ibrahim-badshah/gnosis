import { algorithmsTerms } from './terms-algorithms';
import { dataStructureTerms } from './terms-data-structures';
import { mlTerms, dbTerms } from './terms-ml-db';
import { webTerms, networkTerms } from './terms-web-net';
import { osTerms, securityTerms } from './terms-os-security';
import { seTerms, plTerms } from './terms-se-pl';
import { cloudTerms, archTerms, aiNlpTerms, cryptoTerms, devopsTerms } from './terms-cloud-misc';
import type { Term } from './types';
import { supabase } from '../utils/supabaseClient';
export type { Term, Category } from './types';
export { categories, categoryIcons } from './types';

// Load any dynamically generated terms from localStorage
function loadDynamicTerms(): Term[] {
  try {
    return JSON.parse(localStorage.getItem('gnosis-dynamic-terms') || '[]');
  } catch {
    return [];
  }
}

export const allTerms: Term[] = [
  ...algorithmsTerms,
  ...dataStructureTerms,
  ...mlTerms,
  ...dbTerms,
  ...webTerms,
  ...networkTerms,
  ...osTerms,
  ...securityTerms,
  ...seTerms,
  ...plTerms,
  ...cloudTerms,
  ...archTerms,
  ...aiNlpTerms,
  ...cryptoTerms,
  ...devopsTerms,
  ...loadDynamicTerms(),
].sort((a, b) => a.word.localeCompare(b.word));

/**
 * Adds a dynamically generated term to the in-memory dictionary.
 * The term is also persisted to localStorage by the generateTerm utility.
 */
export function addDynamicTerm(term: Term) {
  // Avoid duplicates
  if (allTerms.some(t => t.id === term.id)) return;
  allTerms.push(term);
  allTerms.sort((a, b) => a.word.localeCompare(b.word));
}

export function getTermById(id: string) {
  return allTerms.find(t => t.id === id);
}

export function getTermsByCategory(category: string) {
  return allTerms.filter(t => t.category === category);
}

export function searchTerms(query: string) {
  const q = query.toLowerCase();
  return allTerms.filter(t =>
    t.word.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)) ||
    t.category.toLowerCase().includes(q)
  );
}

export function getRelatedTerms(termId: string) {
  const term = getTermById(termId);
  if (!term) return [];
  return term.relatedTerms
    .map(id => getTermById(id))
    .filter(Boolean);
}

export function getCategoryStats() {
  const stats: Record<string, number> = {};
  allTerms.forEach(t => {
    stats[t.category] = (stats[t.category] || 0) + 1;
  });
  return stats;
}

export async function syncDynamicTerms() {
  try {
    const { data, error } = await supabase.from('dynamic_terms').select('term_data');
    if (error) {
      console.error('Failed to fetch dynamic terms from Supabase:', error);
      return false;
    }
    
    let added = false;
    if (data && data.length > 0) {
      data.forEach(row => {
        const term: Term = row.term_data;
        if (!allTerms.some(t => t.id === term.id)) {
          allTerms.push(term);
          added = true;
        }
      });
      if (added) {
        allTerms.sort((a, b) => a.word.localeCompare(b.word));
      }
    }
    return added;
  } catch (err) {
    console.error('Error syncing terms:', err);
    return false;
  }
}
