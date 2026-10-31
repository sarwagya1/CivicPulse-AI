@echo off
echo ==============================================
echo   CivicPulse AI — Backend Startup
echo ==============================================

cd /d "%~dp0backend"

set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"

if not exist ".venv" (
    echo [1/3] Creating virtual environment...
    "%PYTHON_EXE%" -m venv .venv
)

echo [2/3] Activating venv...
call .venv\Scripts\activate.bat

if not exist ".env" (
    copy .env.example .env
    echo [INFO] Created .env from .env.example
)

echo [3/3] Starting FastAPI server on http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
