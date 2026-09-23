// Avatars are generated deterministically from a seed (default: username)
// via DiceBear's hosted API — no file upload storage required for the demo.
// Swap the `src` for a real uploaded-image URL once S3/Cloudinary is wired up.

export function Avatar({
  seed,
  size = 44,
  className = "",
  ring = false,
}: {
  seed: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const src = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=1D1D21&shapeColor=D9A441,F0B95A,C88A2A`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`rounded-full bg-ink-700 ${ring ? "ring-2 ring-gold-500/40" : ""} ${className}`}
    />
  );
}
