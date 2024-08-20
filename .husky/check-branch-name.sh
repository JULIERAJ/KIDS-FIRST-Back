#!/bin/bash

branch_name=$(git symbolic-ref --short HEAD)

# Define the regex pattern for branch names
pattern="^(feat|fix|chore|refactor|docs|style|test|perf|build|ci|revert|hotfix)\/[0-9]+\/[a-z0-9\-]+$"

if [[ ! $branch_name =~ $pattern ]]; then
  echo "Error: Branch name '$branch_name' does not follow the pattern 'type/number/description'."
  echo "Examples: 'feat/20/setup-ci-cd', 'fix/45/bug-fix-description', 'chore/30/update-dependencies'"
  exit 1
fi
