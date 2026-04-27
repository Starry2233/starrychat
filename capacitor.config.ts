import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skillhub.chat',
  appName: 'SkillHubChat',
  webDir: 'dist',
  server: {
    // Allow navigation to external APIs for direct fetch calls
    allowNavigation: [
      'www.stockapi.com.cn',
      'stockapi.com.cn',
      'cn.bing.com',
    ],
  },
  ios: {
    contentInset: 'always',
    // Allows arbitrary loads (including HTTP)
    allowsArbitraryLoads: true,
  },
};

export default config;
