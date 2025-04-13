# Quotation Management System

A modern, responsive web application for creating, managing, and tracking quotations for tile, adhesive, and CP & SW products. Built with React, Material UI, and Vite.

## Features

- **Product Management**: Add, edit, and manage your product catalog
- **Customer Management**: Maintain a database of your customers
- **Staff Management**: Manage staff information
- **Quotation Generation**: Create professional quotations with product details, pricing, and discounts
- **Quotation Management**: View, edit, download, and delete existing quotations
- **PDF Export**: Generate professional PDF quotations for your customers
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React.js with Material UI
- **Routing**: React Router
- **Build Tool**: Vite
- **PDF Generation**: jsPDF
- **State Management**: React Hooks and Context API
- **Storage**: LocalStorage (client-side storage)

## Installation and Deployment Guide

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn
- Git (for cloning the repository)

### Local Development

```bash
# Clone the repository
git clone https://github.com/sunmughan/quote2.git
cd quote2

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000 (as configured in vite.config.js)

### Building for Production

```bash
# Create a production build
npm run build
# or
yarn build
```

This will generate a `dist` folder with the production-ready files. Note: The `dist` folder is not included in the repository as it's generated during the build process and is listed in the .gitignore file.

## Deployment Instructions

### Deploying to cPanel Hosting

1. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Upload to cPanel**:
   - Log in to your cPanel account
   - Navigate to File Manager
   - Go to the public_html directory (or a subdirectory where you want to host the app)
   - Upload all files from the `dist` folder

3. **Configure .htaccess**:
   Create or edit the .htaccess file in your hosting directory with the following content:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Set up SSL** (recommended):
   - Go to the SSL/TLS section in cPanel
   - Install an SSL certificate if you don't have one
   - Enable HTTPS redirection

### Deploying to AWS

#### Using AWS Amplify (Easiest Method)

1. **Set up AWS Amplify**:
   - Log in to the AWS Management Console
   - Navigate to AWS Amplify
   - Click "New app" → "Host web app"

2. **Connect to your repository**:
   - Choose your Git provider (GitHub, BitBucket, GitLab, etc.)
   - Authorize AWS Amplify and select your repository

3. **Configure build settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Deploy**:
   - Click "Save and deploy"
   - Amplify will automatically build and deploy your application

#### Using Amazon S3 and CloudFront

1. **Create an S3 bucket**:
   - Go to the S3 service in AWS Console
   - Create a new bucket with a unique name
   - Disable "Block all public access"

2. **Upload your build**:
   - Build your application: `npm run build`
   - Upload all files from the `dist` folder to your S3 bucket

3. **Configure the bucket for static website hosting**:
   - Go to the bucket properties
   - Enable "Static website hosting"
   - Set "Index document" to "index.html"
   - Set "Error document" to "index.html" (for SPA routing)

4. **Set up CloudFront** (optional, for better performance):
   - Go to CloudFront in AWS Console
   - Create a new distribution
   - Set the S3 bucket as the origin
   - Configure cache behavior to forward all headers
   - Set "Default root object" to "index.html"

5. **Set up custom error responses** (for SPA routing):
   - In the CloudFront distribution settings, go to "Error Pages"
   - Create a custom error response for 403 and 404 errors
   - Set "Response page path" to "/index.html"
   - Set "HTTP Response Code" to 200

### Deploying to Azure

#### Using Azure Static Web Apps

1. **Create a Static Web App**:
   - Go to the Azure Portal
   - Search for "Static Web Apps"
   - Click "Create"

2. **Configure the app**:
   - Select your subscription and resource group
   - Name your app
   - Choose a region
   - Sign in to GitHub and select your repository

3. **Configure build settings**:
   - Build Preset: "React"
   - App location: "/"
   - API location: "" (leave empty if not using Azure Functions)
   - Output location: "dist"

4. **Review and create**:
   - Click "Review + create"
   - After validation passes, click "Create"

5. **GitHub Actions will deploy your app**:
   - Azure creates a GitHub Actions workflow file in your repository
   - The workflow builds and deploys your app automatically

### Deploying to Google Cloud

#### Using Firebase Hosting

1. **Set up Firebase**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase in your project**:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your Firebase project or create a new one
   - Set "public directory" to "dist"
   - Configure as a single-page app: "Yes"

3. **Build and deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

#### Using Google Cloud Run

1. **Create a Dockerfile**:
   ```dockerfile
   FROM nginx:alpine
   COPY dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 8080
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**:
   ```
   server {
     listen 8080;
     root /usr/share/nginx/html;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

3. **Build and push to Google Container Registry**:
   ```bash
   npm run build
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/quotation-app
   ```

4. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy quotation-app \
     --image gcr.io/YOUR_PROJECT_ID/quotation-app \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1
   ```

### Deploying to VPS (Digital Ocean, Linode, etc.)

1. **Set up your server**:
   - Create a new VPS instance
   - Install Node.js and npm if you want to build on the server
   - Install Nginx or Apache as a web server

2. **Configure Nginx**:
   ```
   server {
     listen 80;
     server_name yourdomain.com www.yourdomain.com;
     root /var/www/quotation-app;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

3. **Deploy your application**:
   - Build locally: `npm run build`
   - Upload the `dist` folder to `/var/www/quotation-app` on your server
   - Or use a deployment tool like rsync or a CI/CD pipeline

4. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### Deploying to XAMPP (Localhost)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Copy to XAMPP htdocs**:
   - Copy all files from the `dist` folder to `C:\xampp\htdocs\quotation-app` (Windows) or `/Applications/XAMPP/htdocs/quotation-app` (Mac)

3. **Configure .htaccess**:
   Create a .htaccess file in the quotation-app directory:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /quotation-app/
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /quotation-app/index.html [L]
   </IfModule>
   ```

4. **Access the application**:
   - Start XAMPP Apache server
   - Open http://localhost/quotation-app in your browser

### Deploying to Netlify

1. **Create a netlify.toml file**:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy using Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Or deploy using Netlify UI**:
   - Go to https://app.netlify.com/
   - Drag and drop your `dist` folder
   - Or connect your GitHub repository for continuous deployment

### Deploying to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Create a vercel.json file**:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

3. **Deploy using Vercel CLI**:
   ```bash
   vercel login
   vercel
   ```

4. **Or deploy using Vercel UI**:
   - Go to https://vercel.com/
   - Import your GitHub repository
   - Configure the build settings:
     - Framework Preset: Vite
     - Build Command: npm run build
     - Output Directory: dist

## Troubleshooting

### Common Issues

1. **Blank page after deployment**:
   - Check if your server is configured to handle SPA routing
   - Ensure all files were uploaded correctly
   - Check browser console for errors

2. **404 errors when refreshing pages**:
   - Configure your server to redirect all requests to index.html
   - Check your .htaccess, nginx.conf, or server configuration

3. **API calls not working**:
   - This application uses localStorage and doesn't require a backend API
   - If you've added a backend, ensure CORS is configured correctly

4. **Images or assets not loading**:
   - Check if paths are correct
   - Ensure all assets were included in the build

## License

MIT

## Contact

For support or inquiries, please contact [your-email@example.com](mailto:your-email@example.com).