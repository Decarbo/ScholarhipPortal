import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";

interface CalliflyBotProps {
  assistantId?: string;
  publicKey?: string;
  position?: "bottom-left" | "bottom-right";
  disabled?: boolean;
}

export const CalliflyBot: React.FC<CalliflyBotProps> = ({
  assistantId,
  publicKey,
  position = "bottom-right",
  disabled = false,
}) => {
  const resolvedAssistantId =
    assistantId ?? import.meta.env.VITE_CALLIFLY_ASSISTANT_ID ?? "";
  const resolvedPublicKey =
    publicKey ?? import.meta.env.VITE_CALLIFLY_PUBLIC_KEY ?? "";

  const scriptLoaded = useRef(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const credentialsMissing = !resolvedAssistantId || !resolvedPublicKey;

  /* ---------- Script Loading ---------- */
  useEffect(() => {
    if (disabled || credentialsMissing) return;
    if (scriptLoaded.current) return;

    const existing = document.querySelector(
      'script[data-callifly-widget="true"]',
    );
    if (existing) {
      scriptLoaded.current = true;
      setMounted(true);
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@system-callifly/widget/dist/callifly-widget.js";
    script.dataset.calliflyWidget = "true";
    script.onload = () => {
      scriptLoaded.current = true;
      setMounted(true);
    };
    script.onerror = () => {
      console.error("[CalliflyBot] Failed to load widget script");
    };
    document.head.appendChild(script);
  }, [disabled, credentialsMissing]);

  if (disabled || credentialsMissing) return null;

  const isLeft = position === "bottom-left";
  const positionClass = isLeft ? "left-6" : "right-8";

  return (
    <>
      {/* Dynamic Style Injection for Web Component internal text/header */}
      <style>{`
        callifly-widget::part(header),
        callifly-widget::part(title),
        callifly-widget::part(subtitle),
        callifly-widget::part(description),
        callifly-widget p,
        callifly-widget h1,
        callifly-widget h2,
        callifly-widget span {
          display: none !important;
        }
      `}</style>

      {/* ---------- TOGGLE BUTTON WITH 'X' ---------- */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`fixed bottom-4 ${positionClass} z-[9999] p-3.5 bg-[#0B75A4] hover:bg-[#09658E] text-white rounded-full shadow-lg shadow-[#0B75A4]/30 transition-transform active:scale-95 hover:scale-105 flex items-center justify-center cursor-pointer`}
        aria-label={open ? "Close Callifly Bot" : "Open Callifly Bot"}
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* ---------- DIRECT WIDGET CONTAINER ---------- */}
      {mounted && (
        <div
          className={`fixed -bottom-1.5 ${positionClass} z-[9998] transition-all duration-300 ${
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <callifly-widget
            assistant-id={resolvedAssistantId}
            public-key={resolvedPublicKey}
          />
        </div>
      )}
    </>
  );
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "callifly-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "assistant-id"?: string;
          "public-key"?: string;
        },
        HTMLElement
      >;
    }
  }
}

export default CalliflyBot;
