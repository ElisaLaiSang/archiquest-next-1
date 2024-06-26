import { useEffect, useState } from "react";

type Tag = {
  text: string;
  selected: boolean;
};

export default function TagCloud({
  totalTags,
  handleSelect,
  tags,
}: {
  totalTags: number;
  handleSelect: (selectedTags: string[]) => void;
  tags: Tag[];
}) {
  // No need to generate tags internally since they are provided as a prop

  // When a tag is selected, update the state and call the handleSelect callback
  function handleTagSelect(index: number) {
    const newTags = [...tags];
    newTags[index].selected = !newTags[index].selected;
    handleSelect(newTags.filter((tag) => tag.selected).map((tag) => tag.text));
  }

  // Render the provided tags
  return (
    <div className="flex w-full flex-wrap md:text-sm lg:text-sm my-2 ml-2 mr-2" style={{ fontSize: '0.7rem' }}>
      {tags.map((t, i) => (
        <button
          key={i}
          onClick={() => handleTagSelect(i)}
          className={`rounded-lg ${
            t.selected ? "bg-slate-500" : "bg-gray-200"
          } p-1.5 hover:shadow mx-1 my-1`}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}