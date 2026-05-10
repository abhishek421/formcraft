export function NotFound() {
  return (
    <div style={{
      "min-height": "100vh",
      background: "#080808",
      color: "#F0EDE8",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      "font-family": "'DM Mono', monospace",
      "flex-direction": "column",
      gap: "16px",
    }}>
      <div style={{ "font-size": "48px", opacity: "0.2" }}>404</div>
      <div style={{ "font-size": "14px", opacity: "0.4" }}>Form not found.</div>
    </div>
  );
}
