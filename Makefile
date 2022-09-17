# For more information on the following see http://clarkgrubb.com/makefile-style-guide
MAKEFLAGS += --warn-undefined-variables
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help
.DELETE_ON_ERROR:
.SUFFIXES:

# Use docker-compose as the default set these environment variables to an empty
# string to overwrite running with docker-compose.
PYTHON_CMD_PREFIX ?= docker-compose run --no-deps --rm web
PYTHON_CMD_PREFIX_WITH_WEB_PORT ?= docker-compose run -p 8000:8000 --no-deps --rm web
NODE_CMD_PREFIX ?= docker-compose run --no-deps --rm -e NODE_ENV=production node
HELP_FIRST_COL_LENGTH := 23

# COLORS
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)
TARGET_MAX_CHAR_NUM := 23

.PHONY: help
help:
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-$(TARGET_MAX_CHAR_NUM)s$(RESET)$(GREEN)%s$(RESET)\n", $$1, $$2}'
	@echo ''

.PHONY: clean
clean: remove_py_cache remove_coverage_data ## Remove build files, python cache files and test coverage data
	@rm -rf docs/_build/
	@rm -rf public/static/

.PHONY: coverage
coverage: ## Run the django test runner with coverage
	@$(PYTHON_CMD_PREFIX) coverage run manage.py test && $(PYTHON_CMD_PREFIX) coverage html && open htmlcov/index.html

.PHONY: format_imports
format_imports: ## Auto format Python imports using isort
	@echo "Formatting imports using isort ..."
	@$(PYTHON_CMD_PREFIX) isort .

.PHONY: format_py
format_py: ## Auto format Python code using black
	@echo "Formatting code using black ..."
	@$(PYTHON_CMD_PREFIX) black .

.PHONY: format
format: format_imports format_py ## Auto format Python code using isort and black

.PHONY: lint_py
lint_py: ## Lint Python code flake8
	@echo "Checking code using black ..."
	@$(PYTHON_CMD_PREFIX) black . --check

.PHONY: lint_imports
lint_imports: ## Lint Python imports with isort
	@echo "Checking python imports ..."
	@$(PYTHON_CMD_PREFIX) isort --check-only --diff .

.PHONY: lint_sass
lint_sass: ## Lint SASS code with stylelint
	@echo "Checking SASS code using stylelint ..."
	@$(NODE_CMD_PREFIX) npx stylelint ./src/scss/

.PHONY: lint_types
lint_types: ## Lint Python types
	@echo "Checking python types ..."
	@$(PYTHON_CMD_PREFIX) mypy .

.PHONY: lint
lint: lint_js lint_sass lint_py lint_imports lint_types ## Lint Javascript, SASS, Python, Python imports and Python types

.PHONY: remove_coverage_data
remove_coverage_data: ## Remove Django test coverage data 
	@rm -f .coverage
	@rm -rf htmlcov

.PHONY: requirements
requirements: ## Run pip-compile to compile the requirements into the requirements*.txt files
	@rm -rf ./requirements*.txt
	@$(PYTHON_CMD_PREFIX) pip-compile --upgrade --generate-hashes --output-file requirements.txt config/requirements/prod.in
	@$(PYTHON_CMD_PREFIX) pip-compile --upgrade --generate-hashes --output-file requirements-dev.txt config/requirements/dev.in

.PHONY: test
test: ## Run the Django test runner without coverage
	@$(PYTHON_CMD_PREFIX) ./manage.py test --parallel
