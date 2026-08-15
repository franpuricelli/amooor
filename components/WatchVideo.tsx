"use client";

import Script from "next/script";
import { useContent } from "@/lib/tenant";

/**
 * The closing video of the "watch" section. Two providers, chosen by data:
 *  - "video" (the default): a self-hosted <video> (mp4/webm) from
 *    `content.watch.video.src` — the tenant's own uploaded clip. Renders nothing
 *    until a clip exists, so the section never shows an empty player.
 *  - "tiktok": kept for back-compat when a tenant pastes a TikTok link; the
 *    official blockquote embed (embed.js hydrates it into the real player).
 */
export default function WatchVideo() {
  const v = useContent().watch.video;

  if (v.provider === "video") {
    if (!v.src) return null;
    return (
      <video
        className="watch-video"
        src={v.src}
        poster={v.poster ?? undefined}
        controls
        playsInline
        style={{ width: "100%", borderRadius: "var(--r-lg)" }}
      />
    );
  }

  if (!v.videoId) return null;
  return (
    <>
      <blockquote
        className="tiktok-embed"
        cite={v.url}
        data-video-id={v.videoId}
        style={{ maxWidth: "605px", minWidth: "280px", margin: "0 auto" }}
      >
        <section>
          <a target="_blank" rel="noreferrer" href={v.url}>
            {v.caption}
          </a>
        </section>
      </blockquote>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </>
  );
}
