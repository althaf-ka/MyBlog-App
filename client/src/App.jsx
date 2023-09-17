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
import NotFound from "./Pages/NotFound/NotFound";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose="1800"
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        transition={Slide}
        theme="colored"
        closeButton={false}
      />
    </UserContextProvider>
  );
}

export default App;
