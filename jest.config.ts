import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@gasmorph/sdk$": "<rootDir>/packages/sdk/src/index.ts",
    "\\.(css|less|sass|scss)$": "<rootDir>/tests/utils/styleMock.ts",
  },
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  testMatch: [
    "**/tests/**/*.spec.tsx",
    "**/tests/**/*.test.tsx",
    "**/tests/**/*.spec.ts",
    "**/tests/**/*.test.ts",
  ],
};

export default config;
