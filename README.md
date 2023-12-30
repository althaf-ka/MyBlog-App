# MyBlog App

MyBlog is a MERN-powered full-stack application designed for effortless blogging. Create, explore, and engage with user-friendly features like topic filtering, rich text editing with React Quill, seamless image uploads via Multer or ImageKit, personalized user profiles, Google authentication, claps for post appreciation, and a flexible bookmarking system.

Made with ❤️ by MERN Stack

## Features

- **Blog Management:**
  - Create, edit, and delete blog posts.
  - Use the React Quill editor for rich text content.
  - Add a thumbnail to make posts visually appealing.

- **Topics:**
  - Associate up to 5 topics with each blog post.
  - Explore posts based on selected topics.
  - Discover trending topics with the highest number of posts.

- **User Profiles:**
  - Create and update user profiles.
  - Add a small bio, contact information, and social media links.

- **Engagement:**
  - Express appreciation for posts with the clap mechanism.
  - Organize saved posts in a default "Reading List" or create personalized lists.


- **Authentication:**
  - Implement user authentication using JWT for secure cookie-based authentication.
  - Support Google authentication for user convenience.

- **Image Uploads:**
  - Utilize either Multer for local image uploads or ImageKit for cloud-based image hosting.

- **Responsive Design:**
  - Enjoy a seamless experience across various devices with a responsive design.
  - Access MyBlog on desktops, tablets, and smartphones with ease.

- **Deployment:**
  - Two branches available: `main` and `image-kit` for different image upload configurations.
  - Environment variables for both frontend and backend configurations.



## Project Structure

#### Client
- React frontend application
- Built with Vite
- Utilizes Context API and React Router for state management and routing

#### Server
- Node.js and Express.js backend
- MongoDB serves as the primary database

## Image Uploads
**`main` Branch**
- Utilizes Multer for local image uploads
- 

**`image-kit` Branch**
- Integrates ImageKit for cloud-based image hosting


  

## Environment Variables

 

To run this project, you will need to add the following environment variables to your .env file


#### **Frontend**

 

```
VITE_BACKEND_URL=your_backend_url

VITE_GOOGLE_CLIENT_ID=your_google_client_id

```



######  If using the ImageKit version:


```
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key

VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

```

  
  

#### **Backend**

  
  

```

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_REDIRECT_URI=your_google_redirect_uri

JWT_SECRET=your_jwt_secret

MONGO_DB_URL=your_mongo_db_url

SITE_URL=your_site_url or localhost

```

  

######  If using the ImageKit version:

  

```

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key

IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

```





## Run Locally

#### Step 1: Clone the repository

```bash
  git clone git clone https://github.com/althaf-ka/MyBlog-App.git
```

#### Step 2: Navigate to the project directory:


```bash
  cd MyBlog-App
```

#### Step 3: Install Backend Dependencies and Run the Server

In your terminal, navigate to the /Server directory:

```bash
cd Server
```

Run the following commands to install the backend dependencies and start the backend server:

```bash
npm install
npm start
```

This installs necessary packages and starts the backend server, connecting to the database and listening for requests.

#### Step 4: Install Frontend Dependencies and Start the Vite Development Server

In your terminal, navigate to the /client directory:

```bash
cd client
```

Run the following commands to install the frontend dependencies and start the vite server:

```bash
npm install
npm run dev
```

This will install necessary packages and start the Vite development server for the frontend, allowing you to access the website on http://localhost:5173 in your web browser.



## Live

**Frontend :  [Render](https://render.com/ "Render")**

**Backend  :  [Render](https://render.com/ "Render")**


**Link :  https://my-blog-app-1kri.onrender.com/**

**Free Tier*

## Connect with Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/althaf-k-a-073222270)
&nbsp;&nbsp;
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/the_althaf)














