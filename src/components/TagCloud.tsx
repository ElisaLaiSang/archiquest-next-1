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
        totalTags,
        generateTagsPrompt
      );
  
            // Split the tag string into tag options
            const tagOptions = tagString.split(".");
      
            // Filter out tag options containing numbers
            const filteredTags = tagOptions
              .map((text) => text.trim())
              .filter((text) => text && !/\d/.test(text)); // Filter out tags containing numbers
            
            // Create tag objects with selected state
            const tagsWithSelectedState = filteredTags.map((text) => ({
              text,
              selected: false
            }));
      
            // Set the filtered tags in state
            setTags(tagsWithSelectedState);
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

  //render the tags
  return (
    <div
      className="flex justify-between w-full flex-wrap"
    >
      {tags.map((t, i) => (
        <button
          key={i}
          onClick={() => handleTagSelect(i)}
          className={`rounded-lg ${t.selected ? "bg-slate-500" : "bg-gray-300"
          } p-2 hover:shadow m-3`}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}