import { NextApiRequest } from 'next';

declare module 'next' {
  interface NextApiRequest {
    user?: {
      id: string;
      name: string;
      email: string;
      // Add other user properties as needed
    };
  }
}