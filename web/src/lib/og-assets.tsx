import { mainCategories } from "@/lib/categories";

// Social-card images are rendered server-side via Satori, which has no local
// glyph for "₺" and has to fetch a covering Google Font at render time — an
// extra network dependency that can fail or stall. Formatting as plain
// "<amount> TL" keeps every glyph inside the default bundled font and avoids
// that round trip entirely (unlike formatTRY, which is used elsewhere in the
// UI and does use the ₺ symbol).
function formatPriceForOg(value: number): string {
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  return `${formatted} TL`;
}

export const OG_SIZE = { width: 1200, height: 630 } as const;

const DARK_BG = "#161b22";
const DARK_BORDER = "#30363d";
const MUTED = "#8b949e";
const BLUE = "#58a6ff";
const BLUE_BG = "rgba(88, 166, 255, 0.12)";
const BLUE_BORDER = "rgba(88, 166, 255, 0.35)";
const GREEN = "#3fb950";
const GREEN_BG = "rgba(63, 185, 80, 0.15)";
const WHITE = "#f0f6fc";

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function BrandRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#0969da",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 800,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14
          }}
        >
          OF
        </div>
        <div style={{ display: "flex", color: WHITE, fontSize: 24, fontWeight: 700 }}>OltaFiyat</div>
      </div>
      <div style={{ display: "flex", color: BLUE, fontSize: 18, fontWeight: 600 }}>oltafiyat.com</div>
    </div>
  );
}

function Divider() {
  return <div style={{ display: "flex", width: "100%", height: 1, background: DARK_BORDER }} />;
}

type RankRow = { label: string; price: string; highlighted: boolean };

function RankTable({ title, rows }: { title: string; rows: RankRow[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 360,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${DARK_BORDER}`,
        borderRadius: 12,
        padding: 18
      }}
    >
      <div
        style={{
          display: "flex",
          color: MUTED,
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          whiteSpace: "nowrap",
          marginBottom: 12
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: i === 0 ? "none" : `1px solid ${DARK_BORDER}`
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: row.highlighted ? GREEN : "rgba(255,255,255,0.08)",
                  color: row.highlighted ? "#0d1117" : MUTED,
                  fontSize: 11,
                  fontWeight: 800,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: "flex", color: row.highlighted ? WHITE : MUTED, fontSize: 15, fontWeight: 600 }}>
                {row.label}
              </div>
            </div>
            <div style={{ display: "flex", color: row.highlighted ? GREEN : MUTED, fontSize: 16, fontWeight: 700 }}>
              {row.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_ROWS: RankRow[] = [
  { label: "Mağaza A", price: "1.249 TL", highlighted: true },
  { label: "Mağaza B", price: "1.390 TL", highlighted: false },
  { label: "Mağaza C", price: "1.520 TL", highlighted: false }
];

export function DefaultOgContent() {
  const pillCategories = mainCategories.slice(0, 5).map((c) => c.name);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: DARK_BG,
        padding: 56,
        fontFamily: '"Inter", "Noto Sans", sans-serif'
      }}
    >
      <BrandRow />
      <div style={{ display: "flex", marginTop: 24, marginBottom: 24 }}>
        <Divider />
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 620 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: WHITE,
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1,
              marginBottom: 20
            }}
          >
            <span>Balıkçılık fiyatlarını</span>
            <span>tek yerde karşılaştır.</span>
          </div>
          <div style={{ display: "flex", color: MUTED, fontSize: 20, lineHeight: 1.5, marginBottom: 28 }}>
            Kamış, makine, sahte yem ve misina fiyatlarını Türkiye&apos;nin balıkçılık mağazalarından topluyoruz.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {pillCategories.map((name) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  background: BLUE_BG,
                  border: `1px solid ${BLUE_BORDER}`,
                  color: BLUE,
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  borderRadius: 999,
                  padding: "6px 16px",
                  marginRight: 10,
                  marginBottom: 10
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <RankTable title="Örnek Karşılaştırma" rows={SAMPLE_ROWS} />
      </div>
    </div>
  );
}

export type ProductOgListing = { storeName: string; price: number };

export function ProductOgContent({
  title,
  brand,
  listings,
  totalStoreCount
}: {
  title: string;
  brand: string | null;
  listings: ProductOgListing[];
  totalStoreCount: number;
}) {
  const rows: RankRow[] = listings.slice(0, 3).map((l, i) => ({
    label: truncate(l.storeName, 16),
    price: formatPriceForOg(l.price),
    highlighted: i === 0
  }));
  const lowest = listings[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: DARK_BG,
        padding: 56,
        fontFamily: '"Inter", "Noto Sans", sans-serif'
      }}
    >
      <BrandRow />
      <div style={{ display: "flex", marginTop: 24, marginBottom: 32 }}>
        <Divider />
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 620 }}>
          {brand && (
            <div
              style={{
                display: "flex",
                color: MUTED,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                whiteSpace: "nowrap",
                marginBottom: 14
              }}
            >
              {brand}
            </div>
          )}
          <div
            style={{
              display: "flex",
              color: WHITE,
              fontSize: 38,
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: -0.5,
              marginBottom: 28
            }}
          >
            {truncate(title, 72)}
          </div>

          {lowest ? (
            <>
              <div style={{ display: "flex", color: MUTED, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap", marginBottom: 6 }}>
                En düşük fiyat
              </div>
              <div style={{ display: "flex", color: GREEN, fontSize: 68, fontWeight: 800, letterSpacing: -1.5, marginBottom: 18 }}>
                {formatPriceForOg(lowest.price)}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", color: MUTED, fontSize: 16, marginRight: 12 }}>{lowest.storeName}</div>
                {totalStoreCount > 1 && (
                  <div
                    style={{
                      display: "flex",
                      background: GREEN_BG,
                      border: "1px solid rgba(63,185,80,0.35)",
                      color: GREEN,
                      fontSize: 14,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      borderRadius: 999,
                      padding: "4px 14px"
                    }}
                  >
                    {totalStoreCount} mağazada karşılaştırıldı
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", color: MUTED, fontSize: 20 }}>Mağaza fiyatı toplanıyor.</div>
          )}
        </div>

        {rows.length > 0 && <RankTable title="Mağaza Karşılaştırması" rows={rows} />}
      </div>
    </div>
  );
}
