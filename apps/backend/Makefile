# MuniCollect Backend Makefile

# Variables
BINARY_NAME=municollect-backend
MIGRATE_BINARY=migrate
DATABASE_URL ?= postgres://postgres:password@localhost:5432/municollect_dev?sslmode=disable
MIGRATIONS_DIR=migrations

# Build commands
.PHONY: build
build:
	go build -o bin/$(BINARY_NAME) ./cmd/server

.PHONY: build-migrate
build-migrate:
	go build -o bin/$(MIGRATE_BINARY) ./cmd/migrate

.PHONY: build-all
build-all: build build-migrate

# Development commands
.PHONY: dev
dev:
	go run ./cmd/server

.PHONY: test
test:
	go test -v ./...

.PHONY: test-coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Migration commands
.PHONY: migrate-up
migrate-up: build-migrate
	./bin/$(MIGRATE_BINARY) -action=up -db="$(DATABASE_URL)" -migrations=$(MIGRATIONS_DIR)

.PHONY: migrate-down
migrate-down: build-migrate
	./bin/$(MIGRATE_BINARY) -action=rollback -db="$(DATABASE_URL)" -migrations=$(MIGRATIONS_DIR)

.PHONY: migrate-status
migrate-status: build-migrate
	./bin/$(MIGRATE_BINARY) -action=status -db="$(DATABASE_URL)" -migrations=$(MIGRATIONS_DIR)

.PHONY: migrate-validate
migrate-validate: build-migrate
	./bin/$(MIGRATE_BINARY) -action=validate -migrations=$(MIGRATIONS_DIR)

.PHONY: migrate-rollback-to
migrate-rollback-to: build-migrate
	@if [ -z "$(VERSION)" ]; then \
		echo "Usage: make migrate-rollback-to VERSION=001"; \
		exit 1; \
	fi
	./bin/$(MIGRATE_BINARY) -action=rollback -version=$(VERSION) -db="$(DATABASE_URL)" -migrations=$(MIGRATIONS_DIR)

# Database commands
.PHONY: db-reset
db-reset: migrate-rollback-to migrate-up
	@echo "Database reset complete"

.PHONY: db-seed
db-seed: migrate-up
	@echo "Database seeded with development data"

# Docker commands
.PHONY: docker-build
docker-build:
	docker build -t municollect-backend .

.PHONY: docker-run
docker-run:
	docker run -p 8080:8080 --env-file .env municollect-backend

# Cleanup commands
.PHONY: clean
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html

# Linting and formatting
.PHONY: fmt
fmt:
	go fmt ./...

.PHONY: vet
vet:
	go vet ./...

.PHONY: lint
lint: fmt vet

# Dependencies
.PHONY: deps
deps:
	go mod download
	go mod tidy

.PHONY: deps-update
deps-update:
	go get -u ./...
	go mod tidy

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  build              - Build the backend binary"
	@echo "  build-migrate      - Build the migration tool"
	@echo "  build-all          - Build all binaries"
	@echo "  dev                - Run the backend in development mode"
	@echo "  test               - Run tests"
	@echo "  test-coverage      - Run tests with coverage report"
	@echo "  migrate-up         - Apply all pending migrations"
	@echo "  migrate-down       - Rollback the last migration"
	@echo "  migrate-status     - Show migration status"
	@echo "  migrate-validate   - Validate migration files"
	@echo "  migrate-rollback-to VERSION=xxx - Rollback to specific version"
	@echo "  db-reset           - Reset database (rollback all + migrate up)"
	@echo "  db-seed            - Seed database with development data"
	@echo "  docker-build       - Build Docker image"
	@echo "  docker-run         - Run Docker container"
	@echo "  clean              - Clean build artifacts"
	@echo "  fmt                - Format Go code"
	@echo "  vet                - Run go vet"
	@echo "  lint               - Run formatting and vetting"
	@echo "  deps               - Download and tidy dependencies"
	@echo "  deps-update        - Update dependencies"
	@echo ""
	@echo "Environment variables:"
	@echo "  DATABASE_URL       - PostgreSQL connection string"
	@echo "                       Default: postgres://postgres:password@localhost:5432/municollect_dev?sslmode=disable"