import React, { useEffect, useState } from "react";
import "./ExploreTopics.css";
import axios from "../../../config/axios";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { Link, useNavigate } from "react-router-dom";

function Topics() {
  const [suggestions, setSuggestions] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get("/topic-suggestions");
        const suggestionTitles = response.data.map((suggestion, index) => ({
          id: index,
          name: suggestion.title,
        }));
        setSuggestions(suggestionTitles);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSuggestions();
  }, []);

  const handleShowMoreClick = () => {
    setShowMore(!showMore);
  };

  const handleOnSelect = topic => {
    const topicQuery = topic.name.replace(/\s+/g, "-").toLowerCase();
    navigate(`/topics/${topicQuery}`);
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

  return (
    <>
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
              to={`/topics/${topicQuery}`}
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
                      .toLowerCase()}`}
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
    </>
  );
}

export default Topics;
