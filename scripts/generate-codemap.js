#!/usr/bin/env node

/**
 * Markify — CODEBASE_MAP.md Generator
 * Scans the project and generates a comprehensive map of the codebase.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const IGNORE = new Set([
  'node_modules', '.next', '.git', 'dist', 'build', '.vercel',
  '.turbo', 'coverage', '.DS_Store',
])

function walk(dir, prefix = '') {
  const entries = []
  let items
  try {
    items = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return entries
  }

  items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  for (const item of items) {
    if (IGNORE.has(item.name)) continue
    const rel = prefix ? `${prefix}/${item.name}` : item.name
    if (item.isDirectory()) {
      entries.push({ type: 'dir', path: rel })
      entries.push(...walk(path.join(dir, item.name), rel))
    } else {
      entries.push({ type: 'file', path: rel })
    }
  }
  return entries
}

function countFiles(entries) {
  return entries.filter(e => e.type === 'file').length
}

function getFilesByExt(entries) {
  const exts = {}
  for (const e of entries) {
    if (e.type !== 'file') continue
    const ext = path.extname(e.path) || '(no ext)'
    exts[ext] = (exts[ext] || 0) + 1
  }
  return Object.entries(exts).sort((a, b) => b[1] - a[1])
}

function findPages(entries) {
  return entries
    .filter(e => e.type === 'file' && e.path.includes('app/') && /page\.(tsx|ts|jsx|js)$/.test(e.path))
    .map(e => {
      const route = e.path
        .replace(/^src\/app/, '')
        .replace(/\/page\.(tsx|ts|jsx|js)$/, '')
        .replace(/\(.*?\)\//g, '')
      return { file: e.path, route: route || '/' }
    })
}

function findApiRoutes(entries) {
  return entries
    .filter(e => e.type === 'file' && e.path.includes('app/api/') && /route\.(tsx|ts|jsx|js)$/.test(e.path))
    .map(e => {
      const route = e.path
        .replace(/^src\/app/, '')
        .replace(/\/route\.(tsx|ts|jsx|js)$/, '')
      return { file: e.path, route }
    })
}

function findComponents(entries) {
  return entries
    .filter(e => e.type === 'file' && e.path.includes('components/') && /\.(tsx|jsx)$/.test(e.path))
    .map(e => e.path)
}

function findStores(entries) {
  return entries
    .filter(e => e.type === 'file' && e.path.includes('stores/') && /\.(ts|tsx)$/.test(e.path))
    .map(e => e.path)
}

function findLibFiles(entries) {
  return entries
    .filter(e => e.type === 'file' && e.path.includes('lib/') && /\.(ts|tsx)$/.test(e.path))
    .map(e => e.path)
}

function buildTree(entries) {
  const lines = []
  const depths = {}
  for (const e of entries) {
    const parts = e.path.split('/')
    const depth = parts.length - 1
    const indent = '  '.repeat(depth)
    const name = parts[parts.length - 1]
    const icon = e.type === 'dir' ? '📁' : '📄'
    lines.push(`${indent}${icon} ${name}`)
  }
  return lines.join('\n')
}

// Main
const entries = walk(ROOT)
const totalFiles = countFiles(entries)
const filesByExt = getFilesByExt(entries)
const pages = findPages(entries)
const apiRoutes = findApiRoutes(entries)
const components = findComponents(entries)
const stores = findStores(entries)
const libFiles = findLibFiles(entries)

const now = new Date().toISOString().split('T')[0]

let md = `# CODEBASE_MAP.md — Markify

> Auto-generated on ${now} by \`scripts/generate-codemap.js\`
> Total files: ${totalFiles}

## Stack

- **Framework**: Next.js 16 (App Router, RSC)
- **UI**: React 19 + Tailwind CSS 4
- **Auth + DB**: Supabase (Auth, PostgreSQL, RLS, Storage)
- **State**: Zustand
- **Language**: TypeScript (strict)
- **i18n**: EN, ES, FR, DE, IT

## File Types

| Extension | Count |
|-----------|-------|
${filesByExt.map(([ext, count]) => `| ${ext} | ${count} |`).join('\n')}

## Pages (${pages.length})

| Route | File |
|-------|------|
${pages.map(p => `| \`${p.route}\` | \`${p.file}\` |`).join('\n')}

## API Routes (${apiRoutes.length})

| Endpoint | File |
|----------|------|
${apiRoutes.map(r => `| \`${r.route}\` | \`${r.file}\` |`).join('\n')}

## Components (${components.length})

${components.map(c => `- \`${c}\``).join('\n')}

## Stores (${stores.length})

${stores.map(s => `- \`${s}\``).join('\n')}

## Libraries (${libFiles.length})

${libFiles.map(l => `- \`${l}\``).join('\n')}

## Database Schema

See \`supabase/migrations/001_markify_foundation.sql\`

Tables: tenants, profiles, api_keys, content_items, certificates, detection_results, usage_logs, webhook_subscriptions, audit_logs

All tables have RLS enabled with tenant_id scoping.

## Directory Tree

\`\`\`
${buildTree(entries)}
\`\`\`
`

fs.writeFileSync(path.join(ROOT, 'CODEBASE_MAP.md'), md)
console.log(`✅ CODEBASE_MAP.md generated (${totalFiles} files)`)
