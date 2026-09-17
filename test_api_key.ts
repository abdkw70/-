import dotenv from 'dotenv';
dotenv.config();
console.log('API Key exists?', !!process.env.GEMINI_API_KEY);
