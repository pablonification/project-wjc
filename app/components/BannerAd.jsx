import { useEffect, useState } from "react";

export default function BannerAd({ page }) {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/banners?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setBanner(data.banner);
        setLoading(false);
      });
  }, [page]);

  if (loading || !banner) return null;
  if (!banner.imageUrl || !banner.targetUrl) return null;

  return (
    <div className="w-full flex justify-center py-4 bg-black">
      <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={banner.imageUrl}
          alt="Banner Ad"
          className="max-w-full h-auto rounded shadow-lg"
          style={{ maxHeight: 120 }}
        />
      </a>
    </div>
  );
}
