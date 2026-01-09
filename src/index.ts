#!/usr/bin/env node

/**
 * MySQL Database Access MCP Server
 * 
 * This MCP server provides read-only access to MySQL databases.
 * It allows:
 * - Listing available databases
 * - Listing tables in a database
 * - Describing table schemas
 * - Executing read-only SQL queries
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import mysql from 'mysql2/promise';

import { createConnectionPool, executeQuery, getConfigFromEnv } from './connection.js';
import { validateQuery } from './validators.js';

// Create MySQL connection pool
let pool: mysql.Pool;

try {
  const config = getConfigFromEnv();
  console.error('[Setup] MySQL configuration:', { 
    host: config.host, 
    port: config.port, 
    user: config.user, 
    password: config.password ? '********' : '(not provided)',
    database: config.database || '(default not set)' 
  });
  pool = createConnectionPool(config);
} catch (error) {
  console.error('[Fatal] Failed to initialize MySQL connection:', error);
  process.exit(1);
}

/**
 * Create an MCP server with tools for MySQL database access
 */
const server = new Server(
  {
    name: "mysql-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools for MySQL database access
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Check if optional commands are enabled
  const allowExplain = process.env.MYSQL_ALLOW_EXPLAIN !== 'false';
  const allowAnalyze = process.env.MYSQL_ALLOW_ANALYZE !== 'false';
  
  console.error('[Setup] Security settings:', { allowExplain, allowAnalyze });
  
  // Build allowed commands description for execute_query
  const allowedCommands = ['SELECT', 'SHOW', 'DESCRIBE'];
  if (allowExplain) {
    allowedCommands.push('EXPLAIN');
  }
  if (allowAnalyze) {
    allowedCommands.push('ANALYZE');
  }
  const commandsDescription = `SQL query (only ${allowedCommands.join(', ')} statements are allowed)`;
  
  // Build tools array
  const tools = [
    {
      name: "list_databases",
      description: "List all accessible databases on the MySQL server. 한글: 데이터베이스 목록, DB 목록, 데이터베이스 조회",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "list_tables",
      description: "List all tables in a specified database. 한글: 테이블 목록, 테이블 조회, 테이블 리스트",
      inputSchema: {
        type: "object",
        properties: {
          database: {
            type: "string",
            description: "Database name (optional, uses default if not specified)"
          }
        },
        required: []
      }
    },
    {
      name: "describe_table",
      description: "Show the schema for a specific table. 한글: 테이블 스키마, 테이블 구조, 컬럼 정보, 테이블 설명",
      inputSchema: {
        type: "object",
        properties: {
          database: {
            type: "string",
            description: "Database name (optional, uses default if not specified)"
          },
          table: {
            type: "string",
            description: "Table name"
          }
        },
        required: ["table"]
      }
    },
    {
      name: "execute_query",
      description: "Execute a read-only SQL query. 한글: 쿼리 실행, SQL 실행, 조회 쿼리",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: commandsDescription
          },
          database: {
            type: "string",
            description: "Database name (optional, uses default if not specified)"
          }
        },
        required: ["query"]
      }
    },
    {
      name: "get_related_tables",
      description: "Find all related/connected/associated tables linked to a specific table through foreign keys. Discovers table relationships and dependencies with depth traversal. Use this when asked to find related tables, connected tables, associated tables, or table relationships. 한글: 연관 테이블, 관련 테이블, 연결된 테이블, 테이블 관계, 참조 테이블, FK 관계",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Table name to find related tables for"
          },
          database: {
            type: "string",
            description: "Database name (optional, uses default if not specified)"
          },
          depth: {
            type: "number",
            description: "Maximum depth to traverse relationships (default: 3, warning if > 10)"
          },
          include_pattern_match: {
            type: "boolean",
            description: "Include tables found by column name pattern matching (e.g., user_sn, user_id). Default: false"
          }
        },
        required: ["table"]
      }
    }
  ];

  // Add explain_query tool if enabled
  if (allowExplain) {
    tools.push({
      name: "explain_query",
      description: "Analyze query execution plan using EXPLAIN. 한글: 쿼리 실행 계획, 쿼리 분석, EXPLAIN",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "SQL query to analyze (SELECT, UPDATE, DELETE, INSERT, REPLACE statements)"
          },
          database: {
            type: "string",
            description: "Database name (optional, uses default if not specified)"
          },
          format: {
            type: "string",
            description: "Output format: TRADITIONAL, JSON, or TREE (optional, default: TRADITIONAL)",
            enum: ["TRADITIONAL", "JSON", "TREE"]
          }
        },
        required: ["query"]
      }
    } as any);
  }

  // Add analyze_query tool if enabled
  if (allowAnalyze) {
    tools.push({
      name: "analyze_query",
      description: "Analyze query performance and statistics using ANALYZE. 한글: 쿼리 성능 분석, 쿼리 통계, ANALYZE",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "SQL query to analyze (SELECT, UPDATE, DELETE, INSERT, REPLACE statements)"
          },
          database: {
            type: "string",
            description: "Database name (optional, uses default if not specified)"
          }
        },
        required: ["query"]
      }
    } as any);
  }

  return { tools };
});

