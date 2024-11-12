import path from 'path';

// Simulate __dirname and __filename using process.cwd()
export const __dirname = path.resolve(process.cwd(), 'source');
export const __filename = path.resolve(__dirname, 'filename.ts');  // Replace 'filename.ts' with the file's actual name
