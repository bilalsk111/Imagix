# 🎨 Imagix AI

Imagix AI is a lightweight web app that turns text prompts into high-fidelity images in seconds, using the open-weight **Flux** model via Pollinations.AI - with zero API keys required for image generation.

---

## ✨ Key Features

- **🖼️ Flux Image Generation** - Rapid, high-fidelity, text-clean image synthesis powered by the Flux model via Pollinations.AI.
- **📦 Local Gallery Vault** - Saves your generation history natively in the browser via **IndexedDB**, with zero backend database overhead.
- **📱 Installable PWA** - Full Progressive Web App support (Workbox) lets users install Imagix AI directly on mobile or desktop.
- **⚡ Advanced Media Controls** - Fullscreen Lightbox previewing and one-click direct-to-device JPEG downloads.
- **🛡️ Resilient UX** - Instant error banners with a one-click `Retry` for connection or API dropouts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Axios, HTML5/CSS3 (Glassmorphism, Ambient Glows) |
| **Backend** | Node.js, Express.js |
| **AI Engine** | Pollinations.AI (Flux) |
| **Storage & PWA** | Client-side IndexedDB, Vite PWA Plugin, Workbox |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/bilalsk111/Imagix.git
cd Imagix
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root folder:

```env
PORT=5000
```

### 3. Install & Run the Backend

```bash
# In the project root directory
npm install
npm run dev
```

### 4. Install & Run the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

### 5. Production Build

Build optimized static PWA assets to be served directly through the Express server:

```bash
cd frontend
npm run build
```

---

## 📂 Project Architecture

```
├── backend/
│   ├── public/          # Compiled static production client bundle (PWA)
│   ├── controller/       # Image generation request handler
│   ├── routes/          # Express API endpoints
│   └── server.js        # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # UI parts: PromptInput, ImageShowcase, GalleryVault, Lightbox
│   │   ├── db.js         # IndexedDB storage layer
│   │   ├── App.jsx       # Central orchestrator and state machine
│   │   └── App.css       # Styling, animations, and design tokens
│   └── vite.config.js    # Vite build and PWA/Workbox config
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
