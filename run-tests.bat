@echo off
REM AI Tools Platform - Test Runner Script (Windows)
REM This script runs all test suites for both backend and frontend

setlocal enabledelayedexpansion

echo.
echo 🧪 AI Tools Platform - Running All Tests
echo =========================================

REM Function to run backend tests
:run_backend_tests
echo.
echo 📡 Running Backend Tests (Laravel)
echo -----------------------------------

cd backend\laravel

REM Check if vendor directory exists
if not exist "vendor\" (
    echo Installing Laravel dependencies...
    call composer install --no-dev --optimize-autoloader
    if errorlevel 1 (
        echo ❌ Failed to install Laravel dependencies
        exit /b 1
    )
)

echo.
echo 🔧 Running Unit Tests...
call php artisan test --testsuite=Unit --stop-on-failure
if errorlevel 1 (
    echo ❌ Unit tests failed!
    exit /b 1
) else (
    echo ✅ Unit tests passed!
)

echo.
echo 🔗 Running Integration Tests...
call php artisan test --testsuite=Integration --stop-on-failure
if errorlevel 1 (
    echo ❌ Integration tests failed!
    exit /b 1
) else (
    echo ✅ Integration tests passed!
)

echo.
echo 🛡️ Running Security Tests...
call php artisan test --testsuite=Security --stop-on-failure
if errorlevel 1 (
    echo ❌ Security tests failed!
    exit /b 1
) else (
    echo ✅ Security tests passed!
)

echo.
echo 📊 Generating Coverage Report...
call php artisan test --coverage-html tests/coverage/html

cd ..\..
goto :eof

REM Function to run frontend tests
:run_frontend_tests
echo.
echo 🖥️ Running Frontend Tests (Next.js)
echo -----------------------------------

cd frontend\nextjs

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing Next.js dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install Next.js dependencies
        exit /b 1
    )
)

REM Install testing dependencies
echo Installing testing dependencies...
call npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom

echo.
echo 🔧 Running Unit Tests...
call npm test -- --selectProjects unit --watchAll=false
if errorlevel 1 (
    echo ❌ Unit tests failed!
    exit /b 1
) else (
    echo ✅ Unit tests passed!
)

echo.
echo 🔗 Running Integration Tests...
call npm test -- --selectProjects integration --watchAll=false
if errorlevel 1 (
    echo ❌ Integration tests failed!
    exit /b 1
) else (
    echo ✅ Integration tests passed!
)

echo.
echo 🛡️ Running Security Tests...
call npm test -- --selectProjects security --watchAll=false
if errorlevel 1 (
    echo ❌ Security tests failed!
    exit /b 1
) else (
    echo ✅ Security tests passed!
)

echo.
echo 📊 Generating Coverage Report...
call npm test -- --coverage --watchAll=false

cd ..\..
goto :eof

REM Main execution
:main
REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo ❌ Please run this script from the Platform root directory
    exit /b 1
)

REM Run backend tests
call :run_backend_tests
if errorlevel 1 exit /b 1

echo.
echo.

REM Run frontend tests
call :run_frontend_tests
if errorlevel 1 exit /b 1

echo.
echo.
echo 📊 Test Results Summary
echo ----------------------
echo.
echo 🎉 All Tests Passed Successfully!
echo.
echo 📁 Coverage Reports Generated:
echo   • Backend: backend\laravel\tests\coverage\html\index.html
echo   • Frontend: frontend\nextjs\coverage\index.html
echo.
echo 🚀 Next Steps:
echo   • Review coverage reports
echo   • Fix any failing tests
echo   • Add more tests for uncovered code
echo   • Set up CI/CD pipeline

goto :eof

REM Handle script arguments
if "%1"=="backend" (
    call :run_backend_tests
) else if "%1"=="frontend" (
    call :run_frontend_tests
) else if "%1"=="help" (
    echo Usage: %0 [backend^|frontend^|all]
    echo.
    echo Options:
    echo   backend   - Run only backend tests
    echo   frontend  - Run only frontend tests
    echo   all       - Run all tests ^(default^)
    echo   help      - Show this help message
) else if "%1"=="" (
    call :main
) else (
    call :main
)