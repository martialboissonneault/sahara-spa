#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- Color utility functions (optional but recommended) ---
const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;

// Read the current version of the sahara-spa package to inject it into the template
const frameworkPkgPath = path.resolve(fileURLToPath(import.meta.url), "../../package.json");
const frameworkPkg = JSON.parse(fs.readFileSync(frameworkPkgPath, "utf-8"));

// --- CLI Logic ---

const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];
const force = args.includes("--force") || args.includes("-f");

if (command !== "create" || !projectName) {
  console.error(`Usage: ${red("npx sahara-spa create <project-name>")}`);
  process.exit(1);
}

// Validate the project name to ensure it's a valid package name
const validationRegExp = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
if (!validationRegExp.test(projectName)) {
  console.error(`Error: "${projectName}" is not a valid project name.`);
  console.error("Use lowercase letters, numbers, dashes (-), or underscores (_).");
  process.exit(1);
}

const projectPath = path.resolve(process.cwd(), projectName);
const templatePath = path.resolve(fileURLToPath(import.meta.url), "../../template");

if (fs.existsSync(projectPath) && fs.readdirSync(projectPath).length > 0) {
  if (force) {
    console.log(`Option --force detected. Deleting existing directory: ${projectPath}`);
    fs.rmSync(projectPath, { recursive: true, force: true });
  } else {
    console.error(red(`Error: Directory "${projectName}" already exists and is not empty.`));
    console.error("Use the --force option to overwrite the existing directory.");
    process.exit(1);
  }
}

try {
  console.log(`Creating a new Sahara SPA project in ${blue(projectPath)}...`);

  // Copy the template content
  fs.cpSync(templatePath, projectPath, { recursive: true });

  // --- Post-creation: rename template files ---
  const renameTemplateFile = (from: string, to: string) => {
    const oldPath = path.join(projectPath, from);
    const newPath = path.join(projectPath, to);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  };

  renameTemplateFile("tsconfig.template.json", "tsconfig.json");
  renameTemplateFile("gitignore", ".gitignore");

  // Update the new project's package.json
  const pkgJsonPath = path.join(projectPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

  pkgJson.name = projectName;
  // Replace placeholder dependency with the real one
  delete pkgJson.dependencies["@sahara/spa"];
  pkgJson.dependencies[frameworkPkg.name] = `^${frameworkPkg.version}`;

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
} catch (error) {
  console.error(red("\nAn error occurred while creating the project."));
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

console.log(green("\nSuccess! Your project is ready."));
console.log("\nNext steps:");
console.log(`  cd ${projectName}`);
console.log("  npm install");
console.log("  npm run dev");
