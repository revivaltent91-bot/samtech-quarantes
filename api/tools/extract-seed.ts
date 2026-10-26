import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTICLES } from '../../front/lib/articles.ts';
import { PROJECTS } from '../../front/lib/projects.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const articlesPath = resolve(root, 'seed/articles.json');
const projectsPath = resolve(root, 'seed/projects.json');

writeFileSync(articlesPath, JSON.stringify(ARTICLES, null, 2) + '\n');
writeFileSync(projectsPath, JSON.stringify(PROJECTS, null, 2) + '\n');

console.log(`Seed exporté : ${ARTICLES.length} articles, ${PROJECTS.length} projets`);
console.log(`  -> ${articlesPath}`);
console.log(`  -> ${projectsPath}`);