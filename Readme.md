# Video Sharing Platform API

This project is a RESTful API for a video sharing platform, providing features like video uploading, user subscriptions, liking videos, creating playlists, and more. The API is built using Node.js, Express.js, and MongoDB, with Mongoose as the ODM.

## Features

- **User Authentication**: Register, login, and manage user profiles.
- **Video Management**: Upload, update, delete, and view videos.
- **Likes and Comments**: Like videos, add comments, and view video likes.
- **Subscriptions**: Subscribe to channels, get channel statistics, and view subscribed channels.
- **Playlists**: Create playlists, add/remove videos from playlists, and view user playlists.
- **Tweets**: Create and view user tweets.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data, videos, and other related information.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **Cloudinary**: Media management service for storing and processing videos and images.
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Library for hashing passwords.
- **dotenv**: Module to load environment variables from a `.env` file.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TheinSoe137/Video-streaming-API.git


2. **Install Dependencies**:
   ```bash
   npm install

3. **Set up environment variables**:
  - Create a .env file in the root of the project and add the following variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret


4. **Run the Server**
   -The server will start on **localhost**
    ```bash
    npm start

## API Endpoints

## API Endpoints

### Health Check
- **GET** `/api/v1/healthcheck/`: Check the health of the API.

### Users
- **POST** `/api/v1/users/login`: Log in a user.
- **POST** `/api/v1/users/refresh-token`: Refresh access token.
- **POST** `/api/v1/users/logout`: Log out the current user.
- **POST** `/api/v1/users/change-password`: Change the current user's password.
- **GET** `/api/v1/users/current-user`: Get current user details.
- **PATCH** `/api/v1/users/update-account`: Update account details.
- **PATCH** `/api/v1/users/update-avatar`: Update user's avatar.
- **PATCH** `/api/v1/users/update-coverimg`: Update user's cover image.
- **GET** `/api/v1/users/channel/:username`: Get user channel profile.
- **GET** `/api/v1/users/history`: Get watched history.

### Tweets
- **POST** `/api/v1/tweets/createTweet`: Create a new tweet.
- **PATCH** `/api/v1/tweets/:tweetId`: Update a tweet.
- **DELETE** `/api/v1/tweets/:tweetId`: Delete a tweet.
- **GET** `/api/v1/tweets/t/:userId`: Get tweets from a user.

### Subscriptions
- **GET** `/api/v1/subscriptions/c/`: Get subscribed channels.
- **POST** `/api/v1/subscriptions/c/:channelId`: Toggle subscription for a channel.
- **GET** `/api/v1/subscriptions/u/:channelId`: Get subscribers for a channel.

### Videos
- **GET** `/api/v1/videos/`: Get all videos.
- **POST** `/api/v1/videos/`: Upload a new video.
- **GET** `/api/v1/videos/:videoId`: Get video by ID.
- **DELETE** `/api/v1/videos/:videoId`: Delete a video by ID.
- **PATCH** `/api/v1/videos/:videoId`: Update video details.
- **PATCH** `/api/v1/videos/toggle/publish/:videoId`: Toggle video publish status.

### Comments
- **GET** `/api/v1/comments/:videoId`: Get comments for a video.
- **POST** `/api/v1/comments/:videoId`: Add a comment to a video.
- **DELETE** `/api/v1/comments/c/:commentId`: Delete a comment.
- **PATCH** `/api/v1/comments/c/:commentId`: Update a comment.

### Likes
- **POST** `/api/v1/likes/toggle/v/:videoId`: Toggle like on a video.
- **POST** `/api/v1/likes/toggle/c/:commentId`: Toggle like on a comment.
- **POST** `/api/v1/likes/toggle/t/:tweetId`: Toggle like on a tweet.
- **GET** `/api/v1/likes/videos`: Get liked videos by the user.

### Playlists
- **POST** `/api/v1/playlist/`: Create a new playlist.
- **GET** `/api/v1/playlist/:playlistId`: Get playlist by ID.
- **PATCH** `/api/v1/playlist/:playlistId`: Update a playlist.
- **DELETE** `/api/v1/playlist/:playlistId`: Delete a playlist.
- **PATCH** `/api/v1/playlist/add/:videoId/:playlistId`: Add a video to a playlist.
- **PATCH** `/api/v1/playlist/remove/:videoId/:playlistId`: Remove a video from a playlist.
- **GET** `/api/v1/playlist/user/:userId`: Get playlists created by a user.

### Channel
- **GET** `/api/v1/dashboard/stats`: Get channel stats like total views, subscribers, videos, and likes.
- **GET** `/api/v1/dashboard/videos`: Get all videos uploaded by the channel.


## Contact
- For any inquiries or feedback, please reach out via email: @theinsoe.dev@gmail.com




