/**
 * Environment Configuration
 * Dev ve Prod ortamlarında farklı ayarların kullanılmasını sağlar
 */

interface EnvironmentConfig {
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  databaseName: string;
  environment: 'development' | 'production';
  isDev: boolean;
  isProd: boolean;
}

function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  
  return {
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    },
    databaseName: process.env.NEXT_PUBLIC_DATABASE_NAME || '(default)',
    environment: env as 'development' | 'production',
    isDev: env === 'development',
    isProd: env === 'production',
  };
}

export const envConfig = getEnvironmentConfig();

export default envConfig;
