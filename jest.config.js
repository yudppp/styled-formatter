module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/test/**/*.test.ts"],
	transform: {
		"^.+\\.(t|j)sx?$": ["@swc/jest"],
	},
};
