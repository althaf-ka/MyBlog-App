import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./ClapButton.css";
import { ClapIcon } from "../../assets";
import axios from "../../../config/axios";
import SignInOrUpModel from "../SignInOrUpModel/SignInOrUpModel";
import { toast } from "react-toastify";

const ClapButton = forwardRef(
  ({ currentUserId, postId, authorId, setIsUserClapped }, ref) => {
    const [isClicked, setIsClicked] = useState(false);
    const [animation, setAnimation] = useState(0);
    const [totalClaps, setTotalClaps] = useState(0);
    const [userClapCount, setUserClapCount] = useState(0);
    const [showBubble, setShowBubble] = useState(false);
    const [showSignInOrUpModel, setShowSignInOrUpModel] = useState(false);
    let bubbleTimerRef = useRef(null);

    useEffect(() => {
      const controller = new AbortController();
      axios
        .get(
          `/applauses/total-applause-detail/?postId=${postId}&userId=${currentUserId}`,
          { signal: controller.signal }
        )
        .then(response => {
          setUserClapCount(response.data?.currentUserClaps || 0);
          setTotalClaps(response.data?.totalClaps || 0);
          if (response.data?.currentUserClaps > 0)
            setIsClicked(true), setIsUserClapped(true);
        })
        .catch(err => {
          if (!controller.signal.aborted) {
            toast.error(err.response.data);
          }
          if (err.response && err.response.status === 404) return;
        });

      return () => {
        controller.abort();
      };
    }, [currentUserId, postId]);

    const addApplauseToDb = async () => {
      //Get the current value, even if the state update fails.Max is 50
      const updatedClapCount = Math.min(userClapCount + 1, 50);
      const applauseDetails = {
        currentUserId,
        newlyAddedClaps: updatedClapCount,
        authorId,
      };
      try {
        await axios.post(`/applauses/add/${postId}`, applauseDetails, {
          withCredentials: true,
        });
      } catch (err) {
        toast.error(err.response?.data);
        console.log(err);
      }
    };

    const handleClapClick = () => {
      setAnimation(1);
      if (!currentUserId) {
        setShowSignInOrUpModel(true);
        return;
      }

      if (userClapCount !== 50) {
        setUserClapCount(preValue => preValue + 1);
        setTotalClaps(preValue => preValue + 1);
      }

      setIsClicked(true);
      setShowBubble(true);
      setIsUserClapped(true);

      clearTimeout(bubbleTimerRef.current);

      bubbleTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        addApplauseToDb();
      }, 2000);
    };

    const cancelAllPreviousClaps = async () => {
      setUserClapCount(0);
      setTotalClaps(pre => pre - userClapCount);
      setIsClicked(false);
      axios
        .delete(`/applauses/delete/${postId}/${currentUserId}`, {
          withCredentials: true,
        })
        .then(res => {
          setIsUserClapped(false);
          if (res.status === 200) return;
        })
        .catch(err => {
          toast.error(err.response?.data);
          console.log(err);
        });
    };

    useImperativeHandle(ref, () => ({
      cancelAllPreviousClaps,
    }));

    return (
      <>
        <div className="clap-icon">
          {showBubble && (
            <div className="bubble-count-shower" animation={showBubble ? 1 : 0}>
              +{userClapCount}
            </div>
          )}
          <button
            className={`clap-btn ${isClicked ? "" : "not-clicked"}`}
            onClick={handleClapClick}
            onAnimationEnd={() => setAnimation(0)}
            animation={animation}
          >
            <ClapIcon isClicked={isClicked} />
          </button>
          <p className="display-clap-count">{totalClaps}</p>
        </div>

        {showSignInOrUpModel && (
          <SignInOrUpModel
            message={"clap for this story"}
            isVisible={setShowSignInOrUpModel}
          />
        )}
      </>
    );
  }
);

export default ClapButton;
