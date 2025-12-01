# QOTE-Resona v0 Deployment Guide

Complete deployment instructions for the QOTE quantum coherence visualization system.

## 🚀 Quick Deploy

### One-Command Deployment
\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

This will automatically:
- ✅ Check prerequisites
- ✅ Install dependencies  
- ✅ Run tests and linting
- ✅ Deploy to staging
- ✅ Deploy to production (with confirmation)
- ✅ Setup monitoring
- ✅ Generate deployment report

## 📋 Prerequisites

### Required Software
- **Node.js 18+**: JavaScript runtime
- **npm 9+**: Package manager
- **Vercel CLI**: Deployment platform
- **Git**: Version control

### Optional Software
- **Python 3.8+**: For computation scripts
- **pip**: Python package manager

### Installation Commands
\`\`\`bash
# Install Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Vercel CLI
npm install -g vercel

# Install Python dependencies (optional)
pip install numpy matplotlib websockets asyncio
\`\`\`

## 🔧 Environment Setup

### Required Environment Variables
\`\`\`bash
# Analytics and Tracking
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=XXXXXXX

# Contact Integration  
NEXT_PUBLIC_CONTACT_EMAIL=investors@kayser-medical.com
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/qote-resona/demo

# Demo URLs
NEXT_PUBLIC_DEMO_URL=https://qote-demo.kayser-medical.com
NEXT_PUBLIC_DOCS_URL=https://docs.qote.kayser-medical.com
NEXT_PUBLIC_PITCH_URL=https://pitch.qote.kayser-medical.com
\`\`\`

### Vercel Configuration
\`\`\`bash
# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_GA_ID
vercel env add NEXT_PUBLIC_HOTJAR_ID
# ... add all required variables
\`\`\`

## 🏗️ Build Process

### Local Development
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
\`\`\`

### Production Build
\`\`\`bash
# Build for production
npm run build

# Test production build locally
npm start

# Run linting
npm run lint

# Run all tests
npm run test
\`\`\`

## 🌐 Deployment Environments

### Staging Environment
\`\`\`bash
# Deploy to staging
npm run deploy-staging

# Or using Vercel CLI
vercel

# Staging URL: https://qote-staging.vercel.app
\`\`\`

### Production Environment
\`\`\`bash
# Deploy to production
npm run deploy

# Or using Vercel CLI
vercel --prod

# Alias to custom domain
vercel alias qote-demo.kayser-medical.com
\`\`\`

## 🔗 Domain Configuration

### DNS Setup
Configure DNS records for custom domains:

\`\`\`
# A Records
qote-demo.kayser-medical.com → 76.76.19.61

# CNAME Records  
docs.qote.kayser-medical.com → cname.vercel-dns.com
pitch.qote.kayser-medical.com → cname.vercel-dns.com
ip.qote.kayser-medical.com → cname.vercel-dns.com
\`\`\`

### SSL Certificates
Vercel automatically provisions SSL certificates for all domains.

## 📊 Monitoring Setup

### Google Analytics
1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Set NEXT_PUBLIC_GA_ID environment variable

### Hotjar Integration
1. Create Hotjar account
2. Get Site ID
3. Set NEXT_PUBLIC_HOTJAR_ID environment variable

### Uptime Monitoring
Configure monitoring for:
- https://qote-demo.kayser-medical.com
- https://docs.qote.kayser-medical.com
- https://pitch.qote.kayser-medical.com

## 🐍 Python Scripts Deployment

### Local Execution
\`\`\`bash
# Run coherence analysis
npm run analyze

# Start visualization
npm run visualize  

# Launch WebSocket server
npm run server
\`\`\`

### Server Deployment
\`\`\`bash
# Install Python dependencies on server
pip install -r requirements.txt

# Run as background service
nohup python scripts/compute-kappa.py --mode server &

# Or using systemd service
sudo systemctl start qote-computation
\`\`\`

## 🔍 Health Checks

### Automated Checks
The deployment script includes health checks:

\`\`\`bash
# Basic connectivity
curl -f https://qote-demo.kayser-medical.com

# API endpoints (if available)
curl -f https://qote-demo.kayser-medical.com/api/health

# Performance check
curl -w "@curl-format.txt" -s -o /dev/null https://qote-demo.kayser-medical.com
\`\`\`

### Manual Verification
1. ✅ Homepage loads correctly
2. ✅ Braid-map visualization animates
3. ✅ Strategy dashboard displays metrics
4. ✅ Navigation between views works
5. ✅ External links open correctly
6. ✅ Mobile responsiveness
7. ✅ Analytics tracking fires

## 📈 Performance Optimization

### Build Optimization
\`\`\`bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images
# (Vercel automatically optimizes images)

# Enable compression
# (Vercel automatically enables gzip/brotli)
\`\`\`

### Runtime Performance
- **Target**: <2s initial page load
- **Target**: 60fps braid-map animation
- **Target**: <50ms coherence computation

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
\`\`\`bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
\`\`\`

**Deployment Errors**
\`\`\`bash
# Check Vercel logs
vercel logs

# Redeploy with verbose output
vercel --debug
\`\`\`

**Environment Variables**
\`\`\`bash
# List current variables
vercel env ls

# Pull environment variables
vercel env pull .env.local
\`\`\`

### Debug Commands
\`\`\`bash
# Check Node.js version
node --version

# Check npm version  
npm --version

# Check Vercel CLI version
vercel --version

# Test local build
npm run build && npm start
\`\`\`

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Linting clean
- [ ] Environment variables set
- [ ] Domain DNS configured
- [ ] Analytics setup complete

### Post-Deployment
- [ ] Health checks passing
- [ ] Analytics tracking verified
- [ ] Demo booking system working
- [ ] Contact forms functional
- [ ] Mobile responsiveness confirmed
- [ ] Performance metrics acceptable

### Go-Live Checklist
- [ ] Production URL accessible
- [ ] All external links working
- [ ] Social media accounts ready
- [ ] Investor materials updated
- [ ] Team notifications sent
- [ ] Monitoring alerts configured

## 🎯 Success Metrics

### Technical Metrics
- **Uptime**: >99.9%
- **Page Load**: <2 seconds
- **Animation FPS**: >50fps
- **Error Rate**: <0.1%

### Business Metrics
- **Demo Requests**: Track via Calendly
- **Investor Meetings**: Monitor email responses
- **User Engagement**: Google Analytics
- **Conversion Rate**: Demo → Meeting

## 📞 Support Contacts

### Technical Issues
- **Email**: support@kayser-medical.com
- **GitHub**: Create issue in repository

### Business Inquiries
- **Email**: investors@kayser-medical.com
- **Phone**: +1 (555) 123-4567
- **Calendar**: https://calendly.com/qote-resona/demo

### Emergency Contacts
- **Technical Lead**: tech@kayser-medical.com
- **Business Lead**: business@kayser-medical.com
- **24/7 Support**: support@kayser-medical.com

## 📚 Additional Resources

### Documentation
- **Technical Docs**: https://docs.qote.kayser-medical.com
- **API Reference**: https://api.qote.kayser-medical.com/docs
- **User Guide**: https://help.qote.kayser-medical.com

### Development Resources
- **GitHub Repository**: https://github.com/kayser-medical/qote-resona
- **Issue Tracker**: https://github.com/kayser-medical/qote-resona/issues
- **Wiki**: https://github.com/kayser-medical/qote-resona/wiki

### Business Resources
- **Investor Deck**: https://pitch.qote.kayser-medical.com
- **Demo Environment**: https://qote-demo.kayser-medical.com
- **Case Studies**: https://qote.kayser-medical.com/case-studies

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Deployment Target**: Production Ready

For immediate assistance, contact: support@kayser-medical.com
