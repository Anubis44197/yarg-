import type { SearchResultItem, Document, DocumentSource, PaginatedSearchResults, SearchFilters } from '../types';

const API_TIMEOUT = 15000; // 15 seconds

/**
 * Belirtilen kaynaklarda bir arama sorgusu gerçekleştirir.
 * @param sources Arama yapılacak DocumentSource dizisi.
 * @param query Aranacak metin.
 * @param filters Detaylı arama filtreleri (daire, tarih aralığı vb.).
 * @param page Getirilecek sonuç sayfası.
 * @returns Sayfalanmış arama sonuçlarını içeren bir Promise.
 */
export const searchDocuments = async (sources: DocumentSource[], query: string, filters: Partial<SearchFilters>, page: number): Promise<PaginatedSearchResults> => {
  console.log(`Sending search request for "${query}" in sources:`, sources, `with filters:`, filters, `on page: ${page}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sources, query, filters, page }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Sunucu yanıtı okunamadı.' }));
      throw new Error(errorData.message || `Sunucu hatası: ${response.statusText}`);
    }

    const results: PaginatedSearchResults = await response.json();
    return results;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Arama isteği zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }
    console.error('Arama API hatası:', error);
    throw new Error('Arama hizmetine ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
  } finally {
      clearTimeout(timeoutId);
  }
};

/**
 * Belirli bir kaynaktan tek bir belgeyi kimliğine göre getirir.
 * @param source Belgenin bulunduğu DocumentSource.
 * @param id Getirilecek belgenin kimliği.
 * @returns Tam belgenin bir Promise'i.
 */
export const getDocument = async (source: DocumentSource, id: string): Promise<Document> => {
    console.log(`Fetching document with id "${id}" from source "${source}"`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    // Parametreleri URL'ye güvenli bir şekilde eklemek için URLSearchParams kullanın
    const params = new URLSearchParams({ id, source });
    const url = `/api/document?${params.toString()}`;

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Sunucu yanıtı okunamadı.' }));
            throw new Error(errorData.message || `Sunucu hatası: ${response.statusText}`);
        }

        const document: Document = await response.json();
        return document;

    } catch (error) {
         if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Belge detayı isteği zaman aşımına uğradı. Lütfen tekrar deneyin.');
        }
        console.error('Belge getirme API hatası:', error);
        throw new Error('Belge detayları hizmetine ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
    } finally {
        clearTimeout(timeoutId);
    }
};
