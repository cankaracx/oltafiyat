import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0969da",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "-0.5px"
        }}
      >
        OF
      </div>
    ),
    { ...size }
  );
}
