#!/usr/bin/env node
/**
 * generate-erd.js — Genera archivos erd.json v3.0.0 (ERD Editor / dineug)
 * a partir de los CREATE TABLE / ALTER TABLE / CREATE INDEX del SQL dado.
 *
 * Uso:
 *   node scripts/generate-erd.js <sqlFile|dir>... -o <salida.json> [--dbname <nombre>]
 *
 * Replica el output del importador "Schema SQL" del editor
 * (packages/erd-editor/src/utils/schema-sql-parser/index.ts) para PostgreSQL:
 *   - database: 16 (PostgreSQL), databaseName personalizable
 *   - ColumnOption: autoIncrement=1, primaryKey=2, unique=4, notNull=8
 *   - ColumnUIKey: primaryKey=1, foreignKey=2
 *   - Relationship: ZeroN=4, dash=2, direction bottom=8
 *   - Orden de columnas = orden del DDL; layouts auto (grid)
 * Diferencias deliberadas: las REFERENCES inline de columna también generan
 * relación (el importador oficial solo las crea con FOREIGN KEY de tabla) y
 * se incluye una tabla sintética "users" cuando hay FK a auth.users.
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_URL =
  'https://raw.githubusercontent.com/dineug/erd-editor/main/json-schema/schema.json';
const VERSION = '3.0.0';
const COLUMN_MIN_WIDTH = 60;
const CANVAS_SIZE_MIN = 2000;
const CHARSET_ID = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
const COLUMN_ORDER = [1, 2, 4, 8, 16, 32, 64];

const ColumnOption = { autoIncrement: 1, primaryKey: 2, unique: 4, notNull: 8 };
const ColumnUIKey = { primaryKey: 1, foreignKey: 2 };
const OrderType = { ASC: 1, DESC: 2 };

function hashSeed(input) {
  let h1 = 0xdeadbeef ^ 197;
  let h2 = 0x41c6ce57 ^ 197;
  const str = String(input);
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h2 >>> 0, h1 >>> 0];
}

function nanoid(seed, size = 21) {
  const [a, b] = hashSeed(seed);
  let state = b >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let acc = a >>> 0;
  let id = '';
  for (let i = 0; i < size; i++) {
    if (i % 4 === 0) acc = (next() * 4294967296 + a) >>> 0;
    id += CHARSET_ID[acc % CHARSET_ID.length];
    acc = (acc * 31 + b) >>> 0;
  }
  return id;
}

function meta(seed) {
  const [a] = hashSeed(String(seed || ''));
  const t = 1780000000000 + (a % 200000000);
  return { updateAt: t, createAt: t };
}

function lowerName(name) {
  return String(name || '').toUpperCase();
}

function findByName(list, name) {
  const needle = lowerName(name);
  for (const item of list) {
    if (lowerName(item.name) === needle) return item;
  }
  return null;
}

function findTableByRef(list, refTableName) {
  const needle = lowerName(refTableName);
  for (const item of list) {
    if (lowerName(item.name) === needle) return item;
    if (item.nameSimple && lowerName(item.nameSimple) === needle) return item;
  }
  return null;
}

function toWidthApprox(text) {
  if (!text) return COLUMN_MIN_WIDTH;
  return Math.max(COLUMN_MIN_WIDTH, Math.round(String(text).length * 6.5) + 2);
}

function toWidthDataType(text) {
  if (!text) return COLUMN_MIN_WIDTH;
  return Math.max(COLUMN_MIN_WIDTH, Math.round(String(text).length * 7.5) + 2);
}

function stripComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ');
}

function stripSchema(name) {
  const trimmed = String(name).trim();
  const parts = trimmed.split('.');
  return parts[parts.length - 1].replace(/"/g, '').replace(/`/g, '');
}

function splitTopLevel(text, delimiter = ',') {
  const parts = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inSingle) {
      current += ch;
      if (ch === "'" && next === "'") {
        current += next;
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      current += ch;
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      current += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      current += ch;
      continue;
    }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === delimiter && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim() !== '') parts.push(current);
  return parts;
}

function tokenizeColumn(rest) {
  const tokens = [];
  let i = 0;
  const text = String(rest);
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      let value = "";
      let closed = false;
      while (j < text.length) {
        if (text[j] === "'" && text[j + 1] === "'") {
          value += "'";
          j += 2;
          continue;
        }
        if (text[j] === "'") {
          closed = true;
          j++;
          break;
        }
        value += text[j];
        j++;
      }
      tokens.push({ type: "str", value, raw: text.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '(') {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '(') depth++;
        else if (text[j] === ')') depth--;
        j++;
      }
      const raw = text.slice(i, j);
      tokens.push({ type: "paren", value: raw.slice(1, -1), raw });
      i = j;
      continue;
    }
    if (/[A-Za-z0-9_]/.test(ch) || ch === '"') {
      let j = i;
      if (ch === '"') {
        j++;
        while (j < text.length && text[j] !== '"') j++;
        j++;
      } else {
        while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++;
      }
      tokens.push({ type: "word", value: text.slice(i, j).replace(/"/g, ""), raw: text.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === ':' && text[i + 1] === ':') {
      tokens.push({ type: "cast", value: "::", raw: "::" });
      i += 2;
      continue;
    }
    tokens.push({ type: "punct", value: ch, raw: ch });
    i++;
  }
  return tokens;
}

const TYPE_END_WORDS = new Set([
  "NOT", "NULL", "PRIMARY", "KEY", "UNIQUE", "REFERENCES", "DEFAULT",
  "GENERATED", "AS", "IDENTITY", "CHECK", "CONSTRAINT", "COLLATE", "ON",
  "DELO", "COMMENT", "USING",
]);

function parseColumnGroup(rest0) {
  let text = String(rest0 || '').trim().replace(/\s+/g, ' ');

  const constraintBlocks = [];
  text = text.replace(/CONSTRAINT\s+[a-zA-Z0-9_"]+\s+CHECK\s*\([\s\S]*?\)(?=\s*COLLATE|\s*$)/gi, () => {
    constraintBlocks.push('CHECK');
    return ' ';
  });
  text = text.replace(/CHECK\s*\([\s\S]*?\)(?=\s*NOT|\s*DEFAULT|\s*MONITOR|\s*$)/gi, () => {
    constraintBlocks.push('CHECK');
    return ' ';
  });
  text = text.replace(/COLLATE\s+[a-zA-Z0-9_"][\s\S]*?\./g, ' ');

  const nameMatch = text.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\b/);
  const name = nameMatch ? nameMatch[1] : '';
  const afterName = text.slice(nameMatch ? nameMatch[0].length : 0);

  const tokens = tokenizeColumn(afterName);

  const result = {
    name,
    dataType: '',
    default: '',
    comment: '',
    primaryKey: false,
    autoIncrement: false,
    unique: false,
    nullable: true,
    refTable: '',
    refColumns: [],
  };

  let idx = 0;

  const norm = () => (tokens[idx] ? tokens[idx].value.toUpperCase() : '');

  while (idx < tokens.length && !TYPE_END_WORDS.has(norm())) {
    const t = tokens[idx];
    if (t.type === 'paren') {
      result.dataType += '(' + t.value + ')';
      idx++;
      continue;
    }
    if (t.type === 'cast') {
      result.dataType += '::';
      idx++;
      continue;
    }
    result.dataType += (result.dataType ? ' ' : '') + t.value;
    idx++;
  }

  result.dataType = result.dataType.trim();

  while (idx < tokens.length) {
    const tok = tokens[idx];
    const word = tok.type === 'word' ? tok.value.toUpperCase() : (tok.type === 'str' ? "'" + tok.value + "'" : tok.type === 'paren' ? '(...)' : tok.value);

    if (word === 'NOT' && tokens[idx + 1] && tokens[idx + 1].value.toUpperCase() === 'NULL') {
      result.nullable = false;
      idx += 2;
      continue;
    }
    if (word === 'NULL') {
      result.nullable = true;
      idx++;
      continue;
    }
    if (word === 'PRIMARY' && tokens[idx + 1] && tokens[idx + 1].value.toUpperCase() === 'KEY') {
      result.primaryKey = true;
      idx += 2;
      continue;
    }
    if (word === 'KEY' && result.primaryKey) {
      idx++;
      continue;
    }
    if (word === 'UNIQUE') {
      result.unique = true;
      idx++;
      continue;
    }
    if (word === 'DEFAULT') {
      idx++;
      if (tokens[idx]) {
        const t = tokens[idx];
        if (t.type === 'str') {
          result.default = t.value;
        } else if (t.type === 'paren') {
          result.default = 'NOW';
        } else {
          result.default = t.value;
        }
        idx++;
      }
      continue;
    }
    if (word === 'REFERENCES') {
      idx++;
      while (idx < tokens.length && tokens[idx].type === 'cast') idx++;
      if (tokens[idx] && tokens[idx].type === 'word') {
        result.refTable = tokens[idx].value;
        idx++;
        if (tokens[idx] && tokens[idx].type === 'punct' && tokens[idx].value === '.') {
          idx++;
          if (tokens[idx] && tokens[idx].type === 'word') {
            result.refTable = tokens[idx].value;
            idx++;
          }
        }
        if (tokens[idx] && tokens[idx].type === 'paren') {
          result.refColumns = tokens[idx].value.split(',').map(c => c.trim()).filter(Boolean);
          idx++;
        }
      }
      continue;
    }
    if (word === 'AS' || word === 'IDENTITY' || word === 'GENERATED') {
      idx++;
      continue;
    }
    if (word === 'CHECK' || word === 'CONSTRAINT' || word === 'COLLATE' || word === 'ON') {
      idx++;
      if (word === 'ON' && tokens[idx] && tokens[idx].type === 'word') idx++;
      continue;
    }
    idx++;
    if ((word === 'ON' || word === 'USING') && result.refTable && idx < tokens.length && tokens[idx].type === 'str') idx++;
  }

  if (!result.dataType) {
    return null;
  }

  return result;
}

function parseCreateTable(stmt) {
  const m = stmt.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([^\s(]+)/i) ||
    stmt.match(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/i);
  if (!m) return null;

  const rawName = (m[1] || m[2] || '').replace(/IF\s+NOT\s+EXISTS/i, '').trim();
  const name = stripSchema(rawName);
  const rawParts = rawName.split('.');
  const schema = rawParts.length > 1 ? rawParts[0].replace(/"/g, '') : '';
  const ifNotExists = /IF\s+NOT\s+EXISTS/i.test(stmt);

  const bodyMatch = stmt.match(/\(([\s\S]*)\)\s*;?\s*$/);
  if (!bodyMatch) {
    return null;
  }

  const body = bodyMatch[1];
  const defs = splitTopLevel(body);

  const table = {
    name,
    schema,
    comment: '',
    columns: [],
    indexes: [],
    foreignKeys: [],
    ifNotExists,
  };

  for (const def of defs) {
    const trimmed = def.trim();
    if (!trimmed) continue;

    const pkMatch = trimmed.match(/^PRIMARY\s+KEY\s*\(([^)]*)\)/i);
    const fkMatch = trimmed.match(/^FOREIGN\s+KEY\s*\(([^)]*)\)\s+REFERENCES\s+([^\s]+)\s*(?:\(([^)]*)\))?/i);
    const uniqMatch = trimmed.match(/^UNIQUE\s*\(([^)]*)\)/i);
    const checkMatch = trimmed.match(/^CHECK\s*\(/i);
    const constrMatch = trimmed.match(/^CONSTRAINT\b/i);

    if (pkMatch) {
      pkMatch[1]
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
        .forEach(colName => {
          const col = findByName(table.columns, colName);
          if (col) col.primaryKey = true;
        });
      continue;
    }

    if (fkMatch) {
      const columnNames = fkMatch[1].split(',').map(c => c.trim());
      const refSchema = fkMatch[2].split('.');
      const refTableName = refSchema[refSchema.length - 1].replace(/"/g, '');
      const refColumnNames = fkMatch[3]
        ? fkMatch[3].split(',').map(c => c.trim())
        : [];
      if (columnNames.length && columnNames.length === refColumnNames.length) {
        table.foreignKeys.push({
          columnNames,
          refTableName,
          refColumnNames,
        });
        columnNames.forEach(colName => {
          const col = findByName(table.columns, colName);
          if (col && col.refTable === '') {
            col.refTable = refTableName;
            col.refColumns = refColumnNames;
          }
        });
      }
      continue;
    }

    if (uniqMatch) {
      uniqMatch[1]
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
        .forEach(colName => {
          const col = findByName(table.columns, colName);
          if (col) col.unique = true;
        });
      continue;
    }

    if (checkMatch || constrMatch) {
      continue;
    }

    const col = parseColumnGroup(trimmed);
    if (col && (col.name || col.dataType)) {
      table.columns.push(col);
    }
  }

  return table;
}

function parseCreateIndex(stmt) {
  const unique = /CREATE\s+UNIQUE\s+INDEX/i.test(stmt);
  const m = stmt.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s.]+)\s+ON\s+([^\s(]+)\s*(?:\(([^)]*)\))?/i);
  if (!m) return null;

  const rawTable = m[2].replace(/"/g, '');
  const tableSchema = rawTable.split('.');
  const indexColumns = (m[3] || '')
    .split(',')
    .map(c =>
      c
        .trim()
        .replace(/\s+(ASC|DESC)\b.*$/i, ' $1')
        .trim()
    )
    .filter(Boolean);

  return {
    name: m[1].replace(/"/g, ''),
    tableName: tableSchema[tableSchema.length - 1],
    unique,
    columns: indexColumns.map(colRaw => {
      const sortMatch = colRaw.match(/^(.*?)\s+(ASC|DESC)$/i);
      return {
        name: (sortMatch ? sortMatch[1] : colRaw).replace(/"/g, ''),
        sort: sortMatch && sortMatch[2].toUpperCase() === 'DESC' ? 'desc' : 'asc',
      };
    }),
  };
}

function parseAlterTable(stmt) {
  if (!/ALTER\s+TABLE/i.test(stmt)) return null;
  const tableMatch = stmt.match(/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?([^\s]+)/i);
  if (!tableMatch) return null;
  const rawTable = tableMatch[1].replace(/"/g, '');
  const schemaParts = rawTable.split('.');
  const tableName = schemaParts[schemaParts.length - 1];

  if (/SET\s+SCHEMA/i.test(stmt)) {
    return { type: 'setSchema', tableName };
  }

  const colMatch = stmt.match(/ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([\s\S]+)$/i);
  if (colMatch) {
    const cols = splitTopLevel(colMatch[1]).map(c => parseColumnGroup(c)).filter(Boolean);
    return { type: 'addColumn', tableName, columns: cols };
  }

  const pkMatch = stmt.match(/ADD\s+(?:CONSTRAINT\s+[^\s]+\s+)?PRIMARY\s+KEY\s*\(([^)]*)\)/i);
  if (pkMatch) {
    return {
      type: 'addPrimaryKey',
      tableName,
      columns: pkMatch[1].split(',').map(c => c.trim().replace(/"/g, '')),
    };
  }

  const uniqMatch = stmt.match(/ADD\s+(?:CONSTRAINT\s+[^\s]+\s+)?UNIQUE\s*\(([^)]*)\)/i);
  if (uniqMatch) {
    return {
      type: 'addUnique',
      tableName,
      columns: uniqMatch[1].split(',').map(c => c.trim().replace(/"/g, '')),
    };
  }

  const fkMatch = stmt.match(
    /ADD\s+(?:CONSTRAINT\s+[^\s]+\s+)?FOREIGN\s+KEY\s*\(([^)]*)\)\s+REFERENCES\s+([^\s]+)\s*(?:\(([^)]*)\))?/i
  );
  if (fkMatch) {
    const refSchema = fkMatch[2].split('.');
    return {
      type: 'addForeignKey',
      tableName,
      columnNames: fkMatch[1].split(',').map(c => c.trim().replace(/"/g, '')),
      refTableName: refSchema[refSchema.length - 1],
      refColumnNames: fkMatch[3]
        ? fkMatch[3].split(',').map(c => c.trim().replace(/"/g, ''))
        : [],
    };
  }

  return null;
}

function splitStatements(sqlText) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inDollar = null;

  for (let i = 0; i < sqlText.length; i++) {
    const ch = sqlText[i];
    const next = sqlText[i + 1];

    if (inDollar) {
      current += ch;
      if (ch === '$' && sqlText.startsWith(inDollar, i)) {
        current += inDollar.slice(1);
        i += inDollar.length - 1;
        inDollar = null;
      }
      continue;
    }

    if (inSingle) {
      current += ch;
      if (ch === "'" && next === "'") {
        current += next;
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      current += ch;
      if (ch === '"') inDouble = false;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      current += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      current += ch;
      continue;
    }
    if (ch === '$') {
      const m = sqlText.slice(i).match(/^\$[a-zA-Z0-9_]*\$/);
      if (m) {
        inDollar = m[0];
        current += m[0];
        i += m[0].length - 1;
        continue;
      }
    }
    if (ch === ';') {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }
    current += ch;
  }

  const last = current.trim();
  if (last) statements.push(last);
  return statements;
}

function collectSqlFiles(sources) {
  const files = [];
  for (const source of sources) {
    const full = path.resolve(source);
    if (fs.statSync(full).isDirectory()) {
      files.push(
        ...fs
          .readdirSync(full)
          .filter(f => f.endsWith('.sql'))
          .sort()
          .map(f => path.join(full, f))
      );
    } else {
      files.push(full);
    }
  }
  return files;
}

function buildSchema(sqlText) {
  const parsers = [];
  const statements = splitStatements(sqlText);

  for (const stmt of statements) {
    if (/^CREATE\s+TABLE/i.test(stmt)) {
      const t = parseCreateTable(stmt);
      if (t) parsers.push({ type: 'createTable', table: t });
    } else if (/^CREATE\s+(?:UNIQUE\s+)?INDEX/i.test(stmt)) {
      const idx = parseCreateIndex(stmt);
      if (idx) parsers.push({ type: 'createIndex', index: idx });
    } else if (/^ALTER\s+TABLE/i.test(stmt)) {
      const alt = parseAlterTable(stmt);
      if (alt) parsers.push({ type: 'alter', alter: alt });
    }
  }

  const tables = [];
  const syntheticIndexes = [];

  for (const p of parsers) {
    if (p.type === 'createTable') {
      const existing = findByName(tables, p.table.name);
      if (existing && p.table.ifNotExists && existing.schema === p.table.schema) continue;
      if (existing && existing.schema === p.table.schema) {
        const idx = tables.indexOf(existing);
        tables[idx] = p.table;
      } else {
        tables.push(p.table);
      }
    } else if (p.type === 'createIndex') {
      const table = findByName(tables, p.index.tableName);
      if (!table) continue;
      table.indexes.push({
        name: p.index.name,
        unique: p.index.unique,
        columns: p.index.columns,
      });
    } else if (p.type === 'alter') {
      const table = findByName(tables, p.alter.tableName);
      if (!table) continue;
      if (p.alter.type === 'addColumn') {
        p.alter.columns.forEach(col => {
          if (!findByName(table.columns, col.name)) {
            table.columns.push(col);
          }
        });
      } else if (p.alter.type === 'addPrimaryKey') {
        p.alter.columns.forEach(colName => {
          const col = findByName(table.columns, colName);
          if (col) col.primaryKey = true;
        });
      } else if (p.alter.type === 'addUnique') {
        p.alter.columns.forEach(colName => {
          const col = findByName(table.columns, colName);
          if (col) col.unique = true;
        });
      } else if (p.alter.type === 'addForeignKey') {
        if (
          p.alter.columnNames.length &&
          p.alter.columnNames.length === p.alter.refColumnNames.length
        ) {
          table.foreignKeys.push({
            columnNames: p.alter.columnNames,
            refTableName: p.alter.refTableName,
            refColumnNames: p.alter.refColumnNames,
          });
          p.alter.columnNames.forEach(colName => {
            const col = findByName(table.columns, colName);
            if (col && col.refTable === '') {
              col.refTable = p.alter.refTableName;
              col.refColumns = p.alter.refColumnNames;
            }
          });
        }
      }
    }
  }

  const needsUsers = tables.some(table =>
    table.foreignKeys.some(fk => fk.refTableName.toUpperCase() === 'USERS') ||
    table.columns.some(col => col.refTable && col.refTable.toUpperCase() === 'USERS')
  );
  if (needsUsers) {
    tables.push({
      name: 'users',
      schema: 'auth',
      comment: 'auth.users (schema de Supabase, referenciado por FK)',
      columns: [
        {
          name: 'id',
          dataType: 'UUID',
          default: '',
          comment: '',
          primaryKey: true,
          autoIncrement: false,
          unique: false,
          nullable: false,
          refTable: '',
          refColumns: [],
        },
      ],
      indexes: [],
      foreignKeys: [],
      ifNotExists: true,
      synthetic: true,
    });
  }

  let connected = true;
  while (connected) {
    connected = false;
    tables.forEach(table => {
      table.columns.forEach(col => {
        if (!col.refTable || table.foreignKeys.some(fk =>
          fk.columnNames.length === 1 &&
          fk.columnNames[0].toUpperCase() === col.name.toUpperCase()
        )) return;
        const refColumns = col.refColumns.length ? col.refColumns : ['id'];
        table.foreignKeys.push({
          columnNames: [col.name],
          refTableName: col.refTable,
          refColumnNames: refColumns,
        });
        connected = true;
      });
    });
  }

  const byName = new Map();
  for (const table of tables) {
    const key = table.name.toUpperCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(table);
  }
  for (const [, group] of byName) {
    if (group.length > 1) {
      group.forEach(table => {
        table.nameSimple = table.name;
        if (table.schema) {
          table.name = `${table.schema}.${table.name}`;
        }
      });
    }
  }

  return tables;
}

function createColumnOptions(column) {
  return (
    (column.autoIncrement ? ColumnOption.autoIncrement : 0) |
    (column.primaryKey ? ColumnOption.primaryKey : 0) |
    (column.unique ? ColumnOption.unique : 0) |
    (column.nullable ? 0 : ColumnOption.notNull)
  );
}

function toErdJson(tables, databaseName) {
  const schema = {
    $schema: SCHEMA_URL,
    version: VERSION,
    settings: {
      width: 2000,
      height: 2000,
      scrollTop: 0,
      scrollLeft: 0,
      zoomLevel: 1,
      show: 687,
      database: 16,
      databaseName,
      canvasType: 'ERD',
      language: 1,
      tableNameCase: 4,
      columnNameCase: 2,
      bracketType: 1,
      relationshipDataTypeSync: true,
      relationshipOptimization: false,
      columnOrder: COLUMN_ORDER,
      maxWidthComment: -1,
      ignoreSaveSettings: 0,
    },
    doc: {
      tableIds: [],
      relationshipIds: [],
      indexIds: [],
      memoIds: [],
    },
    collections: {
      tableEntities: {},
      tableColumnEntities: {},
      relationshipEntities: {},
      indexEntities: {},
      indexColumnEntities: {},
      memoEntities: {},
    },
  };

  const canvasSize = Math.max(CANVAS_SIZE_MIN, Math.ceil(tables.length / 5) * 400 + 400);
  schema.settings.width = canvasSize;
  schema.settings.height = canvasSize;

  const graphTables = [];

  tables.forEach((table, index) => {
    const newTable = {
      id: nanoid('table:' + table.name),
      name: table.name,
      comment: table.comment,
      columnIds: [],
      seqColumnIds: [],
      ui: {
        x: 200 + (index % 5) * 320,
        y: 100 + Math.floor(index / 5) * 200,
        zIndex: 2,
        widthName: toWidthApprox(table.name),
        widthComment: toWidthApprox(table.comment),
        color: '',
      },
      meta: meta('table:' + table.name),
    };
    schema.collections.tableEntities[newTable.id] = newTable;

    table.columns.forEach(column => {
      if (!column.name) return;
      const newColumn = {
        id: nanoid('column:' + table.name + '.' + column.name + ':' + column.dataType),
        tableId: newTable.id,
        name: column.name,
        comment: column.comment,
        dataType: column.dataType,
        default: column.default,
        options: createColumnOptions(column),
        ui: {
          keys: column.primaryKey ? ColumnUIKey.primaryKey : 0,
          widthName: toWidthApprox(column.name),
          widthComment: toWidthApprox(column.comment),
          widthDataType: toWidthDataType(column.dataType),
          widthDefault: toWidthApprox(column.default),
        },
        meta: meta('column:' + table.name + '.' + column.name),
      };
      schema.collections.tableColumnEntities[newColumn.id] = newColumn;
      newTable.columnIds.push(newColumn.id);
      newTable.seqColumnIds.push(newColumn.id);
    });

    table.indexes.forEach(index => {
      if (!index.columns.length) return;
      const newIndex = {
        id: nanoid('index:' + table.name + '.' + index.name),
        name: index.name,
        tableId: newTable.id,
        indexColumnIds: [],
        seqIndexColumnIds: [],
        unique: index.unique,
        meta: meta('index:' + table.name + '.' + index.name),
      };
      const columns = table.columns;

      index.columns.forEach(colDef => {
        const targetColumn = findByName(columns, colDef.name);
        if (!targetColumn) return;
        const named = newTable.columnIds.map(id => schema.collections.tableColumnEntities[id]);
        const target = findByName(named, colDef.name);
        if (!target) return;
        const newIndexColumn = {
          id: nanoid('indexColumn:' + table.name + '.' + index.name + '.' + colDef.name),
          indexId: newIndex.id,
          columnId: target.id,
          orderType: colDef.sort === 'desc' ? OrderType.DESC : OrderType.ASC,
          meta: meta('indexColumn:' + table.name + '.' + index.name + '.' + colDef.name),
        };
        newIndex.indexColumnIds.push(newIndexColumn.id);
        newIndex.seqIndexColumnIds.push(newIndexColumn.id);
        schema.collections.indexColumnEntities[newIndexColumn.id] = newIndexColumn;
      });

      if (newIndex.indexColumnIds.length) {
        schema.collections.indexEntities[newIndex.id] = newIndex;
        schema.doc.indexIds.push(newIndex.id);
      }
    });

    graphTables.push(Object.assign({}, table, { id: newTable.id, columnIds: newTable.columnIds }));
    schema.doc.tableIds.push(newTable.id);
  });

  tables.forEach((table, tableIndex) => {
    if (!table.foreignKeys.length) return;

    const endTable = findTableByRef(graphTables, table.name);
    if (!endTable) return;

    table.foreignKeys.forEach(foreignKey => {
      const startTable = findTableByRef(graphTables, foreignKey.refTableName);
      if (!startTable) return;

      const startColumns = [];
      const endColumns = [];

      foreignKey.refColumnNames.forEach(refColumnName => {
        const column = findByName(
          startTable.columnIds.map(id => schema.collections.tableColumnEntities[id]),
          refColumnName
        );
        if (column) startColumns.push(column);
      });

      foreignKey.columnNames.forEach(columnName => {
        const column = findByName(
          endTable.columnIds.map(id => schema.collections.tableColumnEntities[id]),
          columnName
        );
        if (!column) return;
        endColumns.push(column);
        const hasPk = Boolean(column.ui.keys & ColumnUIKey.primaryKey);
        column.ui.keys = hasPk
          ? column.ui.keys | ColumnUIKey.foreignKey
          : ColumnUIKey.foreignKey;
      });

      if (!endColumns.length) return;

      const startTableId = findByName(graphTables, foreignKey.refTableName).id;
      const endTableId = endTable.id;
      const fkSeed = 'rel:' + startTableId + '>' + endTableId + ':' + foreignKey.columnNames.join(',');

      const newRelationship = {
        id: nanoid(fkSeed),
        identification: !endColumns.some(
          col => !(col.ui.keys & ColumnUIKey.primaryKey && col.ui.keys & ColumnUIKey.foreignKey)
        ),
        relationshipType: 4,
        startRelationshipType: 2,
        start: {
          tableId: startTableId,
          columnIds: startColumns.map(c => c.id),
          x: 0,
          y: 0,
          direction: 8,
        },
        end: {
          tableId: endTableId,
          columnIds: endColumns.map(c => c.id),
          x: 0,
          y: 0,
          direction: 8,
        },
        meta: meta(fkSeed),
      };

      schema.collections.relationshipEntities[newRelationship.id] = newRelationship;
      schema.doc.relationshipIds.push(newRelationship.id);
    });
  });

  return JSON.stringify(schema, null, 2) + '\n';
}

function main(argv) {
  const sources = [];
  let output = null;
  let databaseName = '';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-o') {
      output = argv[++i];
    } else if (arg === '--dbname') {
      databaseName = argv[++i];
    } else {
      sources.push(arg);
    }
  }

  if (!sources.length || !output) {
    console.error('Uso: node scripts/generate-erd.js <sqlFile|dir>... -o <salida>.erd.json [--dbname <nombre>]');
    console.error('La salida debe terminar en .erd.json (reconoce la extension ERD Editor de VSCode).');
    process.exit(1);
  }

  if (!/\.erd\.json$/i.test(output)) {
    console.error(`ERROR: la salida "${output}" debe terminar en .erd.json para que la extension ERD Editor la reconozca.`);
    process.exit(1);
  }

  const files = collectSqlFiles(sources);
  let sqlText = '';
  for (const file of files) {
    sqlText += stripComments(fs.readFileSync(file, 'utf8')) + '\n';
  }

  const tables = buildSchema(sqlText);
  const json = toErdJson(tables, databaseName);
  fs.writeFileSync(output, json, 'utf8');

  console.log(
    `ERD generado: ${output} (${tables.length} tablas, ${files.length} archivos sql, databaseName="${databaseName || '(vacío)'}")`
  );
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { buildSchema, toErdJson, splitStatements, parseCreateTable, parseColumnGroup };