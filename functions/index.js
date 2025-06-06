import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import logger from "firebase-functions/logger";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from "dotenv"; // 取消注释
dotenv.config(); // 加载环境变量

const corsMiddleware = cors({ origin: true });

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account key
const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 从环境变量中获取

const REPO_OWNER = "News-Fetcher";
const REPO_NAME = "news-fetcher";
const WORKFLOW_ID = "python-app.yml";

// Verify that the service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Service account key file not found at path: ${serviceAccountPath}`);
}

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: 'https://news-fetcher-platform-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'news-fetcher-platform.firebasestorage.app'
  });
}

const database = admin.database();
const storage = admin.storage();

export const getTags = onRequest((req, res) => {
  logger.info("Received request to get tags.");
  corsMiddleware(req, res, async () => {
    const ref = database.ref("podcasts");
    const snapshot = await ref.get();
    if (!snapshot.exists()) {
      logger.warn("No podcasts found in the database.");
      return res.status(404).send("No podcasts found.");
    }

    const podcasts = snapshot.val();
    const tags = podcasts.map(podcast => podcast.tags).flat();
    const uniqueTags = [...new Set(tags)];
    res.status(200).json(uniqueTags);
  });
});

// 获取博客列表
export const getBlogList = onRequest((req, res) => {
  logger.info("Received request to get blog list.");
  corsMiddleware(req, res, async () => {
    try {
      const ref = database.ref("podcasts");
      logger.info("Fetching podcasts from database...");
      const snapshot = await ref.get();

      if (!snapshot.exists()) {
        logger.warn("No podcasts found in the database.");
        return res.status(404).send("No podcasts found.");
      }

      const podcasts = snapshot.val();

      // Function to get the default image URL
      const getDefaultImageUrl = async () => {
        const file = storage.bucket().file('podcasts_image/df_image.png');
        logger.info("Has already get the file");
        try {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Set a far future expiration date
          });
          return url;
        } catch (error) {
          logger.error("Error getting default image URL:", error);
          // Fallback to an empty string or a publicly accessible URL if available
          return "";
        }
      };

      // Fetch the default image URL once to avoid multiple requests
      const defaultImageUrl = await getDefaultImageUrl();

      // Map the podcasts to include img_url
      let fileList = podcasts.map((item) => ({
        title: item.title,
        description: item.description,
        filename: `${item.sha256}.mp3`,
        img_url: item.img_url ? item.img_url : defaultImageUrl,
        date: item.date,
        tags: item.tags,
        total_duration: item.total_duration,
      }));

      // 按照日期降序排序
      fileList.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      // Optional pagination
      let { page, pageSize } = req.query;
      page = parseInt(page);
      pageSize = parseInt(pageSize);
      if (!isNaN(page) && !isNaN(pageSize) && page > 0 && pageSize > 0) {
        const start = (page - 1) * pageSize;
        fileList = fileList.slice(start, start + pageSize);
      }

      logger.info(`Successfully fetched ${fileList.length} podcasts.`);
      res.status(200).json(fileList);
    } catch (error) {
      logger.error("Error fetching blog list:", error);
      res.status(500).send("Failed to fetch blog list.");
    }
  });
});

