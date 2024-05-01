//Gallery of images with a callback function for when the user clicks an image
export default function ImageGallery({
  images,
  handleClickImage,
}: {
  images: string[];
  handleClickImage?: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 w-full gap-4">
      {images.map((url, i) => (
        <button
          key={i}
          className="rounded-lg overflow-hidden"
          onClick={() => handleClickImage && handleClickImage(i)}
        >
          <img src={url} />
        </button>
      ))}
    </div>
  );
}