/**
 * Handler for MySQL database access tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "list_databases": {
        console.error('[Tool] Executing list_databases');
        
        const { rows } = await executeQuery(
          pool,
          'SHOW DATABASES'
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }]
        };
      }
      
      case "list_tables": {
        console.error('[Tool] Executing list_tables');
        
        const database = request.params.arguments?.database as string | undefined;
        
        const { rows } = await executeQuery(
          pool,
          'SHOW FULL TABLES',
          [],
          database
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }]
        };
      }
      
      case "describe_table": {
        console.error('[Tool] Executing describe_table');
        
        const database = request.params.arguments?.database as string | undefined;
        const table = request.params.arguments?.table as string;
        
        if (!table) {
          throw new McpError(ErrorCode.InvalidParams, "Table name is required");
        }
        
        const { rows } = await executeQuery(
          pool,
          `DESCRIBE \`${table}\``,
          [],
          database
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }]
        };
      }
      
      case "execute_query": {
        console.error('[Tool] Executing execute_query');
        
        const query = request.params.arguments?.query as string;
        const database = request.params.arguments?.database as string | undefined;
        
        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, "Query is required");
        }
        
        // Validate that the query is read-only
        validateQuery(query);
        
        const { rows } = await executeQuery(
          pool,
          query,
          [],
          database
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }]
        };
      }

      case "explain_query": {
        console.error('[Tool] Executing explain_query');
        
        const query = request.params.arguments?.query as string;
        const database = request.params.arguments?.database as string | undefined;
        const format = request.params.arguments?.format as string | undefined;
        
        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, "Query is required");
        }
        
        // Build EXPLAIN query
        let explainQuery = 'EXPLAIN';
        if (format && ['JSON', 'TREE'].includes(format.toUpperCase())) {
          explainQuery += ` FORMAT=${format.toUpperCase()}`;
        }
        explainQuery += ` ${query}`;
        
        const { rows } = await executeQuery(
          pool,
          explainQuery,
          [],
          database
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }]
        };
      }

      case "analyze_query": {
        console.error('[Tool] Executing analyze_query');
        
        const query = request.params.arguments?.query as string;
        const database = request.params.arguments?.database as string | undefined;
        
        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, "Query is required");
        }
        
        // Build ANALYZE query
        const analyzeQuery = `ANALYZE ${query}`;
        
        const { rows } = await executeQuery(
          pool,
          analyzeQuery,
          [],
          database
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }]
        };
      }

      case "get_related_tables": {
        console.error('[Tool] Executing get_related_tables');
        
        const table = request.params.arguments?.table as string;
        const database = request.params.arguments?.database as string | undefined;
        const requestedDepth = request.params.arguments?.depth as number || 3;
        const includePatternMatch = request.params.arguments?.include_pattern_match as boolean || false;
        
        if (!table) {
          throw new McpError(ErrorCode.InvalidParams, "Table name is required");
        }

        // Warning for deep queries
        let warning: string | undefined;
        if (requestedDepth > 10) {
          warning = `⚠️ Warning: depth ${requestedDepth} may take a long time and return a large amount of data.`;
          console.error(`[Warning] Deep query requested: depth=${requestedDepth}`);
        }

        // Get the actual database name
        let dbName = database;
        if (!dbName) {
          const { rows: dbRows } = await executeQuery(pool, 'SELECT DATABASE() as db');
          dbName = (dbRows as any[])[0]?.db;
          if (!dbName) {
            throw new McpError(ErrorCode.InvalidParams, "Database name is required (no default database set)");
          }
        }

        interface RelatedTable {
          depth: number;
          child_table: string;
          fk_column: string;
          parent_table: string;
          match_type: 'fk_constraint' | 'pattern_match';
        }

        interface CircularReference {
          path: string[];
          description: string;
        }

        // 🚀 최적화: 한 번에 모든 FK 관계를 가져오기
        console.error('[Tool] Fetching all FK relationships at once');
        const allFKQuery = `
          SELECT 
            TABLE_NAME as child_table,
            COLUMN_NAME as fk_column,
            REFERENCED_TABLE_NAME as parent_table
          FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `;
        
        const { rows: allFKRows } = await executeQuery(pool, allFKQuery, [dbName]);
        
        // FK 관계를 Map으로 구성 (빠른 조회를 위해)
        const childToParents = new Map<string, Array<{child: string, fk_column: string, parent: string}>>();
        const parentToChildren = new Map<string, Array<{child: string, fk_column: string, parent: string}>>();
        
        for (const row of allFKRows as any[]) {
          const relation = {
            child: row.child_table,
            fk_column: row.fk_column,
            parent: row.parent_table
          };
          
          // child -> parent 매핑
          if (!childToParents.has(row.child_table)) {
            childToParents.set(row.child_table, []);
          }
          childToParents.get(row.child_table)!.push(relation);
          
          // parent -> child 매핑
          if (!parentToChildren.has(row.parent_table)) {
            parentToChildren.set(row.parent_table, []);
          }
          parentToChildren.get(row.parent_table)!.push(relation);
        }

        console.error(`[Tool] Loaded ${allFKRows.length} FK relationships into memory`);

        const results: RelatedTable[] = [];
        const visited = new Set<string>();
        const circularReferences: CircularReference[] = [];
        const queue: { tableName: string; depth: number; path: string[] }[] = [
          { tableName: table, depth: 0, path: [table] }
        ];
        visited.add(table);

        while (queue.length > 0) {
          const current = queue.shift()!;
          
          if (current.depth >= requestedDepth) continue;

          // Find child tables (tables that reference the current table)
          const childRelations = parentToChildren.get(current.tableName) || [];
          
          for (const relation of childRelations) {
            results.push({
              depth: current.depth + 1,
              child_table: relation.child,
              fk_column: relation.fk_column,
              parent_table: relation.parent,
              match_type: 'fk_constraint'
            });

            if (!visited.has(relation.child)) {
              visited.add(relation.child);
              queue.push({ 
                tableName: relation.child, 
                depth: current.depth + 1,
                path: [...current.path, relation.child]
              });
            } else if (current.path.includes(relation.child)) {
              // 순환 참조 감지
              const cycleStart = current.path.indexOf(relation.child);
              const cyclePath = [...current.path.slice(cycleStart), relation.child];
              const description = cyclePath.join(' → ');
              // 중복 제거
              if (!circularReferences.some(ref => ref.description === description)) {
                circularReferences.push({ path: cyclePath, description });
              }
            }
          }

          // Find parent tables (tables that the current table references)
          const parentRelations = childToParents.get(current.tableName) || [];
          
          for (const relation of parentRelations) {
            // Only add if not already in results (avoid duplicates)
            const exists = results.some(r => 
              r.child_table === relation.child && 
              r.parent_table === relation.parent &&
              r.fk_column === relation.fk_column
            );
            
            if (!exists) {
              results.push({
                depth: current.depth + 1,
                child_table: relation.child,
                fk_column: relation.fk_column,
                parent_table: relation.parent,
                match_type: 'fk_constraint'
              });
            }

            if (!visited.has(relation.parent)) {
              visited.add(relation.parent);
              queue.push({ 
                tableName: relation.parent, 
                depth: current.depth + 1,
                path: [...current.path, relation.parent]
              });
            } else if (current.path.includes(relation.parent)) {
              // 순환 참조 감지
              const cycleStart = current.path.indexOf(relation.parent);
              const cyclePath = [...current.path.slice(cycleStart), relation.parent];
              const description = cyclePath.join(' → ');
              // 중복 제거
              if (!circularReferences.some(ref => ref.description === description)) {
                circularReferences.push({ path: cyclePath, description });
              }
            }
          }
        }

        // Sort by depth, then by child_table
        results.sort((a, b) => {
          if (a.depth !== b.depth) return a.depth - b.depth;
          return a.child_table.localeCompare(b.child_table);
        });

        // Pattern matching for tables without FK constraints
        let patternMatchResults: RelatedTable[] = [];
        if (includePatternMatch) {
          console.error('[Tool] Including pattern match results');
          
          // Common patterns: table_sn, table_id, table_code, sn_table, id_table
          const patterns = [
            `${table}_sn`, `${table}_id`, `${table}_code`,
            `sn_${table}`, `id_${table}`,
            `${table}sn`, `${table}id`
          ];
          
          const patternQuery = `
            SELECT DISTINCT
              c.TABLE_NAME as related_table,
              c.COLUMN_NAME as matching_column
            FROM information_schema.COLUMNS c
            WHERE c.TABLE_SCHEMA = ?
              AND c.TABLE_NAME != ?
              AND (${patterns.map(() => 'LOWER(c.COLUMN_NAME) = LOWER(?)').join(' OR ')})
          `;
          
          const { rows: patternRows } = await executeQuery(
            pool,
            patternQuery,
            [dbName, table, ...patterns]
          );

          // Filter out tables already found via FK
          const fkTables = new Set(results.map(r => r.child_table));
          fkTables.add(table);
          
          for (const row of patternRows as any[]) {
            if (!fkTables.has(row.related_table)) {
              patternMatchResults.push({
                depth: 1,
                child_table: row.related_table,
                fk_column: row.matching_column,
                parent_table: table,
                match_type: 'pattern_match'
              });
            }
          }
        }

        const response: any = {
          root_table: table,
          database: dbName,
          requested_depth: requestedDepth,
          search_method: includePatternMatch ? 'fk_constraint + pattern_match' : 'fk_constraint',
          fk_relations_count: results.length,
          pattern_match_count: patternMatchResults.length,
          total_relations: results.length + patternMatchResults.length,
          circular_references_detected: circularReferences.length > 0,
          circular_references: circularReferences.length > 0 ? circularReferences : undefined,
          fk_relations: results,
          pattern_match_relations: includePatternMatch ? patternMatchResults : undefined,
          note: includePatternMatch 
            ? "FK 제약조건 + 컬럼명 패턴 매칭 결과입니다." 
            : "FK 제약조건 기반으로 조회되었습니다. 패턴 매칭도 포함하려면 '패턴 매칭도 포함해줘'라고 요청해보세요."
        };

        if (warning) {
          response.warning = warning;
        }
        
        if (circularReferences.length > 0) {
          response.circular_reference_note = `⚠️ 순환참조가 감지되었습니다 (${circularReferences.length}개). 이미 방문한 테이블은 재탐색하지 않았습니다.`;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      }
      
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error('[Error] Tool execution failed:', error);
    
    // Format error message for client
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  console.error('[Setup] Starting MySQL MCP server');
  
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[Setup] MySQL MCP server running on stdio');
  } catch (error) {
    console.error('[Fatal] Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.error('[Shutdown] Closing MySQL connection pool');
  await pool.end();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('[Fatal] Unhandled error:', error);
  process.exit(1);
});
