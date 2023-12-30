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

### Image Uploads
**`main` Branch**
- Utilizes Multer for local image uploads

**`image-kit` Branch**
- Integrates ImageKit for cloud-based image hosting




