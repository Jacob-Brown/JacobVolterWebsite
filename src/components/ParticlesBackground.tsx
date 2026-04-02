import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

let particlesEnginePromise: Promise<void> | null = null;

function ensureParticlesEngine() {
  if (!particlesEnginePromise) {
    particlesEnginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }

  return particlesEnginePromise;
}

export default function ParticlesBackground({ interactive = false }: { interactive?: boolean }) {
  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [engineFailed, setEngineFailed] = useState(false);

  useEffect(() => {
    ensureParticlesEngine()
      .then(() => setReady(true))
      .catch((error) => {
        console.warn("[particles] Engine init failed, using fallback:", error);
        setEngineFailed(true);
      });
  }, []);

  useEffect(() => {
    const syncDisabled = () => {
      setDisabled(localStorage.getItem("disableParticles") === "true");
    };

    syncDisabled();
    window.addEventListener("storage", syncDisabled);
    window.addEventListener("jacobvolter-settings-updated", syncDisabled as EventListener);

    return () => {
      window.removeEventListener("storage", syncDisabled);
      window.removeEventListener("jacobvolter-settings-updated", syncDisabled as EventListener);
    };
  }, []);

  const primaryOptions = useMemo(
    () => ({
      background: {
        color: "transparent",
      },
      fullScreen: {
        enable: false,
      },
      fpsLimit: 600,
      detectRetina: true,
      interactivity: {
        detectsOn: "window" as const,
        events: {
          onHover: {
            enable: interactive,
            mode: "grab" as const,
          },
          onClick: {
            enable: interactive,
            mode: "push" as const,
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 180,
            links: {
              opacity: 0.22,
            },
          },
          push: {
            quantity: 3,
          },
        },
      },
      particles: {
        color: {
          value: ["#d7edff", "#9fcbff", "#6eaef4", "#88d2ff"],
        },
        links: {
          color: "#8fc6ff",
          distance: 135,
          enable: true,
          opacity: 0.22,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.33,
          direction: "none" as const,
          outModes: {
            default: "out" as const,
          },
          random: true,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            width: 900,
            height: 900,
          },
          value: 128,
        },
        opacity: {
          value: { min: 0.14, max: 0.34 },
        },
        shape: {
          type: "circle" as const,
        },
        size: {
          value: { min: 1, max: 3.5 },
        },
      },
    }),
    [interactive]
  );

  const secondaryOptions = useMemo(
    () => ({
      background: {
        color: "transparent",
      },
      fullScreen: {
        enable: false,
      },
      fpsLimit: 600,
      detectRetina: true,
      interactivity: {
        detectsOn: "window" as const,
        events: {
          onHover: {
            enable: interactive,
            mode: "bubble" as const,
          },
          onClick: {
            enable: false,
            mode: "push" as const,
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          bubble: {
            distance: 140,
            opacity: 0.55,
            size: 8,
            duration: 0.5,
          },
        },
      },
      particles: {
        color: {
          value: ["#7dd3fc", "#c4b5fd", "#93c5fd"],
        },
        links: {
          enable: false,
          color: "#000000",
          distance: 0,
          opacity: 0,
          width: 0,
        },
        move: {
          enable: true,
          speed: 0.18,
          direction: "none" as const,
          outModes: {
            default: "out" as const,
          },
          random: true,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            width: 900,
            height: 900,
          },
          value: 32,
        },
        opacity: {
          value: { min: 0.08, max: 0.22 },
        },
        shape: {
          type: "circle" as const,
        },
        size: {
          value: { min: 2, max: 7 },
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: {
            enable: true,
            speed: 3,
            sync: false,
          },
          direction: "random" as const,
        },
      },
    }),
    [interactive]
  );

  const fallbackDots = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => {
        const left = (index * 37) % 100;
        const top = (index * 53) % 100;
        const size = 1.4 + (index % 5) * 0.75;
        const delay = -(index % 11) * 0.7;
        const duration = 7 + (index % 9) * 1.2;

        return {
          left,
          top,
          size,
          delay,
          duration,
          opacity: 0.12 + (index % 6) * 0.04,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(95, 160, 255, 0.18), transparent 34%), radial-gradient(circle at 82% 22%, rgba(117, 210, 255, 0.14), transparent 30%), radial-gradient(circle at 50% 78%, rgba(61, 113, 184, 0.18), transparent 42%), linear-gradient(180deg, rgba(5, 12, 24, 0.78) 0%, rgba(7, 16, 30, 0.9) 100%)",
        }}
      />
      {!disabled && ready && !engineFailed ? (
        <>
          <Particles
            id="jacobvolter-particles"
            className="absolute inset-0"
            options={primaryOptions}
          />
          <Particles
            id="jacobvolter-particles-secondary"
            className="absolute inset-0"
            options={secondaryOptions}
          />
        </>
      ) : !disabled ? (
        <div className="absolute inset-0">
          {fallbackDots.map((dot, index) => (
            <span
              key={`fallback-dot-${index}`}
              style={{
                position: "absolute",
                left: `${dot.left}%`,
                top: `${dot.top}%`,
                width: dot.size,
                height: dot.size,
                borderRadius: "9999px",
                background: "linear-gradient(135deg, rgba(190,225,255,0.9), rgba(120,185,255,0.85))",
                boxShadow: "0 0 12px rgba(118, 188, 255, 0.45)",
                opacity: dot.opacity,
                animation: `jv-particle-float ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes jv-particle-float {
              0% { transform: translate3d(0, 0, 0); opacity: 0.08; }
              25% { transform: translate3d(12px, -8px, 0); opacity: 0.2; }
              50% { transform: translate3d(-10px, -18px, 0); opacity: 0.3; }
              75% { transform: translate3d(8px, -10px, 0); opacity: 0.18; }
              100% { transform: translate3d(0, 0, 0); opacity: 0.08; }
            }
          `}</style>
        </div>
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 26%)",
        }}
      />
    </div>
  );
}