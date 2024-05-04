import React, { createContext, useState, useContext } from "react";

const TagContext = createContext();

export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState([]);

  const updateTags = (newTags) => {
    setTags(newTags);
  };

  return (
    <TagContext.Provider value={{ tags, updateTags }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);