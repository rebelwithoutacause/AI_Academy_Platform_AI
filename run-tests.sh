#!/bin/bash

# AI Tools Platform - Test Runner Script
# This script runs all test suites for both backend and frontend

set -e  # Exit on any error

echo "🧪 AI Tools Platform - Running All Tests"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to run backend tests
run_backend_tests() {
    print_status $BLUE "📡 Running Backend Tests (Laravel)"
    echo "-----------------------------------"

    cd backend/laravel

    # Check if vendor directory exists
    if [ ! -d "vendor" ]; then
        print_status $YELLOW "Installing Laravel dependencies..."
        composer install --no-dev --optimize-autoloader
    fi

    # Run different test suites
    echo ""
    print_status $YELLOW "🔧 Running Unit Tests..."
    if php artisan test --testsuite=Unit --stop-on-failure; then
        print_status $GREEN "✅ Unit tests passed!"
    else
        print_status $RED "❌ Unit tests failed!"
        exit 1
    fi

    echo ""
    print_status $YELLOW "🔗 Running Integration Tests..."
    if php artisan test --testsuite=Integration --stop-on-failure; then
        print_status $GREEN "✅ Integration tests passed!"
    else
        print_status $RED "❌ Integration tests failed!"
        exit 1
    fi

    echo ""
    print_status $YELLOW "🛡️ Running Security Tests..."
    if php artisan test --testsuite=Security --stop-on-failure; then
        print_status $GREEN "✅ Security tests passed!"
    else
        print_status $RED "❌ Security tests failed!"
        exit 1
    fi

    echo ""
    print_status $YELLOW "📊 Generating Coverage Report..."
    php artisan test --coverage-html tests/coverage/html

    cd ../..
}

# Function to run frontend tests
run_frontend_tests() {
    print_status $BLUE "🖥️ Running Frontend Tests (Next.js)"
    echo "-----------------------------------"

    cd frontend/nextjs

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status $YELLOW "Installing Next.js dependencies..."
        npm install
    fi

    # Install testing dependencies if not present
    if ! npm list @testing-library/react &> /dev/null; then
        print_status $YELLOW "Installing testing dependencies..."
        npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
    fi

    echo ""
    print_status $YELLOW "🔧 Running Unit Tests..."
    if npm test -- --selectProjects unit --watchAll=false; then
        print_status $GREEN "✅ Unit tests passed!"
    else
        print_status $RED "❌ Unit tests failed!"
        exit 1
    fi

    echo ""
    print_status $YELLOW "🔗 Running Integration Tests..."
    if npm test -- --selectProjects integration --watchAll=false; then
        print_status $GREEN "✅ Integration tests passed!"
    else
        print_status $RED "❌ Integration tests failed!"
        exit 1
    fi

    echo ""
    print_status $YELLOW "🛡️ Running Security Tests..."
    if npm test -- --selectProjects security --watchAll=false; then
        print_status $GREEN "✅ Security tests passed!"
    else
        print_status $RED "❌ Security tests failed!"
        exit 1
    fi

    echo ""
    print_status $YELLOW "📊 Generating Coverage Report..."
    npm test -- --coverage --watchAll=false

    cd ../..
}

# Function to display test results
display_results() {
    print_status $BLUE "📊 Test Results Summary"
    echo "----------------------"

    echo ""
    print_status $GREEN "🎉 All Tests Passed Successfully!"
    echo ""

    print_status $BLUE "📁 Coverage Reports Generated:"
    echo "  • Backend: backend/laravel/tests/coverage/html/index.html"
    echo "  • Frontend: frontend/nextjs/coverage/index.html"
    echo ""

    print_status $BLUE "🚀 Next Steps:"
    echo "  • Review coverage reports"
    echo "  • Fix any failing tests"
    echo "  • Add more tests for uncovered code"
    echo "  • Set up CI/CD pipeline"
}

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ]; then
        print_status $RED "❌ Please run this script from the Platform root directory"
        exit 1
    fi

    # Run backend tests
    run_backend_tests

    echo ""
    echo ""

    # Run frontend tests
    run_frontend_tests

    echo ""
    echo ""

    # Display results
    display_results
}

# Handle script arguments
case "${1:-all}" in
    "backend")
        run_backend_tests
        ;;
    "frontend")
        run_frontend_tests
        ;;
    "all"|"")
        main
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [backend|frontend|all]"
        echo ""
        echo "Options:"
        echo "  backend   - Run only backend tests"
        echo "  frontend  - Run only frontend tests"
        echo "  all       - Run all tests (default)"
        echo "  help      - Show this help message"
        ;;
    *)
        print_status $RED "❌ Invalid option: $1"
        echo "Use '$0 help' to see available options"
        exit 1
        ;;
esac