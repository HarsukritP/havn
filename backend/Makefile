.PHONY: help run build test clean docker-up docker-down migrate-up migrate-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Run the application locally
	go run cmd/server/main.go

build: ## Build the application
	go build -o bin/server cmd/server/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/

docker-up: ## Start Docker services (PostgreSQL + Redis)
	docker-compose -f ../docker-compose.yml up -d postgres redis

docker-down: ## Stop Docker services
	docker-compose -f ../docker-compose.yml down

migrate-up: ## Run database migrations (up)
	@echo "Run migrations manually or use golang-migrate tool"
	@echo "Example: migrate -path migrations -database 'postgresql://havn:havn_dev@localhost:5432/havn_dev?sslmode=disable' up"

migrate-down: ## Rollback database migrations
	@echo "Run migrations manually or use golang-migrate tool"
	@echo "Example: migrate -path migrations -database 'postgresql://havn:havn_dev@localhost:5432/havn_dev?sslmode=disable' down"

install: ## Install Go dependencies
	go mod download

lint: ## Run linter (requires golangci-lint)
	golangci-lint run

dev: docker-up ## Start development environment
	@echo "PostgreSQL and Redis started!"
	@echo "Run 'make run' to start the backend server"

