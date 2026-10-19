// Real live API service connecting to Khan Global Studies backend

export interface ApiCourseItem {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  start_at: string;
  end_at: string;
  price: string;
  cat_id: number;
}

export interface ApiTeacher {
  id: number;
  name: string;
  image: string;
  content: string | null;
  designation: string;
}

export interface ApiClassroom {
  id: number;
  name: string;
  created_at?: string;
  video: number;
  note: number;
}

export interface ApiCourseDetails {
  id: number;
  slug: string;
  lang: number | string;
  title: string;
  price: string;
  end_at: string;
  start_at: string;
  classrooms: ApiClassroom[];
  teachers: ApiTeacher[];
  image?: string;
  details?: { overview?: string } | string;
}

export interface ApiVideoItem {
  id: number;
  name: string;
  published_at: string | null;
  thumb: string | null;
  type: string;
  duration?: string;
}

export interface ApiPdfItem {
  id?: number;
  title?: string;
  name?: string;
  url?: string;
  file_url?: string;
  published_at?: string | null;
  thumb?: string | null;
  type?: string;
  pages?: number;
  size?: string;
}

export interface ApiClassroomDetail {
  course_id: number;
  id: number;
  name: string;
  notes: ApiPdfItem[];
  videos: ApiVideoItem[];
}

export interface ApiVideoDetail {
  id: number;
  name: string;
  is_live: number;
  pdfs: { title: string; url: string }[] | null;
  published_at: string | null;
  mp4s: Record<string, string> | any[] | null;
  video_url?: string;
  hd_video_url?: string;
  download_url?: string;
}

export interface ApiTestItem {
  id: number;
  slug: string;
  lang?: string;
  title: string;
  thumb: string;
  price: string;
  total_quizzes: number;
  total_questions: number;
  published_at: string;
  expired_at: string;
}

const UPSTREAM_URL = 'https://apicf.udemylover.workers.dev';

async function safeFetch<T>(endpoint: string): Promise<T | null> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Attempt 1: Local /api proxy
  try {
    const res = await fetch(cleanEndpoint, {
      headers: { Accept: 'application/json, text/plain, */*' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to direct upstream
  }

  // Attempt 2: Direct upstream workers URL
  try {
    const directUrl = `${UPSTREAM_URL}${cleanEndpoint}`;
    const res = await fetch(directUrl, {
      headers: { Accept: 'application/json, text/plain, */*' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Direct API fetch failed:', err);
  }

  return null;
}

export const kgsApi = {
  // Fetch real courses list with high limit (loads all 956 batches)
  async getCourses(page = 1, limit = 1000): Promise<{ items: ApiCourseItem[]; total: number }> {
    const res = await safeFetch<any>(`/api/courses/?page_id=${page}&batch_id=0&limit=${limit}`);
    if (res && res.data) {
      if (Array.isArray(res.data)) {
        return { items: res.data, total: res.total || res.data.length };
      }
      if (res.data.items && Array.isArray(res.data.items)) {
        return { items: res.data.items, total: res.data.total || res.data.items.length };
      }
    }
    return { items: [], total: 0 };
  },

  // Fetch full course details by slug (classrooms/subjects, teachers, syllabus)
  async getCourseDetails(slug: string): Promise<ApiCourseDetails | null> {
    const res = await safeFetch<any>(`/api/courses/${encodeURIComponent(slug)}`);
    if (res && res.data) {
      return res.data;
    }
    return null;
  },

  // Fetch classroom/subject content (videos and pdfs)
  async getClassroom(courseId: number | string, classroomId: number | string): Promise<ApiClassroomDetail | null> {
    const res = await safeFetch<any>(`/api/courses/${courseId}/${classroomId}`);
    if (res && res.data) {
      return res.data;
    }
    return null;
  },

  // Fetch video details (YouTube url, MP4 stream, attached PDFs)
  async getVideoDetails(videoId: number | string): Promise<ApiVideoDetail | null> {
    const res = await safeFetch<any>(`/api/courses/video/${videoId}`);
    if (res && res.data) {
      return res.data;
    }
    return null;
  },

  // Fetch tests list
  async getTests(page = 1): Promise<{ items: ApiTestItem[]; total: number }> {
    const res = await safeFetch<any>(`/api/tests/?page_id=${page}`);
    if (res && res.data) {
      if (Array.isArray(res.data)) {
        return { items: res.data, total: res.total || res.data.length };
      }
      if (res.data.items && Array.isArray(res.data.items)) {
        return { items: res.data.items, total: res.data.total || res.data.items.length };
      }
    }
    return { items: [], total: 0 };
  }
};

// Helper: extract YouTube ID
export function extractYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match && match[1] ? match[1] : null;
}

// Helper: format price in English
export function formatPrice(price?: string | number | null): string {
  if (price === undefined || price === null || price === '') return 'Free';
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(num) || num === 0) return 'Free';
  return `₹${num.toLocaleString('en-IN')}`;
}

// Helper: format date in English
export function formatEnglishDate(dateStr?: string | null): string {
  if (!dateStr) return 'Active';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
