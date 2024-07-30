import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/**/*.spec.ts"],
	format: "esm",
	clean: true,
	dts: false,
	minify: true,
	target: "esnext",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	skipNodeModulesBundle: true,
	ignoreWatch: ["**/ignore/**", "**/node_modules/**", "**/note/**"]
});
