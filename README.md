
# 🎥 Videoflix - Angular 17 Video Streaming Platform

Videoflix is a video streaming platform inspired by Netflix. This is a learning/demo project where users can register and stream videos. Built with **Angular 17.3**.

---

## 📌 Features

✅ **User Registration & Login** (Double Opt-In with email confirmation)\
✅ **Password Reset Functionality**\
✅ **Video Streaming with 4 Resolutions**: 120p, 360p, 720p, 1080p\
✅ **Automatic or Manual Quality Selection**\
✅ **Progress Saving for Videos**\
✅ **Dashboard with Categories & Watchlist**\
✅ **Resume Playback Prompt for Partially Watched Videos**

Administrators can upload videos via the backend, but regular users cannot.

---

## 🚀 Installation & Local Development

### 1️⃣ Requirements

- **Node.js** (Recommended: v20+)
- **Angular CLI** (Install with `npm install -g @angular/cli`)

### 2️⃣ Clone & Install Dependencies

```bash
git clone https://github.com/OezkanSarikaya/videoflix_frontend.git
cd videoflix
npm install
```

### 3️⃣ Create Configuration File

Create the folder `src/app/environment` and add a file `environment.ts` with the following content:

```typescript
export const environment = { 
    apiUrl: 'http://localhost:8000', // Your backend URL (local development)
};
```

### 4️⃣ Start the Project on Development Server

```bash
ng serve --open
```

The frontend will be available at [**http://localhost:4200/**](http://localhost:4200/).

---

## 🌍 Production Deployment

### 🔧 1️⃣ Build the Project

```bash
ng build
```

The production build is generated in `dist/videoflix_frontend/browser/`. Upload this folder to your web server.

---

## 🌐 Hosting on Apache

If using Apache as the web server, create a `.htaccess` file in the root directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures Angular routes work correctly.

---

## 🚀 Hosting with Nginx

If using Nginx, use this configuration:

```nginx
server {
    listen 80;
    server_name your-server.com;

    root /path/to/your/project/dist/videoflix_frontend/browser;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    error_page 404 /index.html;
}
```

🚨 **Important:** If using a backend, ensure API routes (`/api/`) are properly redirected.

---

## 🖼️ Screenshot

![Videoflix Screenshot](https://oezkan-sarikaya.de/assets/img/projectimages/videoflix.png)

---

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

---

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

---


## 🛠 Still To Do

- **Backend Integration:** The final API URL will be provided later.-
- **Additional Features as Needed**

---

## 📚 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it. 🎉

---

### 📩 Contact & Feedback

If you have any questions or want to contribute, feel free to create an issue or pull request on GitHub! 🚀


