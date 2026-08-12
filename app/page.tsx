"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
function GalleryCard({
  src,
  alt,
  chapter,
  caption,
  wide = false,
}: {
  src: string;
  alt: string;
  chapter: string;
  caption: string;
  wide?: boolean;
}) {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div
      className={`gallery-card ${wide ? "wide" : "tall"}`}
      style={
        ratio
          ? {
              aspectRatio: `${ratio}`,
              height: "auto",
            }
          : undefined
      }
    >
      <img
        src={src}
        alt={alt}
        onLoad={(e) => {
          const img = e.currentTarget;

          if (img.naturalWidth && img.naturalHeight) {
            setRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
      />

      <div className="gallery-caption">
        <span>{chapter}</span>
        <strong>{caption}</strong>
      </div>
    </div>
  );
}
export default function Home() {
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isScratched, setIsScratched] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [attendingStatus, setAttendingStatus] = useState(
    "Yes, I'll be there!"
  );
  const [guestCount, setGuestCount] = useState("1");

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const [origin, setOrigin] = useState({
    x: 0,
    y: 0,
  });

  /* =====================================================
     LOCK BODY SCROLL WHILE ENVELOPE IS OPEN
  ===================================================== */

  useEffect(() => {
    document.body.style.overflow = opened ? "auto" : "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [opened]);

  /* =====================================================
     LIVE WEDDING COUNTDOWN
  ===================================================== */

  useEffect(() => {
    const targetDate = new Date("2026-09-05T21:37:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) /
          (1000 * 60)
      );

      const seconds = Math.floor(
        (difference % (1000 * 60)) / 1000
      );

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     OPEN ENVELOPE
  ===================================================== */

  const handleOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (isOpening) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    setOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    setIsOpening(true);

    setTimeout(() => {
      setOpened(true);
    }, 1500);
  };

  /* =====================================================
     SCRATCH CARD
  ===================================================== */

  useEffect(() => {
    if (!opened) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 320;
    const height = 150;

    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(
      0,
      0,
      width,
      height
    );

    gradient.addColorStop(0, "#d4af37");
    gradient.addColorStop(0.3, "#f3e5ab");
    gradient.addColorStop(0.6, "#aa7c11");
    gradient.addColorStop(1, "#e6ca65");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#3d2b00";
    ctx.font = "600 13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // ctx.fillText(
    //   "✦ SCRATCH TO REVEAL ✦",
    //   width / 2,
    //   height / 2
    // );

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const checkScratchPercentage = () => {
      if (isScratched) return;

      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
      );

      const pixels = imageData.data;

      let transparentPixels = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
          transparentPixels++;
        }
      }

      const percentage =
        (transparentPixels / (pixels.length / 4)) * 100;

      if (percentage > 45) {
        setIsScratched(true);
      }
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;

      e.preventDefault();

      const { x, y } = getPos(e);

      ctx.globalCompositeOperation = "destination-out";

      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      checkScratchPercentage();
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      scratch(e);
    };

    const stopDrawing = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", scratch);

    window.addEventListener("mouseup", stopDrawing);

    canvas.addEventListener(
      "touchstart",
      startDrawing,
      { passive: false }
    );

    canvas.addEventListener(
      "touchmove",
      scratch,
      { passive: false }
    );

    window.addEventListener("touchend", stopDrawing);

    return () => {
      canvas.removeEventListener(
        "mousedown",
        startDrawing
      );

      canvas.removeEventListener(
        "mousemove",
        scratch
      );

      window.removeEventListener(
        "mouseup",
        stopDrawing
      );

      canvas.removeEventListener(
        "touchstart",
        startDrawing
      );

      canvas.removeEventListener(
        "touchmove",
        scratch
      );

      window.removeEventListener(
        "touchend",
        stopDrawing
      );
    };
  }, [opened, isScratched]);

  /* =====================================================
     WHATSAPP RSVP
  ===================================================== */

  const handleWhatsAppRSVP = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const phone = "918688172348";

    const text = encodeURIComponent(
      `Hi Sai & Prasanthi! 👋

I am RSVPing for your wedding.

Name: ${guestName || "Guest"}
Attending: ${attendingStatus}
Number of Guests: ${guestCount}

Looking forward to celebrating this beautiful day with you! ❤️`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank"
    );
  };

  /* =====================================================
     FLOATING HEARTS
  ===================================================== */

  const hearts = [
    { left: "7%", delay: "0s", duration: "13s", size: "14px" },
    { left: "18%", delay: "4s", duration: "16s", size: "11px" },
    { left: "31%", delay: "8s", duration: "14s", size: "16px" },
    { left: "47%", delay: "2s", duration: "17s", size: "10px" },
    { left: "63%", delay: "6s", duration: "15s", size: "15px" },
    { left: "77%", delay: "10s", duration: "18s", size: "12px" },
    { left: "90%", delay: "3s", duration: "14s", size: "16px" },
  ];

  return (
    <main className="main-page">

      {/* =====================================================
          FLOATING HEARTS
      ===================================================== */}

      {/* Floating love hearts */}
{opened && (
  <div className="floating-hearts" aria-hidden="true">
    <span className="floating-heart heart-1">♥</span>
    <span className="floating-heart heart-2">♥</span>
    <span className="floating-heart heart-3">♥</span>
    <span className="floating-heart heart-4">♥</span>
    <span className="floating-heart heart-5">♥</span>
    <span className="floating-heart heart-6">♥</span>
    <span className="floating-heart heart-7">♥</span>
    <span className="floating-heart heart-8">♥</span>
    <span className="floating-heart heart-9">♥</span>
    <span className="floating-heart heart-10">♥</span>
  </div>
)}

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.section
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 0.9 }}
      >
        <motion.div
          className="hero-content"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={
            opened
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 30,
                }
          }
          transition={{
            duration: 1,
            delay: 0.3,
          }}
        >
          <div className="hero-kicker">
            With the blessings of our families
          </div>

          <h1>
            Sai
            <br />
            <span>&amp;</span>
            <br />
            Prasanthi
          </h1>

          <div className="hero-subtitle">
            Two hearts, one beautiful beginning.
          </div>

          <div className="hero-kicker hero-invite">
            Come be part of the moment our story takes its most beautiful turn
          </div>

          <div className="hero-scroll">
            {/* <span>Our story awaits</span> */}
            <div className="scroll-arrow">↓</div>
          </div>
        </motion.div>
      </motion.section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {opened && (
        <div className="white-section-container">

          {/* =================================================
              OUR STORY
          ================================================= */}

          <section className="invitation-story">

            <p className="story-kicker">
              A Beautiful Beginning
            </p>

            <h2>
              The wait is almost over.
            </h2>

            <p className="story-text">
              Some of the most beautiful chapters in life are
              written slowly — through countless conversations,
              shared dreams, laughter, lessons, and moments that
              quietly become memories we never want to forget.
            </p>

            <p className="story-text">
              After years of walking through this journey
              together, learning, growing and choosing each other
              a little more every day, we have finally arrived at
              the moment we have been waiting for.
            </p>

            <p className="story-text">
              And now, with hearts overflowing with happiness,
              we cannot wait to celebrate it with the people who
              make our lives complete.
            </p>

            <p className="story-text emphasis">
              Come with your brightest smiles, your warmest
              wishes, and your hearts full of love.
              <br />
              <br />
              Be a part of our most beautiful moment.
            </p>

            <div className="ornamental-divider">
              ✦ &nbsp; ♥ &nbsp; ✦
            </div>

          </section>

          {/* =================================================
              PHOTO GALLERY
          ================================================= */}

          <section className="gallery-section">

            <div className="section-heading">
              <p className="section-kicker">
                Moments We Carry
              </p>

              <h2>
                A little piece of our journey
              </h2>

              <p>
                Before we step into our happiest chapter, here are a few
                moments from the journey that brought us here.
              </p>
            </div>

            <div className="gallery-frame">

              <div className="gallery-track">

  <GalleryCard
    src="/images/couple-01.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter One"
    caption="Where it all began"
  />

  {/* <GalleryCard
    src="/images/couple-02.1.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Two"
    caption="Bengaluru Bike Rides"
    wide
  /> */}

  <GalleryCard
    src="/images/couple-02.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Two"
    caption="Goa Vibes"
    wide
  />

  <GalleryCard
    src="/images/couple-03.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Three"
    caption="Just one more mall date..."
    wide
  />

  <GalleryCard
    src="/images/couple-04.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Four"
    caption="Royal rides, auto edition"
    wide
  />

  <GalleryCard
    src="/images/couple-05.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Five"
    caption="Dinner dates"
  />

  <GalleryCard
    src="/images/couple-06.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Six"
    caption="Temple visits"
  />

  <GalleryCard
    src="/images/couple-07.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Seven"
    caption="Birthday surprises"
  />
  <GalleryCard
    src="/images/couple-08.jpeg"
    alt="Sai and Prasanthi"
    chapter="Chapter Eight"
    caption="rainy day rides"
  />

  <GalleryCard
    src="/images/couple-10.png"
    alt="Sai and Prasanthi"
    chapter="chapters continue..."
    caption="The Beginning"
    wide
  />

</div>

            </div>

            <div className="gallery-hint">
              <span>←</span>
              Swipe through our moments
              <span>→</span>
            </div>

          </section>

          {/* =================================================
              SCRATCH DATE
          ================================================= */}

          <section className="scratch-date-section">

            <div className="scratch-card-wrapper">

              <div className="scratch-card-header">

                <p className="section-kicker">
                  A Date To Remember
                </p>

                <h2>
                  A little secret awaits...
                </h2>

                <p>
                  Scratch away the golden veil and discover
                  the day our forever begins.
                </p>

              </div>

              <div
  className="scratch-area"
  style={{
    backgroundImage: "url('/images/couple-09.jpeg')",
  }}
>
  <div
    className={`revealed-date ${
      isScratched ? "active" : ""
    }`}
  >
    <span className="date-day">
      SEPTEMBER
    </span>

    <span className="date-number">
      05
    </span>

    <span className="date-year">
      2026
    </span>

    <span className="date-time">
      SUMUHURTHAM • 9:37 PM
    </span>
  </div>

  <canvas
    ref={canvasRef}
    className={`scratch-canvas ${
      isScratched ? "faded" : ""
    }`}
  />
</div>

              {isScratched && (
                <motion.div
                  className="scratched-badge"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  ✦ The day we have been waiting for ✦
                </motion.div>
              )}

            </div>

          </section>

          {/* =================================================
              COUNTDOWN
          ================================================= */}

          <section className="countdown-section">

            <div className="section-heading">

              <p className="section-kicker">
                The Moment Draws Near
              </p>

              <h2>
                Every second brings us closer.
              </h2>

              <p>
                We have waited for this day for so long.
                Now, every passing moment makes it feel
                a little more real.
              </p>

            </div>

            <div className="countdown-grid">

              <div className="countdown-box">
                <span className="num">
                  {timeLeft.days}
                </span>
                <span className="label">
                  Days
                </span>
              </div>

              <div className="countdown-box">
                <span className="num">
                  {timeLeft.hours}
                </span>
                <span className="label">
                  Hours
                </span>
              </div>

              <div className="countdown-box">
                <span className="num">
                  {timeLeft.minutes}
                </span>
                <span className="label">
                  Minutes
                </span>
              </div>

              <div className="countdown-box">
                <span className="num">
                  {timeLeft.seconds}
                </span>
                <span className="label">
                  Seconds
                </span>
              </div>

            </div>

            <div className="countdown-footer">
              Until two hearts become one family.
            </div>

          </section>

          {/* =================================================
              EVENTS
          ================================================= */}

          <section className="events-section">

            <div className="section-heading">

              <p className="section-kicker">
                The Celebrations
              </p>

              <h2>
                Before forever begins...
              </h2>

              <p>
                There are a few beautiful moments along the
                way — celebrations filled with family,
                laughter, music, traditions and memories
                waiting to be made.
              </p>

            </div>

            <div className="events-timeline">

              {/* EVENT 1 */}

              <div className="event-item">

                <div className="event-date">
                  <span>02</span>
                  <small>SEP</small>
                </div>

                <div className="event-line">
                  <div className="event-dot">
                    ♥
                  </div>
                </div>

                <div className="event-content">

                  <span className="event-number">
                    01
                  </span>

                  <h3>
                    Pellikoduku &amp; Pellikuthuru
                  </h3>

                  <p className="event-time">
                    September 2, 2026
                  </p>

                  <p>
                    An auspicious beginning to our wedding
                    celebrations, surrounded by the love,
                    blessings and warmth of our families.
                  </p>

                </div>

              </div>

              {/* EVENT 2 */}

              <div className="event-item">

                <div className="event-date">
                  <span>03</span>
                  <small>SEP</small>
                </div>

                <div className="event-line">
                  <div className="event-dot">
                    ♥
                  </div>
                </div>

                <div className="event-content">

                  <span className="event-number">
                    02
                  </span>

                  <h3>
                    Haldi
                  </h3>

                  <p className="event-time">
                    September 3 · 10:00 AM
                  </p>

                  <p>
                    Golden hues, joyful hearts and the
                    beautiful chaos of loved ones coming
                    together before the big day.
                  </p>

                </div>

              </div>

              {/* EVENT 3 */}

              <div className="event-item">

                <div className="event-date">
                  <span>03</span>
                  <small>SEP</small>
                </div>

                <div className="event-line">
                  <div className="event-dot">
                    ♥
                  </div>
                </div>

                <div className="event-content">

                  <span className="event-number">
                    03
                  </span>

                  <h3>
                    Sangeeth
                  </h3>

                  <p className="event-time">
                    September 3 · 6:00 PM onwards
                  </p>

                  <p>
                    An evening of music, laughter, dancing
                    and the kind of memories that deserve
                    to be replayed forever.
                  </p>

                </div>

              </div>

              {/* EVENT 4 */}

              <div className="event-item">

                <div className="event-date">
                  <span>05</span>
                  <small>SEP</small>
                </div>

                <div className="event-line">
                  <div className="event-dot">
                    ♥
                  </div>
                </div>

                <div className="event-content">

                  <span className="event-number">
                    04
                  </span>

                  <h3>
                    Wedding Dinner
                  </h3>

                  <p className="event-time">
                    September 5 · 7:00 PM
                  </p>

                  <p>
                    Come gather around, share a meal,
                    laughter and the happiness of the
                    evening before the most sacred moment.
                  </p>

                </div>

              </div>

              {/* EVENT 5 */}

              <div className="event-item wedding-event">

                <div className="event-date">
                  <span>05</span>
                  <small>SEP</small>
                </div>

                <div className="event-line">
                  <div className="event-dot">
                    ✦
                  </div>
                </div>

                <div className="event-content">

                  <span className="event-number">
                    05
                  </span>

                  <h3>
                    Sumuhurtham
                  </h3>

                  <p className="event-time">
                    September 5 · 9:37 PM
                  </p>

                  <p>
                    The moment we have been waiting for —
                    when, with the blessings of our families
                    and loved ones, our two journeys become
                    one.
                  </p>

                  <div className="wedding-highlight">
                    <span>
                      THE BEGINNING OF FOREVER
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              VENUE
          ================================================= */}

          <section className="venue-section">

            <div className="section-heading">

              <p className="section-kicker">
                Where We Begin
              </p>

              <h2>
                Come find us.
              </h2>

              <p>
                Where our families gather, where the
                celebrations begin, and where we take
                our first steps into forever.
              </p>

            </div>

            <div className="venue-card">

              <div className="venue-ornament">
                ✦
              </div>

              <p className="venue-label">
                THE WEDDING VENUE
              </p>

              <h3>
                Port Kalanjali
                <br />
                Banquet Hall
              </h3>

              <p className="venue-location">
                Visakhapatnam · Andhra Pradesh
              </p>

              {/* GOOGLE MAP EMBED */}

              <div className="map-frame">

                <iframe
                  src="https://www.google.com/maps?q=Port%20Kalanjali%20Banquet%20Hall%2C%20Visakhapatnam&output=embed"
                  width="100%"
                  height="300"
                  style={{
                    border: 0,
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Port Kalanjali Banquet Hall"
                />

                <div className="map-overlay">
                  <span>♥</span>
                </div>

              </div>

              <a
                href="https://share.google/MlcJDuaAcUxMNezpg"
                target="_blank"
                rel="noopener noreferrer"
                className="maps-button"
              >
                FIND YOUR WAY TO US
                <span>↗</span>
              </a>

            </div>

          </section>

          {/* =================================================
              RSVP
          ================================================= */}

          <section className="rsvp-section">

            <div className="rsvp-card">

              <div className="rsvp-ornament">
                ♥
              </div>

              <p className="section-kicker">
                Your Presence Is Our Greatest Gift
              </p>

              <h2>
                Will you celebrate with us?
              </h2>

              <p className="rsvp-intro">
                The happiness of this celebration would
                be incomplete without the people we love.
              </p>

              <p className="rsvp-intro">
                Come with your warmest wishes,
                your brightest smiles, and your hearts
                full of happiness.
              </p>

              <form
                onSubmit={handleWhatsAppRSVP}
                className="rsvp-form"
              >

                <div className="form-group">
                  <label>
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="How shall we welcome you?"
                    value={guestName}
                    onChange={(e) =>
                      setGuestName(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Will You Join Us?
                  </label>

                  <select
                    value={attendingStatus}
                    onChange={(e) =>
                      setAttendingStatus(e.target.value)
                    }
                  >
                    <option value="Yes, I'll be there!">
                      Yes, I'll be there! ♥
                    </option>

                    <option value="Sorry, I cannot make it">
                      With love, I cannot make it
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Number of Guests
                  </label>

                  <select
                    value={guestCount}
                    onChange={(e) =>
                      setGuestCount(e.target.value)
                    }
                  >
                    <option value="1">
                      Just me
                    </option>

                    <option value="2">
                      Two of us
                    </option>

                    <option value="3+">
                      Our family
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="whatsapp-rsvp-btn"
                >
                  SEND YOUR RSVP
                  <span>♥</span>
                </button>

              </form>

            </div>

          </section>

          {/* =================================================
              FINAL MESSAGE
          ================================================= */}

          {/* <footer className="invitation-footer">

            <div className="footer-ornament">
              ✦
            </div>

            <p className="footer-kicker">
              And so, our story continues...
            </p>

            <p className="footer-text">
              With the blessings of those who came before us,
              the love of those who walk beside us,
              and the promise of all that lies ahead.
            </p>

            <h3>
              Sai
              <span>&amp;</span>
              Prasanthi
            </h3>

            <p className="footer-final">
              We cannot wait to celebrate this beautiful
              beginning with you.
            </p>

            <div className="footer-hearts">
              ♥ &nbsp; ♥ &nbsp; ♥
            </div>

          </footer> */}

        </div>
      )}

      {/* =====================================================
          ENVELOPE SCREEN
      ===================================================== */}

      <AnimatePresence>

        {!opened && (
          <motion.section
            className="envelope-screen"
            initial={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.15,
            }}
          >

            <div className="blurred-envelope-background">
              <img
                src="/images/envelop.webp"
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className="background-overlay" />

            <motion.div
              className="envelope-area"
              animate={
                isOpening
                  ? {
                      opacity: 0,
                      scale: 0.9,
                      y: -10,
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }
              }
              transition={{
                duration: 0.4,
                ease: "easeInOut",
                delay: 0.1,
              }}
            >

              <div className="envelope-wrapper">

                <img
                  src="/images/envelop.webp"
                  alt="Wedding invitation envelope"
                  className="envelope-image"
                />

                <button
                  className="wax-seal"
                  onClick={handleOpen}
                  disabled={isOpening}
                  aria-label="Open wedding invitation"
                >
                  {!isOpening && (
                    <>
                      <span className="seal-ring ring-one" />
                      <span className="seal-ring ring-two" />
                      <span className="seal-ring ring-three" />
                    </>
                  )}
                </button>

              </div>

              <motion.div
                className="envelope-instruction"
                animate={
                  isOpening
                    ? {
                        opacity: 0,
                        y: 10,
                      }
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
              >
                Tap the seal to begin
              </motion.div>

            </motion.div>

            {/* GOLD TRANSITION */}

            <AnimatePresence>

              {isOpening && (
                <motion.div
                  className="gold-transition"
                  style={{
                    left: origin.x,
                    top: origin.y,
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0.95,
                  }}
                  animate={{
                    scale: 1,
                    opacity: [
                      0.95,
                      1,
                      1,
                      0.5,
                      0,
                    ],
                  }}
                  transition={{
                    duration: 1.6,
                    times: [
                      0,
                      0.25,
                      0.55,
                      0.8,
                      1,
                    ],
                    ease: "easeInOut",
                  }}
                />
              )}

            </AnimatePresence>

            {/* SEAL FLASH */}

            <AnimatePresence>

              {isOpening && (
                <motion.div
                  className="seal-flash"
                  style={{
                    left: origin.x,
                    top: origin.y,
                  }}
                  initial={{
                    scale: 0.15,
                    opacity: 0,
                  }}
                  animate={{
                    scale: [
                      0.15,
                      0.8,
                      1.4,
                    ],
                    opacity: [
                      0,
                      1,
                      0,
                    ],
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                />
              )}

            </AnimatePresence>

          </motion.section>
        )}

      </AnimatePresence>

    </main>
  );
}