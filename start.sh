#!/bin/bash
# ValueTrip - Start backend and frontend (run from project root)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

echo "Starting ValueTrip backend on http://localhost:8000 ..."
(cd "$BACKEND" && (test -d venv || python3 -m venv venv) && ./venv/bin/pip install -q -r requirements.txt && ./venv/bin/python main.py) &
BACKEND_PID=$!

sleep 5
echo "Starting ValueTrip frontend on http://localhost:5173 ..."
(cd "$FRONTEND" && npm install && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Backend PID: $BACKEND_PID  |  Frontend PID: $FRONTEND_PID"
echo "Open: http://localhost:5173"
echo "Stop: kill $BACKEND_PID $FRONTEND_PID"
wait
