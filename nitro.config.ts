//https://nitro.unjs.io/config
export default defineNitroConfig({
  compatibilityDate: '2025-11-09',
  srcDir: "server",
  runtimeConfig: {
    jwtSecret: "api_token",
    databaseCredentials: "credentials",
  },
  storage: {
    kv: {
      driver: "fs",
      base: "./data/kv"
    }
  },
  esbuild: {
    options: {
      target: "es2020"
    }
  }
});
