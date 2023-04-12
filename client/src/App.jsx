import "./App.css";
import { Route, Routes } from "react-router-dom";
import { UserContextProvider } from "../Context/UserContext";
import Layout from "./Layout";
import IndexPage from "./Pages/IndexPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import CreatePostPage from "./Pages/CreatePostPage";
import PostPage from "./Pages/PostPage";
import EditPostPage from "./Pages/EditPostPage";
import PrivateRoute from "../PrivateRoute";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePostPage />
              </PrivateRoute>
            }
          />
          <Route path="/post/:id" element={<PostPage />} />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <EditPostPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
