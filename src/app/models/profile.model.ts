export interface Profile {
  userId: string | null;
  name: string;
  image?: string;
  description: string;
  stackoverflow?: string;
  github?: string;
  website?: string;
  location: string;
  profession: string;
  joined: any;
  twitter?: string;
  email?: string;
}
