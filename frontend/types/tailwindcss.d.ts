declare module 'tailwindcss' {
  interface Config {
    darkMode?: string | string[];
    content?: string | string[];
    prefix?: string;
    theme?: {
      extend?: Record<string, any>;
      [key: string]: any;
    };
    plugins?: any[];
  }
  
  const config: Config;
  export default config;
} 