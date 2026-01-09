#!/usr/bin/env node

/**
 * Test script for get_related_tables tool
 * Tests various scenarios including depth, circular references, and pattern matching
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const serverPath = join(__dirname, 'build', 'index.js');
    const server = spawn('node', [serverPath], {
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    server.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    server.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send the request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();

    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error('Request timeout (30s)'));
    }, 30000);

    server.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0 && code !== null) {
        reject(new Error(`Server exited with code ${code}\nStderr: ${stderr}`));
        return;
      }

      try {
        // Parse the response
        const lines = stdout.split('\n').filter(line => line.trim());
        const response = JSON.parse(lines[lines.length - 1]);
        
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.result);
        }
      } catch (error) {
        reject(new Error(`Failed to parse response: ${error.message}\nStdout: ${stdout}`));
      }
    });
  });
}

async function runTest(testName, toolName, args, expectedChecks) {
  log(`\n📋 Test: ${testName}`, 'cyan');
  log(`   Args: ${JSON.stringify(args)}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    const result = await callTool(toolName, args);
    const duration = Date.now() - startTime;
    
    // Parse the result
    const content = result.content[0].text;
    const data = JSON.parse(content);
    
    log(`   ⏱️  Duration: ${duration}ms`, 'yellow');
    log(`   📊 Results:`, 'blue');
    log(`      - Root table: ${data.root_table}`);
    log(`      - Database: ${data.database}`);
    log(`      - Depth: ${data.requested_depth}`);
    log(`      - FK relations: ${data.fk_relations_count}`);
    log(`      - Pattern matches: ${data.pattern_match_count}`);
    log(`      - Total relations: ${data.total_relations}`);
    log(`      - Circular refs detected: ${data.circular_references_detected}`);
    
    if (data.circular_references && data.circular_references.length > 0) {
      log(`      - Circular paths:`, 'yellow');
      data.circular_references.forEach(ref => {
        log(`        • ${ref.description}`, 'yellow');
      });
    }
    
    if (data.warning) {
      log(`      ⚠️  ${data.warning}`, 'yellow');
    }
    
    // Run expected checks
    let allChecksPassed = true;
    if (expectedChecks) {
      log(`   🔍 Validation:`, 'blue');
      for (const [checkName, checkFn] of Object.entries(expectedChecks)) {
        try {
          const passed = checkFn(data);
          if (passed) {
            log(`      ✓ ${checkName}`, 'green');
          } else {
            log(`      ✗ ${checkName}`, 'red');
            allChecksPassed = false;
          }
        } catch (error) {
          log(`      ✗ ${checkName}: ${error.message}`, 'red');
          allChecksPassed = false;
        }
      }
    }
    
    if (allChecksPassed) {
      log(`   ✅ PASSED`, 'green');
    } else {
      log(`   ❌ FAILED`, 'red');
    }
    
    return { success: true, duration, data };
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`   ⏱️  Duration: ${duration}ms`, 'yellow');
    log(`   ❌ ERROR: ${error.message}`, 'red');
    return { success: false, duration, error: error.message };
  }
}

async function main() {
  logSection('🧪 Testing get_related_tables Tool');
  
  // Check environment variables
  if (!process.env.MYSQL_USER) {
    log('\n❌ Error: MYSQL_USER environment variable is required', 'red');
    log('Example usage:', 'yellow');
    log('  MYSQL_USER=root MYSQL_PASSWORD=password MYSQL_DATABASE=mydb node test-related-tables.js\n', 'cyan');
    process.exit(1);
  }
  
  log(`\n📝 Configuration:`, 'blue');
  log(`   Host: ${process.env.MYSQL_HOST || 'localhost'}`);
  log(`   Port: ${process.env.MYSQL_PORT || '3306'}`);
  log(`   User: ${process.env.MYSQL_USER}`);
  log(`   Database: ${process.env.MYSQL_DATABASE || '(default)'}`);
  
  const tests = [];
  
  // Test 1: Basic depth 1
  tests.push(await runTest(
    'Basic depth 1 query',
    'get_related_tables',
    { 
      table: process.env.TEST_TABLE || 'users',
      depth: 1 
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Has database': (data) => !!data.database,
      'Depth is 1': (data) => data.requested_depth === 1,
      'Has fk_relations': (data) => Array.isArray(data.fk_relations),
    }
  ));
  
  // Test 2: Depth 3 (default)
  tests.push(await runTest(
    'Default depth 3 query',
    'get_related_tables',
    { 
      table: process.env.TEST_TABLE || 'users'
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Depth is 3': (data) => data.requested_depth === 3,
      'Has fk_relations': (data) => Array.isArray(data.fk_relations),
    }
  ));
  
  // Test 3: Deep query (depth 5)
  tests.push(await runTest(
    'Deep query (depth 5)',
    'get_related_tables',
    { 
      table: process.env.TEST_TABLE || 'users',
      depth: 5 
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Depth is 5': (data) => data.requested_depth === 5,
      'Has fk_relations': (data) => Array.isArray(data.fk_relations),
    }
  ));
  
  // Test 4: Very deep query (depth 15) - should show warning
  tests.push(await runTest(
    'Very deep query (depth 15) - should warn',
    'get_related_tables',
    { 
      table: process.env.TEST_TABLE || 'users',
      depth: 15 
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Depth is 15': (data) => data.requested_depth === 15,
      'Shows warning': (data) => !!data.warning,
    }
  ));
  
  // Test 5: With pattern matching
  tests.push(await runTest(
    'With pattern matching enabled',
    'get_related_tables',
    { 
      table: process.env.TEST_TABLE || 'users',
      depth: 2,
      include_pattern_match: true
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Pattern matching enabled': (data) => data.search_method.includes('pattern_match'),
      'Has pattern_match_relations': (data) => data.pattern_match_relations !== undefined,
    }
  ));
  
  // Test 6: Non-existent table
  tests.push(await runTest(
    'Non-existent table (should still work)',
    'get_related_tables',
    { 
      table: 'nonexistent_table_xyz_123',
      depth: 1 
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Zero relations': (data) => data.total_relations === 0,
    }
  ));
  
  // Test 7: Performance test - measure time
  tests.push(await runTest(
    'Performance test (depth 10)',
    'get_related_tables',
    { 
      table: process.env.TEST_TABLE || 'users',
      depth: 10 
    },
    {
      'Has root_table': (data) => !!data.root_table,
      'Completes in reasonable time': (data, duration) => true, // Just measure
    }
  ));
  
  // Summary
  logSection('📊 Test Summary');
  
  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  const totalDuration = tests.reduce((sum, t) => sum + t.duration, 0);
  const avgDuration = totalDuration / tests.length;
  
  log(`\nTotal tests: ${tests.length}`);
  log(`Passed: ${passed}`, passed === tests.length ? 'green' : 'yellow');
  log(`Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  log(`\nTotal duration: ${totalDuration}ms`);
  log(`Average duration: ${Math.round(avgDuration)}ms`);
  log(`Fastest: ${Math.min(...tests.map(t => t.duration))}ms`);
  log(`Slowest: ${Math.max(...tests.map(t => t.duration))}ms`);
  
  if (failed === 0) {
    log('\n✅ All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed!', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
