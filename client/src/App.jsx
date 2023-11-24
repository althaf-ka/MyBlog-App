import "./App.css";
import { Route, Routes } from "react-router-dom";
import { UserContextProvider } from "../Context/UserContext";
import { Suspense, lazy } from "react";
import Layout from "./Layout";
import PrivateRoute from "../PrivateRoute";
import IndexPage from "./Pages/IndexPage/IndexPage";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import ViewPost from "./Pages/ViewPost/ViewPost";
import ExploreTopics from "./Pages/ExploreTopics/ExploreTopics";
import TopicDetails from "./Pages/TopicDetails/TopicDetails";
import Profile from "./Pages/Profile/Profile";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";
import NotFound from "./Pages/NotFound/NotFound";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TailSpinLoader from "./Components/Loaders/TailSpinLoader";
import { PostContextProvider } from "../Context/PostContext";

const CreatePost = lazy(() => import("./Pages/CreatePost/CreatePost"));
const EditPost = lazy(() => import("./Pages/EditPost/EditPost"));
const EditProfile = lazy(() => import("./Pages/EditProfile/EditProfile"));
const BookmarkView = lazy(() => import("./Pages/BookmarkView/BookmarkView"));
const BookmarkPostsView = lazy(() =>
  import("./Pages/BookmarkPostsView/BookmarkPostsView")
);

function App() {
  return (
    <UserContextProvider>
      <PostContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <Suspense
                    fallback={
                      <TailSpinLoader size={70} wrapperClass="center-loader" />
                    }
                  >
                    <CreatePost />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route path="/post/:id" element={<ViewPost />} />
            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <Suspense
                    fallback={
                      <TailSpinLoader size={70} wrapperClass="center-loader" />
                    }
                  >
                    <EditPost />
                  </Suspense>
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
                  <Suspense
                    fallback={
                      <TailSpinLoader size={70} wrapperClass="center-loader" />
                    }
                  >
                    <EditProfile />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/bookmarks/lists"
              element={
                <PrivateRoute>
                  <Suspense
                    fallback={
                      <TailSpinLoader size={70} wrapperClass="center-loader" />
                    }
                  >
                    <BookmarkView />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/bookmarks/list/:bookmarkName/:userId"
              element={
                <PrivateRoute>
                  <Suspense
                    fallback={
                      <TailSpinLoader size={70} wrapperClass="center-loader" />
                    }
                  >
                    <BookmarkPostsView />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose="4000"
          hideProgressBar
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          pauseOnHover={false}
          transition={Slide}
          theme="colored"
          closeButton={false}
          limit={1}
        />
      </PostContextProvider>
    </UserContextProvider>
  );
}

export default App;
