[![npm version](https://img.shields.io/npm/v/@cano721/mysql-mcp-server?color=blue)](https://www.npmjs.com/package/@cano721/mysql-mcp-server)

# MySQL 데이터베이스 접근 MCP 서버 (@cano721/mysql-mcp-server)

이 MCP 서버는 MySQL 데이터베이스에 읽기 전용 접근을 제공합니다. 다음과 같은 기능을 제공합니다:

- 사용 가능한 데이터베이스 목록 조회
- 데이터베이스의 테이블 목록 조회
- 테이블 스키마 설명
- 읽기 전용 SQL 쿼리 실행

## 📋 목차

- [요구사항](#요구사항)
- [설치](#설치)
- [사용 가능한 도구](#사용-가능한-도구)
- [실제 사용 예제](#실제-사용-예제)
- [문제 해결](#문제-해결)
  - [Node.js 버전 확인 및 업데이트](#0-nodejs-버전-확인-가장-중요)
  - [npx 관련 문제](#npx-관련-문제)
- [변경 이력](#변경-이력)
- [라이선스](#라이선스)

## 보안 기능

- **읽기 전용 접근**: SELECT, SHOW, DESCRIBE 문 항상 허용
- **분석 도구**: EXPLAIN, EXPLAIN ANALYZE 기본 허용 (읽기 전용 분석)
- **쿼리 검증**: SQL 인젝션 방지 및 데이터 수정 시도 차단
- **쿼리 타임아웃**: 장시간 실행되는 쿼리로부터 리소스 보호
- **행 제한**: 과도한 데이터 반환 방지 (최대 1000행)
- **세밀한 권한 제어**: 각 분석 도구별 개별 활성화/비활성화

**지원되는 SQL 명령어**:
- `SELECT` - 데이터 조회 및 분석 (항상 허용)
- `SHOW` - 데이터베이스/테이블/인덱스 정보 조회 (항상 허용)
- `DESCRIBE` / `DESC` - 테이블 구조 및 컬럼 정보 (항상 허용)
- `EXPLAIN` - 쿼리 실행 계획 분석 (기본 허용, 읽기 전용)
- `EXPLAIN ANALYZE` - 쿼리 실제 실행 및 성능 분석 (기본 허용, 읽기 전용)

## 요구사항

- **Node.js**: 18.0.0 이상 → [Node.js 업데이트 방법](#0-nodejs-버전-확인-가장-중요)
- **npm**: 8.0.0 이상 (Node.js와 함께 설치됨)

💡 **Node.js 버전이 낮다면?** [여기를 클릭해서 업데이트 방법을 확인하세요](#0-nodejs-버전-확인-가장-중요)

## 설치

### 방법 1: npx 사용 (대부분의 MCP 클라이언트에서 권장)

`npx`를 사용하면 별도 설치 없이 바로 사용할 수 있습니다:

```bash
# 설치 없이 바로 사용 가능
npx @cano721/mysql-mcp-server
```

**💡 항상 최신 버전 사용하기:**
```bash
# @latest 태그를 붙이면 캐시를 무시하고 항상 최신 버전을 가져옵니다
npx @cano721/mysql-mcp-server@latest
```

MCP 설정에서도 `@latest`를 사용하면 항상 최신 버전을 사용할 수 있습니다:
```json
{
  "args": ["@cano721/mysql-mcp-server@latest"]
}
```

**주의**: 일부 MCP 클라이언트에서 npx가 제대로 작동하지 않을 수 있습니다. 그런 경우 방법 2를 사용하세요.

### 방법 2: 전역 설치 (npx가 안 될 때 권장)

npx에 문제가 있거나 더 안정적인 연결을 원한다면:

```bash
# 전역 설치
npm install -g @cano721/mysql-mcp-server

# 설치 확인
mysql-mcp-server --version
```

### 방법 3: 소스에서 빌드

개발이나 커스터마이징이 필요한 경우:

```bash
# 저장소 복제
git clone https://github.com/cano721/mysql-mcp-server.git
cd mysql-mcp-server

# 의존성 설치 및 빌드
npm install
npm run build
```

### 방법 4: Smithery를 통한 설치

Claude AI용 MySQL 데이터베이스 접근 MCP 서버를 Smithery를 통해 자동으로 설치:

```bash
npx -y @smithery/cli install @cano721/mysql-mcp-server --client claude
```

### 2. 환경 변수 설정

서버는 다음 환경 변수가 필요합니다:

**필수 환경 변수:**
- `MYSQL_HOST`: 데이터베이스 서버 호스트명
- `MYSQL_USER`: 데이터베이스 사용자명

**선택적 환경 변수:**
- `MYSQL_PORT`: 데이터베이스 서버 포트 (기본값: 3306)
- `MYSQL_PASSWORD`: 데이터베이스 비밀번호 (보안 연결에 권장)
- `MYSQL_DATABASE`: 기본 데이터베이스명
- `MYSQL_QUERY_TIMEOUT`: 쿼리 타임아웃 (밀리초, 기본값: 60000 = 60초)

**보안 설정:**
- `MYSQL_ALLOW_EXPLAIN`: EXPLAIN 쿼리 허용 여부 (기본값: true, 비활성화: false)
- `MYSQL_ALLOW_ANALYZE`: ANALYZE 쿼리 허용 여부 (기본값: true, 비활성화: false)

### 3. MCP 설정에 추가

MCP 설정 파일에 다음 구성을 추가하세요:

#### npx 사용 시:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server@latest"],
      "env": {
        "MYSQL_HOST": "your-mysql-host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your-mysql-user",
        "MYSQL_PASSWORD": "your-mysql-password",
        "MYSQL_DATABASE": "your-default-database"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### 전역 설치 후 사용 시:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "mysql-mcp-server",
      "args": [],
      "env": {
        "MYSQL_HOST": "your-mysql-host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your-mysql-user",
        "MYSQL_PASSWORD": "your-mysql-password",
        "MYSQL_DATABASE": "your-default-database"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### 소스에서 빌드한 경우:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/path/to/mysql-mcp-server/build/index.js"],
      "env": {
        "MYSQL_HOST": "your-mysql-host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your-mysql-user",
        "MYSQL_PASSWORD": "your-mysql-password",
        "MYSQL_DATABASE": "your-default-database"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 사용 가능한 도구

### list_databases

MySQL 서버에서 접근 가능한 모든 데이터베이스를 나열합니다.

**매개변수**: 없음

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "list_databases",
  "arguments": {}
}
```

### list_tables

지정된 데이터베이스의 모든 테이블을 나열합니다.

**매개변수**:
- `database` (선택사항): 데이터베이스명 (지정하지 않으면 기본값 사용)

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "list_tables",
  "arguments": {
    "database": "my_database"
  }
}
```

### describe_table

특정 테이블의 스키마를 보여줍니다.

**매개변수**:
- `database` (선택사항): 데이터베이스명 (지정하지 않으면 기본값 사용)
- `table` (필수): 테이블명

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "describe_table",
  "arguments": {
    "database": "my_database",
    "table": "my_table"
  }
}
```

### execute_query

읽기 전용 SQL 쿼리를 실행합니다.

**매개변수**:
- `query` (필수): SQL 쿼리 (SELECT, SHOW, DESCRIBE, EXPLAIN 문만 허용)
- `database` (선택사항): 데이터베이스명 (지정하지 않으면 기본값 사용)

**지원되는 쿼리 유형**:
- `SELECT` - 데이터 조회
- `SHOW` - 데이터베이스/테이블 정보 표시
- `DESCRIBE` / `DESC` - 테이블 구조 설명
- `EXPLAIN` - 쿼리 실행 계획 분석

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "execute_query",
  "arguments": {
    "database": "my_database",
    "query": "SELECT * FROM my_table LIMIT 10"
  }
}
```

**EXPLAIN 사용 예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "execute_query",
  "arguments": {
    "database": "my_database",
    "query": "EXPLAIN SELECT * FROM my_table WHERE id = 1"
  }
}
```

### explain_query

쿼리 실행 계획을 분석합니다 (MYSQL_ALLOW_EXPLAIN=true 필요).

**매개변수**:
- `query` (필수): 분석할 SQL 쿼리
- `database` (선택사항): 데이터베이스명
- `format` (선택사항): 출력 형식 (TRADITIONAL, JSON, TREE)

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "explain_query",
  "arguments": {
    "database": "my_database",
    "query": "SELECT * FROM users WHERE id = 1",
    "format": "JSON"
  }
}
```

### analyze_query

쿼리를 실제로 실행하면서 성능 통계를 분석합니다 (MYSQL_ALLOW_ANALYZE=true 필요).

`EXPLAIN ANALYZE` 구문을 사용하여 쿼리를 실제로 실행하고, 각 단계별 실행 시간과 행 수 등의 상세한 성능 정보를 제공합니다.

**매개변수**:
- `query` (필수): 분석할 SQL 쿼리 (SELECT 문)
- `database` (선택사항): 데이터베이스명

**주의**: 이 도구는 쿼리를 실제로 실행하므로, 대용량 데이터 조회 시 시간이 오래 걸릴 수 있습니다.

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "analyze_query",
  "arguments": {
    "database": "my_database",
    "query": "SELECT * FROM users WHERE id = 1"
  }
}
```

### get_related_tables

특정 테이블과 FK로 연결된 모든 연관 테이블을 depth별로 조회합니다.

**매개변수**:
- `table` (필수): 연관 테이블을 찾을 기준 테이블명
- `database` (선택사항): 데이터베이스명
- `depth` (선택사항): 탐색할 최대 깊이 (기본값: 3, 10 초과 시 경고)
- `include_pattern_match` (선택사항): 컬럼명 패턴 매칭 포함 여부 (기본값: false)

**검색 방법**:
1. **FK 제약조건 기반** (기본): 실제 Foreign Key가 설정된 테이블만 조회
2. **패턴 매칭 포함**: `user_sn`, `user_id` 같은 컬럼명 패턴으로 추가 테이블 탐색

**예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "get_related_tables",
  "arguments": {
    "database": "my_database",
    "table": "user",
    "depth": 2
  }
}
```

**패턴 매칭 포함 예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "get_related_tables",
  "arguments": {
    "database": "my_database",
    "table": "user",
    "depth": 2,
    "include_pattern_match": true
  }
}
```

**응답 예시**:
```json
{
  "root_table": "user",
  "database": "my_database",
  "requested_depth": 2,
  "search_method": "fk_constraint",
  "fk_relations_count": 55,
  "pattern_match_count": 0,
  "total_relations": 55,
  "circular_references_detected": false,
  "fk_relations": [
    {
      "depth": 1,
      "child_table": "user_matching_information",
      "fk_column": "user_sn",
      "parent_table": "user",
      "constraint_name": "FK_USER_MATCHING_INFORMATION_USER_SN",
      "match_type": "fk_constraint"
    }
  ],
  "note": "FK 제약조건 기반으로 조회되었습니다. 패턴 매칭도 포함하려면 '패턴 매칭도 포함해줘'라고 요청해보세요."
}
```

**순환참조 감지 예시**:
```json
{
  "root_table": "user",
  "circular_references_detected": true,
  "circular_references": [
    {
      "path": ["user", "profile", "user"],
      "description": "user → profile → user"
    }
  ],
  "circular_reference_note": "⚠️ 순환참조가 감지되었습니다 (1개). 이미 방문한 테이블은 재탐색하지 않았습니다."
}
```

**성능 최적화**:
- v0.9.4부터 전체 FK 관계를 한 번에 로드하여 메모리에서 BFS 수행
- 쿼리 횟수: O(n) → O(1) (n = 탐색할 테이블 수)
- 대규모 데이터베이스에서도 빠른 응답 보장

> **참고**: 응답은 JSON 배열 형태로 제공됩니다. 테이블이나 CSV 형식이 필요한 경우 LLM에게 변환을 요청하세요.
```

**SHOW 명령어 예제**:
```json
{
  "server_name": "mysql",
  "tool_name": "execute_query",
  "arguments": {
    "database": "my_database",
    "query": "SHOW CREATE TABLE my_table"
  }
}
```

## 고급 연결 풀 설정

MySQL 연결 풀 동작을 더 세밀하게 제어하려면 추가 매개변수를 설정할 수 있습니다:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server@latest"],
      "env": {
        "MYSQL_HOST": "your-mysql-host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your-mysql-user",
        "MYSQL_PASSWORD": "your-mysql-password",
        "MYSQL_DATABASE": "your-default-database",
        
        "MYSQL_CONNECTION_LIMIT": "1",
        "MYSQL_QUERY_TIMEOUT": "60000",
        "MYSQL_QUEUE_LIMIT": "0",
        "MYSQL_CONNECT_TIMEOUT": "10000",
        "MYSQL_IDLE_TIMEOUT": "60000",
        "MYSQL_MAX_IDLE": "10",
        "MYSQL_ALLOW_EXPLAIN": "true",
        "MYSQL_ALLOW_ANALYZE": "true"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

이러한 고급 옵션을 통해 다음을 제어할 수 있습니다:

- `MYSQL_CONNECTION_LIMIT`: 풀의 최대 연결 수 제어 (기본값: 1)
- `MYSQL_QUEUE_LIMIT`: 대기열에 넣을 최대 연결 요청 수 설정 (기본값: 0, 무제한)
- `MYSQL_CONNECT_TIMEOUT`: 연결 타임아웃을 밀리초 단위로 조정 (기본값: 10000)
- `MYSQL_QUERY_TIMEOUT`: 쿼리 타임아웃을 밀리초 단위로 조정 (기본값: 60000 = 60초)
- `MYSQL_IDLE_TIMEOUT`: 연결이 해제되기 전까지 유휴 상태로 있을 수 있는 시간 (밀리초 단위)
- `MYSQL_MAX_IDLE`: 풀에 유지할 최대 유휴 연결 수 설정
- `MYSQL_ALLOW_EXPLAIN`: EXPLAIN 쿼리 허용 여부 (기본값: true)
- `MYSQL_ALLOW_ANALYZE`: ANALYZE 쿼리 허용 여부 (기본값: true)

## 테스트

서버에는 MySQL 설정으로 기능을 확인하는 테스트 스크립트가 포함되어 있습니다:

### 1. 테스트 데이터베이스 설정

이 스크립트는 테스트 데이터베이스, 테이블 및 샘플 데이터를 생성합니다:

```bash
# MySQL 자격 증명을 환경 변수로 설정
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=your_username
export MYSQL_PASSWORD=your_password

# 설정 스크립트 실행
npm run test:setup
```

### 2. MCP 도구 테스트

이 스크립트는 테스트 데이터베이스에 대해 각 MCP 도구를 테스트합니다:

```bash
# MySQL 자격 증명을 환경 변수로 설정
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=your_username
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=mcp_test_db

# 도구 테스트 스크립트 실행
npm run test:tools
```

### 3. 모든 테스트 실행

설정 및 도구 테스트를 모두 실행하려면:

```bash
# MySQL 자격 증명을 환경 변수로 설정
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=your_username
export MYSQL_PASSWORD=your_password

# 모든 테스트 실행
npm test
```

## 실제 사용 예제

### Kiro IDE에서 사용하기

Kiro IDE에서 이 MCP 서버를 사용하는 예제:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server@latest"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "4307",
        "MYSQL_USER": "developer"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### IntelliJ Copilot에서 사용하기

IntelliJ IDEA의 GitHub Copilot에서 MCP 서버를 사용하려면:

#### npx 사용 시:
```json
{
  "servers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server@latest"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "4307",
        "MYSQL_USER": "developer"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### 전역 설치 후 사용 시:
```json
{
  "servers": {
    "mysql": {
      "command": "mysql-mcp-server",
      "args": [],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "4307",
        "MYSQL_USER": "developer"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Cursor IDE에서 사용하기

Cursor IDE에서 MCP 서버를 사용하려면 `.cursor/mcp.json` 파일을 생성하세요:

```json
{
  "servers": [
    {
      "name": "mysql",
      "type": "command",
      "command": "npx",
      "arguments": ["@cano721/mysql-mcp-server@latest"],
      "environment": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "4307",
        "MYSQL_USER": "developer"
      }
    }
  ]
}
```

### 테스트 결과

이 MCP 서버는 다음과 같은 실제 환경에서 테스트되었습니다:

- ✅ **데이터베이스 목록 조회**: 38개의 데이터베이스 성공적으로 조회
- ✅ **테이블 목록 조회**: MySQL 시스템 데이터베이스의 40개 테이블 조회
- ✅ **테이블 스키마 조회**: user 테이블의 46개 컬럼 정보 조회
- ✅ **SQL 쿼리 실행**: 사용자 정보 조회 쿼리 성공적으로 실행
- ✅ **EXPLAIN 쿼리**: 쿼리 실행 계획 분석 지원
- ✅ **SHOW 명령어**: 데이터베이스 메타데이터 조회 지원

## 문제 해결

**빠른 해결책:**
- 🔧 [Node.js 버전이 낮은 경우](#0-nodejs-버전-확인-가장-중요)
- 💾 [npx 캐시 문제](#1-npx-캐시-문제)
- 🔌 [연결이 안 되는 경우](#2-환경-변수-전달-문제)
- 📦 [전역 설치로 해결](#4-대안-전역-설치-사용)

---

문제가 발생하면:

1. 서버 로그에서 오류 메시지 확인
2. MySQL 자격 증명 및 연결 세부 정보 확인
3. MySQL 사용자에게 적절한 권한이 있는지 확인
4. 쿼리가 읽기 전용이고 올바르게 형식화되었는지 확인

### 일반적인 오류

- **연결 오류**: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER` 환경 변수 확인
- **권한 오류**: MySQL 사용자에게 데이터베이스 접근 권한이 있는지 확인
- **쿼리 오류**: SELECT, SHOW, DESCRIBE, EXPLAIN 문만 사용 가능

### npx 관련 문제

#### 0. Node.js 버전 확인 (가장 중요!)
```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# npm 버전 확인
npm --version
```

**Node.js 18 미만이면 다음 오류가 발생할 수 있습니다:**
- ES modules 지원 문제
- 최신 JavaScript 기능 미지원
- 의존성 패키지 호환성 문제

**Node.js 업데이트 방법:**

##### 방법 1: 공식 웹사이트에서 다운로드 (권장)
1. https://nodejs.org/ 방문
2. **LTS 버전** (Long Term Support) 다운로드
3. 설치 프로그램 실행
4. 터미널 재시작 후 버전 확인: `node --version`

##### 방법 2: nvm 사용 (개발자 권장)
```bash
# nvm 설치 (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 터미널 재시작 후
nvm install --lts        # 최신 LTS 버전 설치
nvm use --lts           # LTS 버전 사용
nvm alias default lts/* # 기본값으로 설정
```

##### 방법 3: Homebrew 사용 (macOS)
```bash
# Homebrew로 Node.js 업데이트
brew install node

# 또는 기존 설치가 있다면
brew upgrade node
```

##### 방법 4: 패키지 매니저 사용 (Linux)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL/Fedora
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

##### 방법 5: Windows
1. https://nodejs.org/ 에서 Windows Installer 다운로드
2. 또는 Chocolatey 사용: `choco install nodejs`
3. 또는 Scoop 사용: `scoop install nodejs`

**Node.js 업데이트 후 설정:**
```bash
# 1. 터미널/명령 프롬프트 재시작 (중요!)

# 2. 버전 확인
node --version  # v18.0.0 이상인지 확인
npm --version   # 8.0.0 이상인지 확인

# 3. npm 캐시 클리어 (권장)
npm cache clean --force

# 4. MCP 서버 테스트
npx @cano721/mysql-mcp-server@latest

# 5. 환경 변수 설정 후 테스트
export MYSQL_HOST=localhost
export MYSQL_PORT=4307
export MYSQL_USER=developer
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx @cano721/mysql-mcp-server
```

**주의사항:**
- Node.js 업데이트 후 **반드시 터미널을 재시작**하세요
- IDE(IntelliJ, VSCode 등)도 재시작해야 새 Node.js 버전을 인식합니다
- 기존에 전역 설치한 패키지들은 재설치가 필요할 수 있습니다

#### 1. npx 캐시 문제
```bash
# 최신 버전 강제 사용
npx --yes @cano721/mysql-mcp-server@latest

# npm 캐시 클리어
npm cache clean --force
```

#### 2. 환경 변수 전달 문제
MCP 설정에서 환경 변수가 제대로 설정되었는지 확인:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server@latest"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "4307",
        "MYSQL_USER": "developer"
      }
    }
  }
}
```

#### 3. Node.js PATH 문제
```bash
# Node.js 경로 확인
which node
which npx

# PATH에 Node.js 추가 (필요시)
export PATH="/path/to/node/bin:$PATH"
```

#### 4. 대안: 전역 설치 사용
npx가 계속 문제가 되면 전역 설치 후 직접 실행:
```bash
npm install -g @cano721/mysql-mcp-server
```

그 후 MCP 설정에서:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "mysql-mcp-server",
      "args": [],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "4307",
        "MYSQL_USER": "developer"
      }
    }
  }
}
```

#### 5. 연결 테스트
터미널에서 직접 테스트:
```bash
# 환경 변수 설정 후 테스트
export MYSQL_HOST=localhost
export MYSQL_PORT=4307
export MYSQL_USER=developer

# MCP 서버 테스트
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx @cano721/mysql-mcp-server
```

## 변경 이력

전체 변경 이력은 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.

### 최근 버전

| 버전 | 날짜 | 주요 변경 사항 |
|------|------|---------------|
| 0.9.5 | 2025-01-09 | 쿼리 타임아웃 설정 가능 (`MYSQL_QUERY_TIMEOUT`, 기본값 60초) |
| 0.9.4 | 2025-01-09 | `get_related_tables` 성능 최적화 (O(n) → O(1) 쿼리, 타임아웃 해결) |
| 0.9.3 | 2025-01-09 | 모든 도구 description에 한글 키워드 추가 (한글 질문 인식 개선) |
| 0.9.2 | 2025-01-09 | `get_related_tables` 응답에서 `constraint_name` 필드 제거 |
| 0.9.1 | 2025-01-09 | `get_related_tables` 응답 크기 최적화 (포맷 변환은 LLM이 수행) |
| 0.9.0 | 2025-01-09 | `get_related_tables` 응답 구조 개선 및 최적화 |
| 0.8.0 | 2025-01-09 | `get_related_tables`에 패턴 매칭 옵션 추가, depth 제한 제거 |
| 0.7.0 | 2025-01-09 | `get_related_tables` 도구 추가 (FK 기반 연관 테이블 depth별 조회) |
| 0.6.0 | 2025-01-09 | `analyze_table` → `analyze_query`로 변경, `@latest` 태그 문서 추가 |
| 0.5.0 | 2025-01-09 | `explain_query`, `analyze_table` 전용 도구 추가 |
| 0.4.0 | 2025-01-09 | EXPLAIN/ANALYZE 지원, 연결 풀 기본값 1로 변경 |
| 0.3.0 | 2025-01-09 | Node.js 18+ 요구사항, 문제 해결 가이드 추가 |
| 0.2.0 | 2025-01-09 | IntelliJ, Cursor, Kiro IDE 설정 예제 추가 |
| 0.1.0 | 2025-01-09 | 초기 릴리스 |

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

기여를 환영합니다! 이슈를 제출하거나 풀 리퀘스트를 보내주세요.

## 지원

문제가 있거나 질문이 있으시면 [GitHub Issues](https://github.com/cano721/mysql-mcp-server/issues)에서 이슈를 생성해주세요.