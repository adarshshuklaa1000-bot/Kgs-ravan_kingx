import { 
  ApiCourseItem, 
  ApiCourseDetails, 
  ApiClassroom, 
  ApiClassroomDetail, 
  ApiVideoItem, 
  ApiVideoDetail, 
  ApiPdfItem, 
  ApiTeacher,
  ApiTestItem
} from './services/api';

export type {
  ApiCourseItem, 
  ApiCourseDetails, 
  ApiClassroom, 
  ApiClassroomDetail, 
  ApiVideoItem, 
  ApiVideoDetail, 
  ApiPdfItem, 
  ApiTeacher,
  ApiTestItem
};

export type CategoryFilter = 
  | 'all'
  | 'bpsc'
  | 'upsc'
  | 'ssc_railway'
  | 'teaching'
  | 'tech_special'
  | 'defence'
  | 'tests';

export interface ActiveVideoState {
  videoId: number;
  title: string;
  courseTitle: string;
  courseSlug: string;
  videoDetails: ApiVideoDetail | null;
  loading: boolean;
  error?: string | null;
}

export interface ActivePdfState {
  title: string;
  url: string;
  courseTitle?: string;
}
