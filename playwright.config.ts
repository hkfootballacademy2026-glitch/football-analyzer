import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:60000,workers:1,use:{channel:process.env.PLAYWRIGHT_CHANNEL||undefined,baseURL:'http://127.0.0.1:4173',headless:true,serviceWorkers:'block',viewport:{width:1440,height:1000}},webServer:{command:'npm run preview',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:60000}});

