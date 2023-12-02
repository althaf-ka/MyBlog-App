import React, { useEffect, useState } from "react";
import "./ExploreTopics.css";
import axios from "../../../config/axios";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";

function ExploreTopics() {
  const [suggestions, setSuggestions] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const controller = new AbortController();

        const response = await axios.get("/topics/topic-suggestions", {
          signal: controller.signal,
        });

        const suggestionTitles = response.data.map(suggestion => ({
          id: suggestion._id,
          name: suggestion.title,
        }));

        setSuggestions(suggestionTitles);
        setLoading(false);

        return () => {
          controller.abort();
        };
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(error.response.data);
        }
      }
    };
    fetchSuggestions();
  }, []);

  const handleShowMoreClick = () => {
    setShowMore(!showMore);
  };

  const handleOnSelect = topic => {
    const topicQuery = topic.name.replace(/\s+/g, "-").toLowerCase();
    navigate(`/topics/${topicQuery}/${topic.id}`);
  };

  const sortedSuggestions = suggestions.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const topicsByLetter = sortedSuggestions.reduce((acc, topic) => {
    const firstLetter = topic.name.charAt(0).toUpperCase();
    return {
      ...acc,
      [firstLetter]: [...(acc[firstLetter] || []), topic],
    };
  }, {});

  if (loading) return <TailSpinLoader size={70} wrapperClass="center-loader" />;

  return (
    <div className="topic-explore-container">
      <div className="Topic-header">
        <h2>Explore Topics</h2>
        <ReactSearchAutocomplete
          items={suggestions}
          onSelect={handleOnSelect}
        />
      </div>

      <div className="explore-topics-btn-container">
        {suggestions.slice(0, 30).map((topic, index) => {
          const topicQuery = topic.name.replace(/\s+/g, "-").toLowerCase();
          return (
            <Link
              to={`/topics/${topicQuery}/${topic.id}`}
              key={index}
              className="topic-pill-btn"
            >
              {topic.name}
            </Link>
          );
        })}

        <button
          onClick={handleShowMoreClick}
          className={`topic-pill-btn more-btn ${showMore ? "clicked" : ""}`}
        >
          {showMore ? "Less" : "More"}
        </button>
      </div>

      {showMore && (
        <div className="topics-box">
          {Object.entries(topicsByLetter).map(([letter, topics]) => (
            <div className="topics-list-box" key={letter}>
              <div className="letters-sticky">{letter}</div>
              <ul className="topic-list">
                {topics.map(topic => (
                  <Link
                    to={`/topics/${topic.name
                      .replace(/\s+/g, "-")
                      .toLowerCase()}/${topic.id}`}
                    key={topic.id}
                  >
                    <li className="topic-item">{topic.name}</li>
                  </Link>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExploreTopics;
