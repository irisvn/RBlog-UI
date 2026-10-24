// RBlog's `html` is rendered and escaped by RustCMS (docs/api.md, "Rich text"), so plain
// string rewrites are safe here; no HTML parser is needed.

// data-embed and data-id are validated by RustCMS; match each provider's format strictly all the same.
const EMBED =
  /<figure data-embed="(?:(youtube)" data-id="([A-Za-z0-9_-]{11})|(vimeo)" data-id="([1-9][0-9]{0,14}))">[\s\S]*?<\/figure>/g;

function withPlayers(html: string): string {
  return html.replace(EMBED, (_, yt?: string, ytId?: string, vimeo?: string, vimeoId?: string) => {
    const provider = yt ?? vimeo!;
    const id = ytId ?? vimeoId!;
    const src =
      yt
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : `https://player.vimeo.com/video/${id}`;
    return `<figure class="embed"><iframe src="${src}" title="Video ${provider}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></figure>`;
  });
}

/** Wide tables scroll inside their own frame instead of the page. */
function withScrollingTables(html: string): string {
  return html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
}

/** Lazy-load body images; they already carry width and height. */
function withLazyImages(html: string): string {
  return html.replace(/<img /g, '<img loading="lazy" decoding="async" ');
}

export function renderBody(html: string): string {
  return withLazyImages(withScrollingTables(withPlayers(html)));
}
