import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}


type Callback<T> = (error: Error | null, result: T) => void;

function promisify<T>(fn: (callback: Callback<T>) => void): () => Promise<T>;
function promisify<T, A1>(fn: (arg1: A1, callback: Callback<T>) => void): (arg1: A1) => Promise<T>;
function promisify<T, A1, A2>(fn: (arg1: A1, arg2: A2, callback: Callback<T>) => void): (arg1: A1, arg2: A2) => Promise<T>;

function promisify(fn: Function) {
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      fn(...args, (error: Error | null, result: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

export { promisify }
