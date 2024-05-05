import { useEffect, useState } from "react";

type Tag = {
  text: string;
  selected: boolean;
};

export default function TagCloud({
  prompt,
  totalTags,
  handleSelect,
  tags,
}: {
  prompt: string;
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
    <div className="flex justify-between w-full flex-wrap">
      {tags.map((t, i) => (
        <button
          key={i}
          onClick={() => handleTagSelect(i)}
          className={`rounded-lg ${
            t.selected ? "bg-slate-500" : "bg-gray-200"
          } p-2 hover:shadow m-3`}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}