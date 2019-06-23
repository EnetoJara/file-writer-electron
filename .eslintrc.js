module.exports = {
	extends: ["eslint:recommended", "plugin:node/recommended"],
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
	},
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly",
	},
	parserOptions: {
		souceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
	},
	settings: {
		polyfills: ["promises"],
		"import/resolver": {
			node: {
				moduleDirectory: "node_modules",
			},
		},
	},
	plugins: ["import", "node", "prettier", "react"],
	rules: {
		indent: ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"space-before-function-paren": ["error", "always"],
		"keyword-spacing": [
			"error",
			{
				before: true,
				after: true,
			},
		],
		"arrow-body-style": ["error", "as-needed"],
		"arrow-parens": ["error", "always"],
		"comma-spacing": [
			"error",
			{
				before: false,
				after: true,
			},
		],
		"object-curly-spacing": [
			"error",
			"always",
			{
				arraysInObjects: false,
			},
		],
		"template-curly-spacing": ["error", "always"],
		"comma-dangle": [
			"error",
			{
				arrays: "never",
				objects: "always",
				imports: "never",
				exports: "never",
				functions: "ignore",
			},
		],
		"block-spacing": ["error", "always"],
		"no-else-return": "error",
		"no-nested-ternary": "error",
		"require-await": "error",
		"arrow-spacing": [
			"error",
			{
				before: true,
				after: true,
			},
		],
		"prefer-const": 0,
		"no-var": 0,
		"no-use-before-define": "error",
		"linebreak-style": ["error", "unix"],
	},
};
