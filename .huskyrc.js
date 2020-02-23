module.exports = {
  hooks: {
    "pre-commit": "yarn lint:fix",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
};
