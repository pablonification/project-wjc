# Next Steps After Development

This document outlines the steps you need to take after the initial development is completed to get your production-ready web application up and running.

## 🔧 **Environment Setup**

### 1. MongoDB Atlas Setup
1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier is sufficient for development)

2. **Database Configuration**
   - Create a database named `project-wjc`
   - Set up database user with read/write permissions
   - Configure network access (add your IP or allow all for development)
   - Copy the connection string

3. **Update Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Replace `MONGODB_URI` with your actual connection string

### 2. DatoCMS Setup
1. **Create DatoCMS Account**
   - Go to [DatoCMS](https://www.datocms.com/)
   - Sign up for an account
   - Create a new project

2. **Set Up Content Models**
   You need to create these models in DatoCMS:

   **Kegiatan Model:**
   ```
   - title (Single-line string, required)
   - description (Multi-paragraph text, required)
   - content (Structured text, optional)
   - slug (Slug, auto-generated from title)
   - startDate (Date and time, required)
   - endDate (Date and time, required)
   - location (Single-line string, required)
   - status (Single-line string, dropdown: Mendatang/Sedang Berlangsung/Selesai)
   - registrationDeadline (Date and time, optional)
   - maxParticipants (Integer, optional)
   - image (Single asset, optional)
   - category (Single-line string, optional)
   ```

   **Berita Model:**
   ```
   - title (Single-line string, required)
   - content (Structured text, required)
   - excerpt (Multi-paragraph text, required)
   - slug (Slug, auto-generated from title)
   - author (Single-line string, required)
   - publishDate (Date and time, required)
   - category (Single-line string, required)
   - image (Single asset, optional)
   - tags (Multiple links to Tag model)
   ```

   **Dokumentasi Model:**
   ```
   - title (Single-line string, required)
   - description (Multi-paragraph text, required)
   - year (Integer, required)
   - type (Single-line string, dropdown: document/video/image/link)
   - url (Single-line string, required)
   - fileSize (Single-line string, optional)
   - category (Single-line string, optional)
   ```

3. **Get API Tokens**
   - Go to Settings > API tokens
   - Create a read-only token for frontend
   - Create a management token for sync script
   - Add tokens to your `.env.local`

### 3. Email Service Setup (Choose One)

#### Option A: Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # Generate app password in Gmail settings
```

#### Option B: SendGrid
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API key
3. Add to `.env.local`:
```env
SENDGRID_API_KEY=your_api_key_here
```

#### Option C: Resend
1. Sign up at [Resend](https://resend.com/)
2. Create API key
3. Add to `.env.local`:
```env
RESEND_API_KEY=your_api_key_here
```

## 🚀 **Deployment**

### 1. Vercel Deployment
1. **Connect GitHub Repository**
   - Push your code to GitHub
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In Vercel dashboard, go to your project settings
   - Add all environment variables from `.env.local`
   - Make sure to set `NODE_ENV=production`

3. **Deploy**
   - Vercel will automatically deploy when you push to main branch
   - Configure domain if needed

### 2. Set Up Webhooks
1. **DatoCMS Webhook**
   - In DatoCMS, go to Settings > Webhooks
   - Create webhook pointing to: `https://yourdomain.com/api/webhooks/datocms`
   - Add webhook secret to environment variables

2. **Automatic Sync**
   - Every time content is updated in DatoCMS, it will sync to MongoDB
   - Manual sync available via: `npm run sync:dato-to-mongo`

## 📊 **Content Management Workflow**

### For Content Editors:
1. **Login to DatoCMS**: Use the DatoCMS admin interface
2. **Create/Edit Content**: Use the user-friendly interface
3. **Publish Changes**: Content automatically syncs to production
4. **Preview**: Changes appear on the website within minutes

### For Developers:
1. **Database Direct Access**: Use MongoDB Atlas dashboard
2. **Manual Sync**: Run sync script when needed
3. **Monitoring**: Check Vercel logs for deployment status

## 🔄 **Regular Maintenance**

### Daily Tasks
- [ ] Monitor application performance in Vercel dashboard
- [ ] Check email delivery status
- [ ] Review registration submissions

### Weekly Tasks
- [ ] Backup database (MongoDB Atlas automatic backups)
- [ ] Review application logs
- [ ] Update content as needed

### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Monitor storage usage (MongoDB Atlas and Vercel)
- [ ] Performance optimization review

## 🐛 **Common Issues & Solutions**

### Build Failures
- Check environment variables are set correctly
- Ensure MongoDB connection string is valid
- Verify DatoCMS tokens have correct permissions

### Sync Issues
- Check webhook URL is accessible
- Verify webhook secret matches environment variable
- Run manual sync script to test connection

### Email Not Sending
- Verify email service credentials
- Check spam folder
- Test with different email providers

## 📧 **Support Contacts**

- **MongoDB Atlas**: [Support](https://www.mongodb.com/support)
- **DatoCMS**: [Support](https://www.datocms.com/support)
- **Vercel**: [Support](https://vercel.com/support)
- **Development Issues**: Create GitHub issue in your repository

## 📚 **Additional Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [DatoCMS Documentation](https://www.datocms.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🎯 **Success Checklist**

- [ ] All environment variables configured
- [ ] MongoDB Atlas connected and accessible
- [ ] DatoCMS models created and content added
- [ ] Email service configured and tested
- [ ] Application deployed to Vercel
- [ ] Webhooks configured and working
- [ ] Registration form tested end-to-end
- [ ] Content sync working between DatoCMS and MongoDB
- [ ] All three main pages (Kegiatan, Berita, Dokumentasi) displaying real data
- [ ] Mobile responsiveness tested
- [ ] Performance optimization completed

---

**Note**: Keep this document updated as you make changes to the system. Consider creating a private repository or internal documentation for sensitive configuration details.