# Changelog

모든 주요 변경 사항이 이 파일에 기록됩니다.

## [0.6.0] - 2025-01-09

### Changed
- `analyze_table` → `analyze_query`로 변경 (쿼리 기반 ANALYZE 지원)

### Added
- README에 `@latest` 태그 사용법 추가

## [0.5.0] - 2025-01-09

### Added
- `explain_query` 도구 추가 (EXPLAIN 전용, format 옵션 지원)
- `analyze_table` 도구 추가 (ANALYZE TABLE 전용)
- 환경 변수로 EXPLAIN/ANALYZE 개별 제어 기능
  - `MYSQL_ALLOW_EXPLAIN` (기본값: true)
  - `MYSQL_ALLOW_ANALYZE` (기본값: true)

## [0.4.0] - 2025-01-09

### Added
- EXPLAIN, ANALYZE 쿼리 지원 (`execute_query`에서 사용 가능)
- 환경 변수로 EXPLAIN/ANALYZE 활성화/비활성화 제어

### Changed
- 기본 연결 풀 크기 10 → 1로 변경 (MCP 단일 사용자 환경에 최적화)

## [0.3.0] - 2025-01-09

### Added
- Node.js 버전 요구사항 추가 (>=18.0.0)
- README에 Node.js 업데이트 가이드 추가
- 문제 해결 섹션에 빠른 링크 추가

### Changed
- README에서 npx 사용을 기본 설치 방법으로 권장

## [0.2.0] - 2025-01-09

### Added
- IntelliJ Copilot 설정 예제 추가
- Cursor IDE 설정 예제 추가
- Kiro IDE 설정 예제 추가

## [0.1.0] - 2025-01-09

### Added
- 초기 릴리스
- `list_databases` - 데이터베이스 목록 조회
- `list_tables` - 테이블 목록 조회
- `describe_table` - 테이블 스키마 조회
- `execute_query` - 읽기 전용 SQL 쿼리 실행
- MySQL 연결 풀 지원
- 쿼리 검증 (읽기 전용만 허용)
