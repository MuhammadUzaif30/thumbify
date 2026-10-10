
import type { ThumbnailStyle } from "../../assets/assets";
import {
  SparkleIcon,
  SquareIcon,
  ImageIcon,
  PenToolIcon,
  CpuIcon,
  ChevronDownIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type StyleSelectorProps = {
  value: ThumbnailStyle;
  onChange: (style: ThumbnailStyle) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const StyleSelector = ({
  value,
  onChange,
  isOpen,
  setIsOpen,
}: StyleSelectorProps) => {
  const styleDescriptions: Record<ThumbnailStyle, string> = {
    "Bold & Graphic": "High contrast, bold typography, striking visuals",
    Minimalist: "Clean, simple, lots of white space",
    Photorealistic: "Photo-based, natural looking",
    Illustrated: "Hand-drawn, artistic, creative",
    "Tech/Futuristic": "Modern, sleek, tech-inspired",
  };

  const styleIcons: Record<ThumbnailStyle, ReactNode> = {
    "Bold & Graphic": <SparkleIcon className="h-4 w-4" />,
    Minimalist: <SquareIcon className="h-4 w-4" />,
    Photorealistic: <ImageIcon className="h-4 w-4" />,
    Illustrated: <PenToolIcon className="h-4 w-4" />,
    "Tech/Futuristic": <CpuIcon className="h-4 w-4" />,
  };

  const styles = Object.keys(styleDescriptions) as ThumbnailStyle[];

  const handleSelect = (style: ThumbnailStyle) => {
    onChange(style);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-3 dark">
      <label className="block text-sm font-medium text-zinc-200">
        Thumbnail Style
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-left hover:bg-zinc-800"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-medium text-zinc-100">
            {styleIcons[value]}
            <span>{value}</span>
          </div>

          <p className="text-xs text-zinc-400">
            {styleDescriptions[value]}
          </p>
        </div>

        <ChevronDownIcon
          className={`h-5 w-5 text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
          {styles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => handleSelect(style)}
              className={`flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-zinc-800 ${
                value === style ? "bg-zinc-800" : ""
              }`}
            >
              <div className="mt-0.5 text-zinc-300">
                {styleIcons[style]}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-100">
                  {style}
                </p>
                <p className="text-xs text-zinc-400">
                  {styleDescriptions[style]}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
