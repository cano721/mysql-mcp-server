[![npm version](https://img.shields.io/npm/v/@cano721/mysql-mcp-server?color=blue)](https://www.npmjs.com/package/@cano721/mysql-mcp-server)

# MySQL 데이터베이스 접근 MCP 서버 (@cano721/mysql-mcp-server)

이 MCP 서버는 MySQL 데이터베이스에 읽기 전용 접근을 제공합니다. 다음과 같은 기능을 제공합니다:

- 사용 가능한 데이터베이스 목록 조회
- 데이터베이스의 테이블 목록 조회
- 테이블 스키마 설명
- 읽기 전용 SQL 쿼리 실행

## 보안 기능

- **읽기 전용 접근**: SELECT, SHOW, DESCRIBE, EXPLAIN 문만 허용
- **쿼리 검증**: SQL 인젝션 방지 및 데이터 수정 시도 차단
- **쿼리 타임아웃**: 장시간 실행되는 쿼리로부터 리소스 보호
- **행 제한**: 과도한 데이터 반환 방지 (최대 1000행)

## 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상 (Node.js와 함께 설치됨)

## 설치

### 방법 1: npx 사용 (대부분의 MCP 클라이언트에서 권장)

`npx`를 사용하면 별도 설치 없이 바로 사용할 수 있습니다:

```bash
# 설치 없이 바로 사용 가능
npx @cano721/mysql-mcp-server
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

- `MYSQL_HOST`: 데이터베이스 서버 호스트명
- `MYSQL_PORT`: 데이터베이스 서버 포트 (기본값: 3306)
- `MYSQL_USER`: 데이터베이스 사용자명
- `MYSQL_PASSWORD`: 데이터베이스 비밀번호 (선택사항, 보안 연결에 권장)
- `MYSQL_DATABASE`: 기본 데이터베이스명 (선택사항)

### 3. MCP 설정에 추가

MCP 설정 파일에 다음 구성을 추가하세요:

#### npx 사용 시:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server"],
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

## 고급 연결 풀 설정

MySQL 연결 풀 동작을 더 세밀하게 제어하려면 추가 매개변수를 설정할 수 있습니다:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server"],
      "env": {
        "MYSQL_HOST": "your-mysql-host",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your-mysql-user",
        "MYSQL_PASSWORD": "your-mysql-password",
        "MYSQL_DATABASE": "your-default-database",
        
        "MYSQL_CONNECTION_LIMIT": "1",
        "MYSQL_QUEUE_LIMIT": "0",
        "MYSQL_CONNECT_TIMEOUT": "10000",
        "MYSQL_IDLE_TIMEOUT": "60000",
        "MYSQL_MAX_IDLE": "10"
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
- `MYSQL_IDLE_TIMEOUT`: 연결이 해제되기 전까지 유휴 상태로 있을 수 있는 시간 (밀리초 단위)
- `MYSQL_MAX_IDLE`: 풀에 유지할 최대 유휴 연결 수 설정

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
      "args": ["@cano721/mysql-mcp-server"],
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
      "args": ["@cano721/mysql-mcp-server"],
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
      "arguments": ["@cano721/mysql-mcp-server"],
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

## 문제 해결

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

# Node.js 업데이트가 필요한 경우:
# https://nodejs.org/ 에서 최신 LTS 버전 다운로드
```

**Node.js 18 미만이면 다음 오류가 발생할 수 있습니다:**
- ES modules 지원 문제
- 최신 JavaScript 기능 미지원
- 의존성 패키지 호환성 문제

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
      "args": ["@cano721/mysql-mcp-server"],
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

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

기여를 환영합니다! 이슈를 제출하거나 풀 리퀘스트를 보내주세요.

## 지원

문제가 있거나 질문이 있으시면 [GitHub Issues](https://github.com/cano721/mysql-mcp-server/issues)에서 이슈를 생성해주세요.