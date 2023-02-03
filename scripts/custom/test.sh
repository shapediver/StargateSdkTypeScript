#!/usr/bin/env bash
# Overrides the default behaviour in `scripts/test.sh`.
jest ./__tests__ --passWithNoTests --runInBand --forceExit
