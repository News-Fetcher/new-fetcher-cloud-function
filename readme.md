# News Fetcher Platform

This project is designed to automatically fetch news from specified sources and integrate with a backend service and a frontend display interface. Key features include:

- **Automated News Retrieval**: Fetches the latest news from external APIs or news sources.
- **Data Management**: Uses Firebase or another database platform to store and manage news data.
- **API Integration**: Provides customizable APIs for frontend or other systems to consume the data.

## Environment Setup

Before running the project, ensure the following environment setup steps are completed.

### 1. Configure the `.env` File

Create a `.env` file in the project’s root directory and add the required environment variables:

```bash
GITHUB_TOKEN=your_github_token
# Example:
# GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Add other environment variables as needed
```

Make sure that `GITHUB_TOKEN` and other required variables are set so the project can run properly.

### 2. Download the Firebase `serviceAccountKey.json` File

Visit the [Firebase Console](https://console.firebase.google.com/) and follow the steps below:

1. Select your Firebase project.
2. Go to the "Project Settings" page.
3. Navigate to the "Service Accounts" section.
4. Click "Generate New Private Key" to download the `serviceAccountKey.json`.
5. Place this file in a designated folder (e.g., `functions` or `config`) within your project. **Do not commit this file to version control.** Keep it secure.

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Run the Project

```bash
npm run start
# or
yarn start
```

Once the project starts, it will automatically fetch news data and store it in Firebase.

## Deployment

You can deploy this project in various ways:

- **Firebase Functions**: Directly deploy backend functions to Firebase.
- **Docker**: Build a Docker image and run it on any container-supported environment.
- **Other Cloud Platforms**: Deploy on AWS, GCP, Azure, or any suitable cloud environment.

Configure the deployment process according to your environment and requirements.

## Notes & Best Practices

- **Security**: Do not commit `.env` and `serviceAccountKey.json` files to your public repository. They contain sensitive credentials.
- **Environment Variables**: In CI/CD pipelines, set environment variables through the platform’s secure settings. Avoid hardcoding secrets in the source code.
- **Key Management**: Regularly check Firebase console settings and rotate your keys and tokens as needed.