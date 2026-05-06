export type Category =
  | 'Algorithms' | 'Data Structures' | 'Machine Learning' | 'Databases'
  | 'Web Development' | 'Networking' | 'Operating Systems' | 'Security'
  | 'Software Engineering' | 'Programming Languages' | 'Cloud Computing'
  | 'Computer Architecture' | 'AI & NLP' | 'Cryptography' | 'DevOps';

export interface Term {
  id: string;
  word: string;
  category: Category;
  pronunciation: string;
  explanation: { beginner: string; intermediate: string; expert: string };
  codeExample?: { language: string; code: string; description: string };
  relatedTerms: string[];
  historicalContext: string;
  tags: string[];
}

export const categoryIcons: Record<Category, string> = {
  'Algorithms': '', 'Data Structures': '', 'Machine Learning': '',
  'Databases': '', 'Web Development': '', 'Networking': '',
  'Operating Systems': '', 'Security': '', 'Software Engineering': '',
  'Programming Languages': '', 'Cloud Computing': '',
  'Computer Architecture': '', 'AI & NLP': '', 'Cryptography': '', 'DevOps': ''
};

export const categories: Category[] = Object.keys(categoryIcons) as Category[];
