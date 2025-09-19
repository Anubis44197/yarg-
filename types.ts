export enum DocumentSource {
  ANAYASA_MAHKEMESI = "Anayasa Mahkemesi",
  YARGITAY = "Yargıtay",
  DANISTAY = "Danıştay",
  BAM = "Bölge Adliye Mahkemeleri",
  BIM = "Bölge İdare Mahkemeleri",
  UYUSMAZLIK_MAHKEMESI = "Uyuşmazlık Mahkemesi",
  YEREL_HUKUK = "Yerel Hukuk Mahkemeleri",
  ISTINAF_HUKUK = "İstinaf Hukuk Mahkemeleri",
  KYB = "Kanun Yararına Bozma",
  EMSAL_UYAP = "Emsal (UYAP)",
  KIK = "KİK (Kamu İhale Kurulu)",
  REKABET_KURUMU = "Rekabet Kurumu",
  SAYISTAY = "Sayıştay",
  KVKK = "KVKK",
  BDDK = "BDDK",
}
// Alias for shorter import
export { DocumentSource as DS };


export interface SearchResultItem {
  id: string;
  title: string;
  source: DocumentSource;
  date: string;
  documentId: string; // E.g., "E. 2023/123, K. 2024/456"
  score: number;
  snippet: string;
}

export interface Document extends SearchResultItem {
  court: string;
  pageContent: string;
}

export interface PaginatedSearchResults {
  items: SearchResultItem[];
  total: number;
  page: number;
  pages: number;
}

export enum AnalysisAction {
  SUMMARIZE = 'SUMMARIZE',
  COMPARE = 'COMPARE',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SearchFilters {
  yargitayDaire?: string;
  danistayDaire?: string;
  sayistayDaire?: string;
  startDate?: string;
  endDate?: string;
}
