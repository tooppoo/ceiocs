module.exports = {
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "@branch\\/(.+)": "<rootDir>/packages/branch/src/$1"
  },
  transform: {
    "^.+\\.ts$": "<rootDir>/node_modules/ts-jest"
  },
  testMatch: ["<rootDir>/packages/*/spec/**/*.spec.ts"],
  verbose: true
};
