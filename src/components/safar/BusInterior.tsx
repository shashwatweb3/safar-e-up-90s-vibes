import { useEffect, useState } from "react";
import interior from "@/assets/bus-interior.jpg";
import interiorMobile from "@/assets/bus-interior-mobile.jpg";
import { BusWindow, type Scenery } from "./BusWindow";
import { Conductor } from "./Conductor";
import { BusTicket } from "./BusTicket";
import { PassengerCounter } from "./PassengerCounter";
import { destinations } from "@/lib/playlists";
import { CoverStage } from "./CoverStage";

const sceneryLabels: Record<Scenery, string> = {
  fields: "उन्नाव के खेत",
  town: "कानपुर रोड बाज़ार",
};

export function BusInterior({
  onReturnToStop,
  onOpenPlaylist,
  entering,
}: {
  onReturnToStop: () => void;
  onOpenPlaylist: () => void;
  entering: boolean;
}) {
  const [scenery, setScenery] = useState<Scenery>("fields");
  const [conductorOpen, setConductorOpen] = useState(false);
  const [ticket, setTicket] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const measure = () => setMobile(window.innerWidth < 640);
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const id = window.setTimeout(() => setConductorOpen(true), 2600);
    return () => window.clearTimeout(id);
  }, []);

  const dest = ticket !== null ? destinations[ticket]! : null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <CoverStage
        key={mobile ? "m" : "d"}
        layout={mobile ? "width-fit" : "center"}
        mobileAlign="center"
        {...(mobile ? { aspect: 1024 / 1792 } : {})}
        transform={(mobile) => `scale(${entering ? 1.28 : mobile ? 1 : 1.02})`}
        className="transition-transform duration-[1200ms] ease-out"
      >
        <div
          role="img"
          aria-label="Illustrated interior of an old Uttar Pradesh public bus with worn seats, hanging handles and a conductor"
          className="animate-rumble absolute inset-0"
          style={{
            backgroundImage: `url(${mobile ? interiorMobile : interior})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />

        <BusWindow
          scenery={scenery}
          label={sceneryLabels[scenery]}
          {...(mobile
            ? {
                className:
                  "group absolute left-0 top-[6%] h-[48%] w-[27%] cursor-pointer overflow-hidden",
                clipPath: "polygon(0% 4%, 100% 0%, 100% 92%, 0% 100%)",
              }
            : {})}
          onClick={() => {
            setScenery((s) => (s === "fields" ? "town" : "fields"));
            setToast(scenery === "fields" ? "कानपुर रोड आ गया।" : "अब खेत ही खेत।");
          }}
        />

        <Conductor
          open={conductorOpen}
          {...(mobile ? { hotspotClassName: "right-0 top-[19%] h-[62%] w-[26%]" } : {})}
          onToggle={() => setConductorOpen((o) => !o)}
          onSelect={(i) => {
            setTicket(i);
            setConductorOpen(false);
          }}
        />

        {dest && <BusTicket to={dest} fare={dest.fare} onClose={() => setTicket(null)} />}

        {/* seat hotspot */}
        <button
          type="button"
          aria-label="सीट"
          onClick={() => setToast("यही वाली सीट ठीक है।")}
          className={`absolute cursor-pointer transition-colors duration-300 hover:bg-[color-mix(in_oklab,var(--mustard)_12%,transparent)] ${
            mobile ? "bottom-[22%] left-[14%] h-[18%] w-[56%]" : "bottom-[18%] left-[26%] h-[26%] w-[34%]"
          }`}
        />
      </CoverStage>

      {/* sun shafts */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, color-mix(in oklab, var(--mustard) 26%, transparent) 0%, transparent 42%), radial-gradient(70% 60% at 12% 25%, color-mix(in oklab, var(--cream) 28%, transparent), transparent 70%)",
        }}
      />

      <button
        type="button"
        onClick={onReturnToStop}
        className="signboard paint-edge absolute left-4 top-4 z-40 rotate-[-1.2deg] px-3 py-2.5 font-hindi text-sm font-bold active:translate-y-[2px] sm:px-4 sm:py-2 sm:text-base"
      >
        ⟵ बस स्टॉप
      </button>

      <button
        type="button"
        onClick={onOpenPlaylist}
        className="signboard paint-edge absolute right-4 top-4 z-40 rotate-[1deg] px-3 py-2.5 font-hindi text-sm font-bold active:translate-y-[2px] sm:px-4 sm:py-2 sm:text-base"
      >
        📻 रेडियो
      </button>

      <PassengerCounter />

      <div
        className="pointer-events-none absolute inset-x-0 top-[42%] z-40 flex justify-center transition-all duration-300"
        style={{ opacity: toast ? 1 : 0, transform: toast ? "translateY(0)" : "translateY(8px)" }}
      >
        <span className="panel-paper -rotate-1 px-4 py-2 font-hindi text-base">{toast}</span>
      </div>
    </div>
  );
}
