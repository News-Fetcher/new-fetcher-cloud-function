# News Fetcher Platform

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Configuration](#installation-and-configuration)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Set Up Firebase Service Account](#3-set-up-firebase-service-account)
  - [4. Configure Environment Variables](#4-configure-environment-variables)
  - [5. Set Firebase Environment Variables (Production)](#5-set-firebase-environment-variables-production)
  - [6. Deploy Firebase Functions](#6-deploy-firebase-functions)
  - [7. Run the Frontend Application](#7-run-the-frontend-application)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [Common Issues](#common-issues)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## Project Overview

**News Fetcher Platform** is an automated news summarization and podcast generation system. The platform generates daily 20-40 minute podcast episodes at 8 AM, aggregating the latest news from multiple websites. Users can easily browse and listen to the latest podcasts through a user-friendly frontend interface.

## Features

- **Automated News Scraping**: Regularly fetches the latest articles from specified news websites.
- **Podcast Generation**: Converts scraped news content into audio podcasts for convenient listening.
- **User-Friendly Frontend**: Intuitive interface built with Vue.js for browsing, playing, and managing podcasts.
- **Real-Time Updates**: Automatically generates new podcast content daily to keep users informed with the latest news.

## Project Structure

```
news-fetcher-platform/
├── functions/                # Firebase Cloud Functions code
│   ├── index.js
│   └── readme.md
├── src/                      # Frontend code (Vue.js)
│   ├── App.vue
│   └── ...other frontend files
├── .env                      # Environment variables (GitHub Token)
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- **Node.js**: Ensure you have the latest version of Node.js installed.
- **Firebase CLI**: Required for managing and deploying Firebase projects.
- **GitHub Token**: Personal access token for accessing GitHub APIs.
- **Firebase Project**: An existing Firebase project to deploy cloud functions.

## Installation and Configuration

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/news-fetcher-platform.git
cd news-fetcher-platform
```

### 2. Install Dependencies

#### Frontend Dependencies

Navigate to the frontend directory and install the required packages:

```bash
cd src
npm install
```

#### Backend Dependencies (Firebase Cloud Functions)

Navigate to the functions directory and install the required packages:

```bash
cd ../functions
npm install
```

### 3. Set Up Firebase Service Account

To authenticate your Firebase project, you need to download the `serviceAccountKey.json` file from the Firebase Console.

1. **Access Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Select your project (e.g., `news-fetcher-platform`).

2. **Generate Service Account Key**:
   - Navigate to **Project Settings**.
   - Click on the **Service Accounts** tab.
   - Click **Generate New Private Key**.
   - Download the `serviceAccountKey.json` file.

3. **Add the Service Account Key to Your Project**:
   - Place the downloaded `serviceAccountKey.json` file into the `functions/` directory of your project.

### 4. Configure Environment Variables

Create a `.env` file in the root directory of your project and add your GitHub Token:

```env
GITHUB_TOKEN=xxx
```

**Important**: Ensure that the `.env` file is added to your `.gitignore` to prevent sensitive information from being committed to version control.

### 5. Set Firebase Environment Variables (Production)

While `.env` is used for local development, it's recommended to use Firebase's environment configuration for production.

Set the GitHub Token in Firebase Functions config:

```bash
firebase functions:config:set github.token="ghp_yourGitHubTokenHere"
```

### 6. Deploy Firebase Functions

Deploy the updated Firebase functions to your project:

```bash
firebase deploy --only functions
```

### 7. Run the Frontend Application

Navigate to the frontend directory and start the development server:

```bash
cd src
npm run serve
```

Open your browser and visit `http://localhost:8080` to access the application.

## Usage

- **Browse Podcasts**: Upon opening the application, you'll see a list of the latest podcasts. Click on any podcast cover to start playing.
- **Audio Controls**: Use the audio player at the bottom to control playback, including play, pause, and volume adjustments.
- **Automatic Updates**: The system automatically fetches the latest news and generates new podcast episodes daily at 8 AM.

## Security Considerations

- **Protect Sensitive Files**: Ensure that both `.env` and `serviceAccountKey.json` files are included in your `.gitignore` to prevent accidental exposure of sensitive information.
- **Minimal Permissions**: Use GitHub Tokens and Firebase Service Accounts with the least privileges necessary to reduce security risks.

## Common Issues

### How to Generate a GitHub Token

1. **Log in to GitHub**:
   - Go to [GitHub](https://github.com/) and log in to your account.

2. **Navigate to Personal Access Tokens**:
   - Go to **Settings** > **Developer settings** > **Personal access tokens**.

3. **Generate a New Token**:
   - Click **Generate new token**.
   - Select the required scopes (e.g., `repo`, `read:org`).

4. **Copy the Token**:
   - Once generated, copy the token and add it to your `.env` file as shown above.

### Updating Firebase Service Account Key

If you need to update the `serviceAccountKey.json` file:

1. Repeat the steps in [Set Up Firebase Service Account](#3-set-up-firebase-service-account) to download the new key.
2. Replace the existing `serviceAccountKey.json` in the `functions/` directory with the new file.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a New Branch**: `git checkout -b feature/YourFeature`
3. **Commit Your Changes**: `git commit -m "Add some feature"`
4. **Push to the Branch**: `git push origin feature/YourFeature`
5. **Open a Pull Request**

Please ensure that your contributions adhere to the project's coding standards and include appropriate tests where necessary.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions, suggestions, or feedback, please reach out to us:

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **GitHub**: [https://github.com/your-username/news-fetcher-platform](https://github.com/your-username/news-fetcher-platform)

## Acknowledgements

- **Firebase**: For providing robust backend infrastructure.
- **Vue.js**: For the flexible and powerful frontend framework.
- **dotenv**: For easy environment variable management.

---

**Note**: Do not publicly share your `serviceAccountKey.json` file or the contents of your `.env` file to ensure the security of your project.

---

_Last Updated: 2024-12-12_