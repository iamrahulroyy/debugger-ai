#!/usr/bin/env node
/**
 * Schema Codegen Script
 * 
 * Generates TypeScript types and Python Pydantic models from prompt.schema.json
 * 
 * INVARIANT: Adapters must never be manually edited.
 * All changes originate from packages/schema.
 * 
 * Usage: pnpm generate
 * Verify: pnpm generate && git diff --exit-code
 */

import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_PATH = path.join(__dirname, 'prompt.schema.json');
const TS_OUTPUT = path.join(__dirname, '../contracts/src/types.generated.ts');
const PY_OUTPUT = path.join(__dirname, '../py-contracts/promptforge_contracts/models.generated.py');

interface SchemaProperty {
  type?: string;
  enum?: string[];
  const?: string;
  description?: string;
  default?: unknown;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  minLength?: number;
  minimum?: number;
}

interface JsonSchema {
  $comment?: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
}

function loadSchema(): JsonSchema {
  const content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  return JSON.parse(content);
}

function extractVersion(schema: JsonSchema): string {
  const comment = schema.$comment || '';
  const match = comment.match(/v(\d+\.\d+)/);
  return match ? match[1] : '1.0';
}

function generateTypeScript(schema: JsonSchema): string {
  const version = extractVersion(schema);
  const lines: string[] = [
    '/**',
    ' * AUTO-GENERATED - DO NOT EDIT',
    ` * Generated from prompt.schema.json v${version}`,
    ` * Run "pnpm generate" from packages/schema to regenerate`,
    ' */',
    '',
    '// Schema Version',
    `export const SCHEMA_VERSION = "${version}" as const;`,
    '',
  ];

  // Generate enums
  for (const [name, prop] of Object.entries(schema.properties)) {
    if (prop.enum) {
      const enumName = toPascalCase(name);
      lines.push(`export type ${enumName} = ${prop.enum.map(v => `"${v}"`).join(' | ')};`);
      lines.push(`export const ${enumName}Values = [${prop.enum.map(v => `"${v}"`).join(', ')}] as const;`);
      lines.push('');
    }
  }

  // Generate main interface
  lines.push('export interface PromptSchema {');
  for (const [name, prop] of Object.entries(schema.properties)) {
    const isRequired = schema.required.includes(name);
    const tsType = jsonTypeToTs(prop);
    const optional = isRequired ? '' : '?';
    if (prop.description) {
      lines.push(`  /** ${prop.description} */`);
    }
    lines.push(`  ${name}${optional}: ${tsType};`);
  }
  lines.push('}');
  lines.push('');

  // Generate OutputFormat interface if present
  const outputFormat = schema.properties.outputFormat;
  if (outputFormat?.properties) {
    lines.push('export interface OutputFormat {');
    for (const [name, prop] of Object.entries(outputFormat.properties)) {
      const tsType = jsonTypeToTs(prop);
      lines.push(`  ${name}?: ${tsType};`);
    }
    lines.push('}');
  }

  return lines.join('\n');
}

function generatePython(schema: JsonSchema): string {
  const version = extractVersion(schema);
  const lines: string[] = [
    '"""',
    'AUTO-GENERATED - DO NOT EDIT',
    `Generated from prompt.schema.json v${version}`,
    'Run "pnpm generate" from packages/schema to regenerate',
    '"""',
    '',
    'from enum import Enum',
    'from typing import Optional, List',
    'from pydantic import BaseModel, Field',
    '',
    `SCHEMA_VERSION = "${version}"`,
    '',
  ];

  // Generate enums
  for (const [name, prop] of Object.entries(schema.properties)) {
    if (prop.enum) {
      const enumName = toPascalCase(name);
      lines.push(`class ${enumName}(str, Enum):`);
      for (const value of prop.enum) {
        lines.push(`    ${value} = "${value}"`);
      }
      lines.push('');
    }
  }

  // Generate OutputFormat model if present
  const outputFormat = schema.properties.outputFormat;
  if (outputFormat?.properties) {
    lines.push('class OutputFormat(BaseModel):');
    for (const [name, prop] of Object.entries(outputFormat.properties)) {
      const pyType = jsonTypeToPython(prop);
      const defaultVal = prop.default !== undefined ? ` = ${JSON.stringify(prop.default)}` : ' = None';
      lines.push(`    ${toSnakeCase(name)}: Optional[${pyType}]${defaultVal}`);
    }
    lines.push('');
  }

  // Generate main model
  lines.push('class PromptSchema(BaseModel):');
  for (const [name, prop] of Object.entries(schema.properties)) {
    if (name === 'outputFormat') continue;
    const isRequired = schema.required.includes(name);
    const pyType = jsonTypeToPython(prop, name);
    const fieldName = toSnakeCase(name);
    
    if (isRequired) {
      if (prop.const) {
        lines.push(`    ${fieldName}: str = Field(default="${prop.const}", const=True)`);
      } else {
        lines.push(`    ${fieldName}: ${pyType}`);
      }
    } else {
      const defaultVal = prop.default !== undefined ? JSON.stringify(prop.default) : 'None';
      lines.push(`    ${fieldName}: Optional[${pyType}] = ${defaultVal}`);
    }
  }
  
  if (outputFormat) {
    lines.push('    output_format: Optional[OutputFormat] = None');
  }

  return lines.join('\n');
}

function jsonTypeToTs(prop: SchemaProperty): string {
  if (prop.const) return `"${prop.const}"`;
  if (prop.enum) return prop.enum.map(v => `"${v}"`).join(' | ');
  if (prop.type === 'string') return 'string';
  if (prop.type === 'integer' || prop.type === 'number') return 'number';
  if (prop.type === 'boolean') return 'boolean';
  if (prop.type === 'array') return `${jsonTypeToTs(prop.items || { type: 'string' })}[]`;
  if (prop.type === 'object') return 'OutputFormat';
  return 'unknown';
}

function jsonTypeToPython(prop: SchemaProperty, name?: string): string {
  if (prop.enum) return toPascalCase(name || 'Unknown');
  if (prop.type === 'string') return 'str';
  if (prop.type === 'integer') return 'int';
  if (prop.type === 'number') return 'float';
  if (prop.type === 'boolean') return 'bool';
  if (prop.type === 'array') return `List[${jsonTypeToPython(prop.items || { type: 'string' })}]`;
  if (prop.type === 'object') return 'OutputFormat';
  return 'str';
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main(): Promise<void> {
  console.log('Loading schema...');
  const schema = loadSchema();
  const version = extractVersion(schema);
  console.log(`Schema version: ${version}`);

  console.log('Generating TypeScript types...');
  const tsCode = generateTypeScript(schema);
  ensureDir(TS_OUTPUT);
  fs.writeFileSync(TS_OUTPUT, tsCode);
  console.log(`  Written to: ${TS_OUTPUT}`);

  console.log('Generating Python models...');
  const pyCode = generatePython(schema);
  ensureDir(PY_OUTPUT);
  fs.writeFileSync(PY_OUTPUT, pyCode);
  console.log(`  Written to: ${PY_OUTPUT}`);

  console.log('Done!');
}

main().catch(console.error);
