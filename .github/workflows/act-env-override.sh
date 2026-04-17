#!/bin/bash
# This file is sourced by workflows when testing locally with act

# Check if running in act (local) vs GitHub Actions
if [ -z "$GITHUB_ACTIONS" ] || [ "$GITHUB_ACTIONS" = "false" ]; then
    echo "Running locally with act"
    
    # Override for local Ollama testing
    export OPENAI_API_BASE="http://host.docker.internal:11434/v1"
    export OPENAI_API_KEY="sk-local-testing"
    export MODEL_NAME="mistral"
    
    echo "Using local Ollama at http://host.docker.internal:11434"
fi
