"use client";

import Script from "next/script";
import { config } from "@/lib/config";

/**
 * Official TikTok blockquote embed. embed.js hydrates the blockquote into the
 * real player; it works most reliably on a deployed domain (see README).
 */
export default function TikTokEmbed() {
  const { url, videoId, caption } = config.tiktok;
  return (
    <>
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        style={{ maxWidth: "605px", minWidth: "280px", margin: "0 auto" }}
      >
        <section>
          <a target="_blank" rel="noreferrer" href={url}>
            {caption}
          </a>
        </section>
      </blockquote>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </>
  );
}
