interface EmailContentProps {
  html: string | null;
  text: string;
  subject: string;
}

/** Untrusted email HTML never shares the CRM document or its origin. */
export function EmailContent({ html, text, subject }: EmailContentProps) {
  if (!html) {
    return <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink">{text || "(No message content)"}</p>;
  }

  return (
    <iframe
      title={`Email: ${subject || "Message"}`}
      className="h-80 w-full min-w-0 rounded bg-white"
      sandbox=""
      referrerPolicy="no-referrer"
      srcDoc={`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><style>body{font:14px/1.6 system-ui,sans-serif;overflow-wrap:anywhere;margin:8px}img{max-width:100%}table{max-width:100%}</style></head><body>${html}</body></html>`}
    />
  );
}
