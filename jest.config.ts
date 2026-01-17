import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],

  moduleFileExtensions: ["ts", "js"],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts"],
}

export default config
