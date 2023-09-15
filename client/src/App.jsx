import "./App.css";
import { Route, Routes } from "react-router-dom";
import { UserContextProvider } from "../Context/UserContext";
import Layout from "./Layout";
import PrivateRoute from "../PrivateRoute";
import IndexPage from "./Pages/IndexPage/IndexPage";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import CreatePost from "./Pages/CreatePost/CreatePost";
import ViewPost from "./Pages/ViewPost/ViewPost";
import EditPost from "./Pages/EditPost/EditPost";
import ExploreTopics from "./Pages/ExploreTopics/ExploreTopics";
import TopicDetails from "./Pages/TopicDetails/TopicDetails";
import Profile from "./Pages/Profile/Profile";
import EditProfile from "./Pages/EditProfile/EditProfile";
import BookmarkView from "./Pages/BookmarkView/BookmarkView";
import BookmarkPostsView from "./Pages/BookmarkPostsView/BookmarkPostsView";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route path="/post/:id" element={<ViewPost />} />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <EditPost />
              </PrivateRoute>
            }
          />
          <Route path="/explore-topics" element={<ExploreTopics />} />
          <Route
            path="/topics/:topicName/:topicId"
            element={<TopicDetails />}
          />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route
            path="/profile/edit/:userId"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookmarks/lists"
            element={
              <PrivateRoute>
                <BookmarkView />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookmarks/list/:bookmarkName/:userId"
            element={
              <PrivateRoute>
                <BookmarkPostsView />
              </PrivateRoute>
            }
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
