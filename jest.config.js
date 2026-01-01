module.exports = {
  preset: "jest-expo",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // This helps Jest ignore files that shouldn't be tested
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/"
  ]
};