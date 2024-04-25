import { getGroqCompletion } from "@/ai/groq";
import { generateTagsPrompt } from "@/ai/prompts";
import { useEffect, useState } from "react";

type Tag = {
  text: string;
  selected: boolean;
};

//Generates a tag cloud (list of strings) using a prompt and total number of tags
//The handleSelect callback is called whenever a tag is selected
export default function TagCloud({
  prompt,
  totalTags,
  handleSelect,
}: {
  prompt: string;
  totalTags: number;
  handleSelect: (selectedTags: string[]) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);

  //Generate tags when the component is loaded
  useEffect(() => {
    //call Groq to generate tags
    const generateTags = async () => {
      const tagString = await getGroqCompletion(
        prompt,
        totalTags * 2,
        generateTagsPrompt
      );
      const tagOptions = tagString.split(/\d+/);
      setTags(tagOptions.map((text) => ({ text: text, selected: false })));
    };
    generateTags();
  }, [prompt, totalTags]);

  //When a tag is selected, update the state and call the handleSelect callback
  function handleTagSelect(index: number) {
    const newTags = [...tags];
    newTags[index].selected = !newTags[index].selected;
    setTags(newTags);
    handleSelect(newTags.filter((tag) => tag.selected).map((tag) => tag.text));
  }

  //Attempt at drag and drop UI
  function handleDragStart(e: React.DragEvent<HTMLButtonElement>, index: number) {
    e.dataTransfer.setData("text/plain", index.toString());
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, dropIndex: number) {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const newTags = [...tags];
    const draggedTag = newTags[draggedIndex];
    newTags.splice(draggedIndex, 1);
    newTags.splice(dropIndex, 0, draggedTag);
    setTags(newTags);
  }

  //render the tags
  return (
    <div
      className="flex justify-between w-full flex-wrap"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, tags.length)}
    >
      {tags.map((t, i) => (
        <button
          key={i}
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onClick={() => handleTagSelect(i)}
          className={`rounded-lg ${t.selected ? "bg-slate-500" : "bg-white"
          } p-2 hover:shadow m-4`}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}