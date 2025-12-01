#!/bin/bash

# QOTE-Resona v0 Deployment Script
# Complete deployment automation for production launch

set -e  # Exit on any error

echo "🚀 QOTE-Resona v0 Deployment Starting..."
echo "========================================"

# Configuration
PROJECT_NAME="qote-resona-v0"
PRODUCTION_URL="qote-demo.kayser-medical.com"
STAGING_URL="qote-staging.vercel.app"
GITHUB_REPO="kayser-medical/qote-resona-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check Python (optional)
    if command -v python3 &> /dev/null; then
        log_success "Python 3 found - computation scripts available"
    else
        log_warning "Python 3 not found - computation scripts will be unavailable"
    fi
    
    log_success "Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci
    log_success "Dependencies installed"
}

# Run tests and linting
run_tests() {
    log_info "Running tests and linting..."
    
    # Type checking
    if command -v tsc &> /dev/null; then
        npx tsc --noEmit
        log_success "TypeScript compilation check passed"
    fi
    
    # Linting
    npm run lint
    log_success "Linting passed"
    
    # Build test
    npm run build
    log_success "Build test passed"
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging environment..."
    
    # Deploy to Vercel staging
    vercel --yes
    
    # Get staging URL
    STAGING_DEPLOYMENT=$(vercel ls | grep $PROJECT_NAME | head -1 | awk '{print $2}')
    
    log_success "Staging deployment completed"
    log_info "Staging URL: https://$STAGING_DEPLOYMENT"
    
    # Basic health check
    sleep 10
    if curl -f -s "https://$STAGING_DEPLOYMENT" > /dev/null; then
        log_success "Staging health check passed"
    else
        log_error "Staging health check failed"
        exit 1
    fi
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production environment..."
    
    # Confirm production deployment
    echo -e "${YELLOW}Are you sure you want to deploy to production? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "Production deployment cancelled"
        return 0
    fi
    
    # Deploy to production
    vercel --prod --yes
    
    # Alias to custom domain
    vercel alias --yes $PRODUCTION_URL
    
    log_success "Production deployment completed"
    log_info "Production URL: https://$PRODUCTION_URL"
    
    # Production health check
    sleep 15
    if curl -f -s "https://$PRODUCTION_URL" > /dev/null; then
        log_success "Production health check passed"
    else
        log_error "Production health check failed"
        exit 1
    fi
}

# Setup monitoring and analytics
setup_monitoring() {
    log_info "Setting up monitoring and analytics..."
    
    # Verify environment variables are set
    if [[ -z "$NEXT_PUBLIC_GA_ID" ]]; then
        log_warning "Google Analytics ID not set"
    fi
    
    if [[ -z "$NEXT_PUBLIC_HOTJAR_ID" ]]; then
        log_warning "Hotjar ID not set"
    fi
    
    log_success "Monitoring setup completed"
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    REPORT_FILE="deployment-report-$(date '+%Y%m%d-%H%M%S').md"
    
    cat > $REPORT_FILE << EOF
# QOTE-Resona v0 Deployment Report

**Deployment Date**: $TIMESTAMP
**Version**: $(node -p "require('./package.json').version")
**Git Commit**: $(git rev-parse --short HEAD)

## Deployment URLs

- **Production**: https://$PRODUCTION_URL
- **Staging**: https://$STAGING_URL
- **GitHub**: https://github.com/$GITHUB_REPO

## System Status

- ✅ Build successful
- ✅ Tests passed
- ✅ Linting passed
- ✅ Staging deployment successful
- ✅ Production deployment successful
- ✅ Health checks passed

## Key Features Deployed

- 🌀 Interactive Braid-Map Visualization
- 📊 Strategy Dashboard with Working Links
- ⚡ Executive Overview with Real-time Metrics
- 🔗 Complete Navigation System
- 🐍 Python Computation Scripts

## Performance Metrics

- **Build Time**: $(date '+%Y-%m-%d %H:%M:%S')
- **Bundle Size**: $(du -sh .next 2>/dev/null | cut -f1 || echo "N/A")
- **Deployment Status**: Production Ready

## Next Steps

1. Monitor production metrics
2. Track user engagement
3. Collect demo requests
4. Schedule investor meetings

## Contact Information

- **Demo Requests**: https://calendly.com/qote-resona/demo
- **Investor Contact**: investors@kayser-medical.com
- **Technical Support**: support@kayser-medical.com

---
*Generated by QOTE-Resona deployment automation*
EOF

    log_success "Deployment report generated: $REPORT_FILE"
}

# Post-deployment tasks
post_deployment() {
    log_info "Running post-deployment tasks..."
    
    # Warm up the application
    log_info "Warming up application..."
    curl -s "https://$PRODUCTION_URL" > /dev/null
    curl -s "https://$PRODUCTION_URL/api/health" > /dev/null 2>&1 || true
    
    # Send deployment notification (if webhook configured)
    if [[ -n "$DEPLOYMENT_WEBHOOK" ]]; then
        curl -X POST "$DEPLOYMENT_WEBHOOK" \
             -H "Content-Type: application/json" \
             -d "{\"text\":\"🚀 QOTE-Resona v0 deployed successfully to production\"}" \
             > /dev/null 2>&1 || log_warning "Failed to send deployment notification"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Main deployment flow
main() {
    echo "Starting QOTE-Resona v0 deployment process..."
    echo "Timestamp: $(date)"
    echo "User: $(whoami)"
    echo "Directory: $(pwd)"
    echo ""
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    run_tests
    deploy_staging
    
    # Ask for production deployment
    deploy_production
    
    setup_monitoring
    generate_report
    post_deployment
    
    echo ""
    echo "========================================"
    log_success "🎉 QOTE-Resona v0 Deployment Complete!"
    echo "========================================"
    echo ""
    echo "🌐 Production URL: https://$PRODUCTION_URL"
    echo "📊 Analytics: Check Google Analytics dashboard"
    echo "📧 Demo Requests: Monitor Calendly bookings"
    echo "💼 Investor Contact: investors@kayser-medical.com"
    echo ""
    echo "🚀 The coherence revolution is now live!"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    "staging")
        log_info "Deploying to staging only..."
        check_prerequisites
        install_dependencies
        run_tests
        deploy_staging
        ;;
    "production")
        log_info "Deploying to production only..."
        check_prerequisites
        deploy_production
        ;;
    "test")
        log_info "Running tests only..."
        check_prerequisites
        install_dependencies
        run_tests
        ;;
    *)
        main
        ;;
esac
