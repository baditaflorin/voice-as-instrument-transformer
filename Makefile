.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push data

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks.
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the Vite development server.
	npm run dev

build: ## Build the Pages-ready frontend into dist/.
	npm run build

data: ## Mode A has no static data pipeline.
	@echo "Mode A: no offline data artifacts are required."

test: ## Run unit tests.
	npm test

test-integration: ## No integration tests are required for Mode A v1.
	@echo "Mode A: integration tests are covered by smoke/e2e."

smoke: ## Build, serve, and exercise a happy path.
	npm run smoke

lint: ## Run linters, formatting check, and TypeScript.
	npm run lint

fmt: ## Format the repository.
	npm run fmt

pages-preview: ## Serve dist/ locally exactly as Pages will.
	npm run pages:preview

hooks-pre-commit: ## Run pre-commit hook manually.
	npm run hooks:pre-commit

hooks-commit-msg: ## Run commit-msg hook manually.
	npm run hooks:commit-msg

hooks-pre-push: ## Run pre-push hook manually.
	npm run hooks:pre-push

release: ## Tag the current commit as v0.1.0 and publish Pages.
	npm run deploy:pages
	git tag -a v0.1.0 -m "v0.1.0"
	git push origin main --tags

clean: ## Remove generated local artifacts.
	rm -rf dist coverage playwright-report test-results

