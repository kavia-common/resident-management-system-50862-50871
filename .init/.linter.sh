#!/bin/bash
cd /home/kavia/workspace/code-generation/resident-management-system-50862-50871/resident_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

