import katex from "katex";
import { Fragment } from "react";
import clsx from "clsx";

const cache = new Map<string, string>();

function tex(src: string, display: boolean) {
  const key = (display ? "D" : "I") + src;
  let html = cache.get(key);
  if (!html) {
    html = katex.renderToString(src, { displayMode: display, throwOnError: false, strict: false });
    cache.set(key, html);
  }
  return html;
}

function emphasis(text: string, k: string) {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**")) return <strong key={k + i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*")) return <em key={k + i}>{part.slice(1, -1)}</em>;
      return <Fragment key={k + i}>{part}</Fragment>;
    });
}

/** Renders a rich string: $inline$, $$display$$, **bold**, *italic*. */
export function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("$$")) {
          return <span key={i} className="block math-scroll" dangerouslySetInnerHTML={{ __html: tex(p.slice(2, -2), true) }} />;
        }
        if (p.startsWith("$")) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: tex(p.slice(1, -1), false) }} />;
        }
        return <Fragment key={i}>{emphasis(p, `e${i}-`)}</Fragment>;
      })}
    </span>
  );
}

export function RichP({ text, className }: { text: string; className?: string }) {
  return (
    <div className={clsx("leading-relaxed", className)}>
      <Rich text={text} />
    </div>
  );
}