export const getActionDetail = onRequest(async (req, res) => {
  corsMiddleware(req, res, async () => {
    logger.info("Received request to get GitHub action details.");

    // Fetch GitHub token from environment variable (ensure it's set in your environment)
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // GitHub API URL for fetching action runs
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/runs`;

    // GitHub Authorization Header
    const headers = {
      "Authorization": `Bearer ${GITHUB_TOKEN}`
    };

    try {
      const response = await axios.get(url, { headers });
      // Handle the response from GitHub API
      logger.info("GitHub Action Details retrieved successfully.");

      const ref = database.ref("actions");
      const snapshot = await ref.get();
      if (!snapshot.exists()) {
        logger.warn("No actions found in the database.");
        return res.status(404).send("No actions found.");
      }
      const running_actions = snapshot.val();
      logger.info("actions:", running_actions);

      const firstTenActions = response.data.workflow_runs.slice(0, 10).map(action => ({
        id: action.id,
        created_at: action.created_at,
        name: running_actions[action.id] ? running_actions[action.id] : action.name,
        status: action.status,
      }));
      logger.info(`Retrieved first 10 action runs:`, firstTenActions);

      res.status(200).json(firstTenActions);
    } catch (error) {
      // Handle errors if the request fails
      logger.error("Error fetching GitHub Action Details:", error);
      res.status(500).send("Error fetching GitHub Action Details");
    }
  });
});

export const downloadFile = onRequest((req, res) => {
  logger.info("Received request to download file.");
  corsMiddleware(req, res, async () => {
    const { filename } = req.query;
    if (!filename) {
      logger.warn("Filename is required but not provided.");
      return res.status(400).send("Filename is required.");
    }

    try {
      const bucket = storage.bucket();
      const file = bucket.file(`podcasts/${filename}`); // 添加前缀 podcasts/
      logger.info(`Checking existence of file: ${filename}`);

      // 检查文件是否存在
      const [exists] = await file.exists();
      if (!exists) {
        logger.warn(`File not found: ${filename}`);
        return res.status(404).send("File not found.");
      }

      // 获取文件的元信息（包括大小）
      const [metadata] = await file.getMetadata();
      const fileSize = metadata.size;

      // 检查是否有 Range 请求
      const range = req.headers.range;
      if (range) {
        logger.info(`Handling Range request: ${range}`);
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // 验证范围是否有效
        if (start >= fileSize || end >= fileSize || start > end) {
          logger.warn("Invalid Range request.");
          return res.status(416).header("Content-Range", `bytes */${fileSize}`).send();
        }

        // 返回指定范围的数据
        res.status(206).header({
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Content-Type": "audio/mpeg",
        });
        logger.info(`Streaming file range: ${start}-${end}`);
        file.createReadStream({ start, end }).pipe(res).on("error", (error) => {
          logger.error("Error streaming file:", error);
          res.status(500).send("Error streaming file.");
        });
      } else {
        // 如果没有 Range 请求，返回整个文件
        res.header({
          "Accept-Ranges": "bytes",
          "Content-Length": fileSize,
          "Content-Type": "audio/mpeg",
        });
        logger.info(`Streaming entire file: ${filename}`);
        file.createReadStream().pipe(res).on("error", (error) => {
          logger.error("Error streaming file:", error);
          res.status(500).send("Error streaming file.");
        });
      }
    } catch (error) {
      logger.error("Error downloading file:", error);
      res.status(500).send("Failed to process the request.");
    }
  });
});

// 触发 GitHub Actions 工作流的函数
export const triggerPodcastGeneration = onRequest(async (req, res) => {
  logger.info("Received request to trigger podcast generation.");
  const allowedMethods = ["scraping", "crawling"]; 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  corsMiddleware(req, res, async () => {
    if (req.method !== "POST") {
      logger.warn("Invalid HTTP method. Only POST is allowed.");
      return res.status(405).send("Method Not Allowed. Use POST.");
    }

    const {
      news_websites_scraping,
      email,
      method,
      be_concise,
    } = req.body;

    if (!news_websites_scraping || !email) {
      logger.warn("Missing news_websites_scraping or email in request body.");
      return res.status(400).send("Bad Request: news_websites_scraping and email are required.");
    }

    // 校验 email 格式
    if (!emailRegex.test(email)) {
      logger.warn(`Invalid email format: ${email}`);
      return res.status(400).send("Bad Request: Invalid email format.");
    }

    // 校验 method 字段（如果 method 非必需，可在此加入判断 method 是否存在）
    if (method && !allowedMethods.includes(method)) {
      logger.warn(`Invalid method: ${method}. Allowed methods are: ${allowedMethods.join(", ")}.`);
      return res.status(400).send("Bad Request: Invalid method.");
    }

    try {
      // 将 JSON 配置字符串化
      const scraping_config_str = JSON.stringify(news_websites_scraping);

      logger.info("scraping_config_str:", scraping_config_str);
      logger.info("email:", email);
      logger.info("method:", method);
      logger.info("be_concise:", be_concise);

      // 触发 GitHub Actions 工作流
      if (!GITHUB_TOKEN) {
        throw new Error("GitHub token is not set in environment variables.");
      }

      logger.info("GITHUB_TOKEN:", GITHUB_TOKEN);

      const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`;

      const payload = {
        ref: "master",
        inputs: {
          scraping_config: scraping_config_str,
          email: email,
          method: method,
          be_concise: be_concise,
        },
      };

      const response = await axios.post(githubApiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      // todo: 单纯等待对于并发任务会出现命名混淆，希望借助其他方法确认id信息
      await new Promise(resolve => setTimeout(resolve, 3000));

      // GitHub API URL for fetching action runs
      const action_url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/runs`;

      // GitHub Authorization Header
      const headers = {
        "Authorization": `Bearer ${GITHUB_TOKEN}`
      };
      const action_response = await axios.get(action_url, { headers });

      logger.info("action_response:", action_response.data);
      const action_data = action_response.data;
      const first_response = action_data.workflow_runs[0];
      logger.info("first_response:", first_response);

      const ref = database.ref("actions");
      const snapshot = await ref.get();
      let actions = snapshot.exists() ? snapshot.val() : {};

      actions[first_response.id] = `${email} triggered event`;
      ref.set(actions);
      logger.info("actions:", actions);

      if (response.status === 204) {
        logger.info("GitHub Actions workflow triggered successfully.");
        return res.status(200).send("Podcast generation triggered successfully.");
      } else {
        logger.error("Failed to trigger GitHub Actions workflow.", response.data);
        return res.status(response.status).send("Failed to trigger GitHub Actions workflow.");
      }
    } catch (error) {
      logger.error("Error triggering podcast generation:", error);
      return res.status(500).send("Internal Server Error.");
    }
  });
});