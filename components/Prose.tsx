import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpeakButton from "./SpeakButton";

/**
 * Lesson prose: inline `code` spans render as Swedish pills with a
 * sound icon. Convention lives in content files: wrap Swedish in backticks.
 */
export default function Prose({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ children }) {
          const text = String(children ?? "");
          return (
            <span className="sv-pill">
              {text}
              <SpeakButton text={text} size="sm" />
            </span>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
