"use client";

import Script from "next/script";
import { content } from "@/lib/content";

/**
 * The closing video of the "watch" section. Two providers, chosen by data:
 *  - "tiktok": official TikTok blockquote embed (embed.js hydrates it into the
 *    real player; works most reliably on a deployed domain — see README).
 *  - "video": a self-hosted <video> (mp4/webm) from `content.watch.video.src`,
 *    the replacement path so a tenant can drop in their own clip.
 */
export default function TikTokEmbed() {
  const v = content.watch.video;

  if (v.provider === "video" && v.src) {
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
