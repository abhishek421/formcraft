export default function BuilderLoading() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#080808" }}>
      {/* Sidebar placeholder */}
      <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(240,237,232,0.06)", background: "#0A0A0A" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          height: "56px", borderBottom: "1px solid rgba(240,237,232,0.06)",
          background: "#0A0A0A", display: "flex", alignItems: "center",
          padding: "0 20px", gap: "16px",
        }}>
          <Bone width={160} height={14} />
          <Bone width={180} height={28} />
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            <Bone width={80} height={28} />
            <Bone width={80} height={28} />
            <Bone width={80} height={28} />
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }}>
          {/* Field list */}
          <div style={{ width: "260px", borderRight: "1px solid rgba(240,237,232,0.06)", background: "#0D0D0D", padding: "12px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[...Array(5)].map((_, i) => <Bone key={i} width="100%" height={44} />)}
          </div>
          {/* Canvas */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bone width={520} height={340} />
          </div>
          {/* Settings panel */}
          <div style={{ width: "300px", borderLeft: "1px solid rgba(240,237,232,0.06)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Bone width="60%" height={12} />
            <Bone width="100%" height={36} />
            <Bone width="80%" height={12} />
            <Bone width="100%" height={36} />
            <Bone width="70%" height={12} />
            <Bone width="100%" height={36} />
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
