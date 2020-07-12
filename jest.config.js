module.exports = {
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "@branch\\/(.+)": "<rootDir>/packages/branch/src/$1",
    "@match\\/(.+)": "<rootDir>/packages/match/src/$1",
    "@common\\/(.+)": "<rootDir>/packages/common/src/$1"
  },
  transform: {
    "^.+\\.ts$": "<rootDir>/node_modules/ts-jest"
  },
  testMatch: ["<rootDir>/packages/*/spec/**/*.spec.ts"],
  verbose: true
};
