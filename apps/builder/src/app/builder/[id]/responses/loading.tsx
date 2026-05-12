export default function ResponsesLoading() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#080808" }}>
      <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(240,237,232,0.06)", background: "#0A0A0A" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          height: "56px", borderBottom: "1px solid rgba(240,237,232,0.06)",
          background: "#0A0A0A", display: "flex", alignItems: "center",
          padding: "0 20px", gap: "16px",
        }}>
          <Bone width={120} height={14} />
          <Bone width={160} height={14} />
          <Bone width={200} height={28} />
        </div>

        <div style={{ padding: "40px 48px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Bone width={200} height={20} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginTop: "8px" }}>
            <Bone width="100%" height={40} />
            {[...Array(6)].map((_, i) => <Bone key={i} width="100%" height={52} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bone({ width, height }: { width: number | string; height: number }) {
  return (
    <div style={{
      width, height,
      background: "rgba(240,237,232,0.05)",
      borderRadius: "4px",
      flexShrink: 0,
    }} />
  );
}
