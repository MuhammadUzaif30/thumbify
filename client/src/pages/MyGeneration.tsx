import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SoftBackdop from "../components/SoftBackdop";
import type { IThumbnail } from "../../assets/assets";
import { ArrowUpRightIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import { downloadImage } from "../configs/download";
import toast from "react-hot-toast";

const aspectRatioClassMap: Record<string, string> = {
  "16:9": "aspect-video",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
};

const MyGeneration = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThumbnails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user/thumbnails");
      setThumbnails(data.thumbnails || []);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchThumbnails();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleDownload = (image_url: string, title: string) => {
    downloadImage(image_url, title);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this thumbnail?")) return;
    try {
      const { data } = await api.delete(`/api/thumbnail/delete/${id}`);
      toast.success(data.message);
      setThumbnails((prev) => prev.filter((t) => t._id !== id));
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <SoftBackdop />
      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-200">My Generations</h1>
          <p className="text-sm text-zinc-400 mt-1">
            View and manage all your AI-generated thumbnails
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/6 border border-white/10 animate-pulse h-[260px]"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && thumbnails.length === 0 && (
          <div className="text-center py-24">
            <h3 className="text-lg font-semibold text-zinc-200">
              {isLoggedIn ? "No thumbnails yet" : "Please login to see your thumbnails"}
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              {isLoggedIn
                ? "Generate your first thumbnail to see it here"
                : "Your generated thumbnails will appear here after you sign in"}
            </p>
            {isLoggedIn ? (
              <Link
                to="/generate"
                className="inline-block mt-6 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 transition rounded-full text-sm"
              >
                Generate Thumbnail
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-block mt-6 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 transition rounded-full text-sm"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && thumbnails.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-8">
            {thumbnails.map((thumb: IThumbnail) => {
              const aspectClass =
                aspectRatioClassMap[thumb.aspect_ratio || "16:9"] || "aspect-video";

              return (
                <div
                  key={thumb._id}
                  onClick={() => navigate(`/generate/${thumb._id}`)}
                  className="mb-8 group relative cursor-pointer rounded-2xl bg-white/6 border border-white/10 transition shadow-xl break-inside-avoid"
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden rounded-t-2xl ${aspectClass} bg-black`}>
                    {thumb.image_url ? (
                      <img
                        src={thumb.image_url}
                        alt={thumb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">
                        {thumb.isGenerating ? "Generating..." : "Generation failed"}
                      </div>
                    )}

                    {thumb.isGenerating && thumb.image_url && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm font-medium text-white">
                        Generating...
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2">
                      {thumb.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/8">{thumb.style}</span>
                      <span className="px-2 py-0.5 rounded bg-white/8">{thumb.color_scheme}</span>
                      <span className="px-2 py-0.5 rounded bg-white/8">{thumb.aspect_ratio}</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {thumb.createdAt ? new Date(thumb.createdAt).toDateString() : ""}
                    </p>
                  </div>

                  {/* Hover actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 right-2 max-sm:flex sm:hidden group-hover:flex gap-1.5"
                  >
                    <button type="button" onClick={() => handleDelete(thumb._id)} aria-label="Delete">
                      <TrashIcon className="size-6 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all" />
                    </button>

                    {thumb.image_url && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDownload(thumb.image_url!, thumb.title)}
                          aria-label="Download"
                        >
                          <DownloadIcon className="size-6 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all" />
                        </button>

                        <Link
                          target="_blank"
                          aria-label="Preview"
                          to={`/preview?thumbnail_url=${encodeURIComponent(thumb.image_url)}&title=${encodeURIComponent(thumb.title)}`}
                        >
                          <ArrowUpRightIcon className="size-6 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGeneration;