"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { navigation, socialLinks } from "../data/site";
import styles from "./Header.module.css";

type Panel = "menu" | "contact" | null;

function SocialLinks() {
  if (!Object.values(socialLinks).some(Boolean)) return null;
  return <div className={styles.socials}>
    {socialLinks.instagram && <>
    <a href={socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
      <svg width="27" height="26" viewBox="0 0 27 26" fill="none" aria-hidden="true"><rect x="2" y="2" width="22" height="22" rx="6" stroke="currentColor" strokeWidth="2.3"/><circle cx="13" cy="13" r="5" stroke="currentColor" strokeWidth="2.3"/><circle cx="20" cy="6.5" r="1.5" fill="currentColor"/></svg>
    </a>
    </>}
    {socialLinks.x && <>
    <a href={socialLinks.x} aria-label="X" target="_blank" rel="noreferrer">
      <svg width="26" height="25" viewBox="0 0 26 25" fill="none" aria-hidden="true"><path d="M2 1.5h5.5L24 23.5h-5.5L2 1.5Z" stroke="currentColor" strokeWidth="1.5"/><path d="m23 1.5-21 22" stroke="currentColor" strokeWidth="1.5"/></svg>
    </a>
    </>}
    {socialLinks.linkedin && <>
    <a href={socialLinks.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer">
      <svg width="24" height="25" viewBox="0 0 24 25" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="3"/><path d="M.5 8H5v16H.5zM9 8h4.5v2.2C15 7 23.5 6 23.5 14v10H19V14c0-4-5.5-4-5.5 0v10H9z"/></svg>
    </a>
    </>}
  </div>;
}

function Hamburger({ open }: { open: boolean }) {
  return <span className={`${styles.hamburger} ${open ? styles.cross : ""}`} aria-hidden="true"><span/><span/><span/></span>;
}

function ContactForm({subject}: {subject: string}) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("pending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
      if (!response.ok) throw new Error("Contact preview validation failed");
      setStatus("success");
    } catch { setStatus("error"); }
  }

  return <form className={styles.form} onSubmit={submit}>
    {[
      { name: "name", placeholder: "Full name", autoComplete: "name" },
      { name: "email", placeholder: "Email", autoComplete: "email", type: "email" },
      { name: "company", placeholder: "Company name or website", autoComplete: "organization" },
      { name: "description", placeholder: "What's your idea? How can we help?" },
      { name: "hearAboutUs", placeholder: "How did you hear about us?" },
    ].map(({ name, placeholder, autoComplete, type }) => <label key={name} className={styles.field}>
      <span className={styles.srOnly}>{placeholder}</span>
      <input name={name} placeholder={placeholder} autoComplete={autoComplete} type={type ?? "text"} required={name === "name" || name === "email" || name === "description"} maxLength={2000} defaultValue={name === "description" ? subject : undefined} />
    </label>)}
    <div className={styles.formBottom}>
      <p>This form is a local preview. Enquiries are not sent or stored.</p>
      <button type="submit" disabled={status === "pending"}>{status === "pending" ? "Sending…" : "Send"}</button>
    </div>
    <p className={styles.formStatus} role="status" aria-live="polite">
      {status === "success" ? "Thank you. This preview does not send enquiries." : status === "error" ? "Please try again. Your enquiry has not been sent." : ""}
    </p>
  </form>;
}

export default function Header() {
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [subject, setSubject] = useState("");
  function openContact(value = "") { setSubject(value); setPanel("contact"); }
  useEffect(() => {
    const open = (event: Event) => openContact((event as CustomEvent<string>).detail || "");
    window.addEventListener("site:contact", open);
    return () => window.removeEventListener("site:contact", open);
  }, []);
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const previousPanel = useRef<Panel>(null);
  const exitAnimation = useRef<gsap.core.Timeline | null>(null);
  const closing = useRef(false);

  function closePanel(next: Panel = null) {
    if (closing.current) return;
    const element = dialog.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPanel(next);
      return;
    }
    closing.current = true;
    gsap.killTweensOf([element, ...element.querySelectorAll("*")]);
    const timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => { closing.current = false; setPanel(next); },
    });
    exitAnimation.current = timeline;
    if (panel === "contact") {
      timeline.to(element.querySelector("[data-contact-content]"), { opacity: 0, duration: 0.18 })
        .to(element.querySelector("[data-contact-inner]"), { height: window.innerWidth < 768 ? 44 : 60, duration: 0.35 })
        .to(element.querySelector("[data-contact-inner]"), { width: window.innerWidth < 768 ? 48 : 207, duration: 0.35 });
      if (!next) timeline.to(element, { opacity: 0, duration: 0.15 });
    } else {
      timeline.to(element.querySelectorAll("[data-menu-link]"), { yPercent: 110, stagger: 0.04, duration: 0.25 })
        .to(element, { x: element.clientWidth + 60, duration: 0.65, ease: "power4.in" }, "-=0.1");
    }
  }

  useEffect(() => () => { exitAnimation.current?.kill(); }, []);

  useEffect(() => {
    if (!panel) return;
    const before = document.activeElement as HTMLElement | null;
    const main = document.querySelector("main");
    const savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (main) main.inert = true;
    dialog.current?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled])') ?? [])
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = savedOverflow;
      if (main) main.inert = false;
      if (before?.isConnected) before.focus({ preventScroll: true });
      else menuButton.current?.focus({ preventScroll: true });
    };
  }, [panel]);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (dialog.current) {
          if (!previousPanel.current) gsap.from(dialog.current, { x: 540, duration: 0.65, ease: "power4.out" });
          const links = dialog.current.querySelectorAll("[data-menu-link]");
          if (links.length) gsap.from(links, { yPercent: 110, duration: 0.7, stagger: 0.04, delay: 0.1, ease: "power2.out" });
          const inner = dialog.current.querySelector<HTMLElement>("[data-contact-inner]");
          if (inner) {
            const width = inner.clientWidth, height = inner.clientHeight;
            gsap.timeline({ defaults: { ease: "power2.out" } })
              .fromTo(inner, { width: window.innerWidth < 768 ? 48 : 207, height: window.innerWidth < 768 ? 44 : 60, overflow: "hidden" },
                { width, duration: 0.5 })
              .to(inner, { height, duration: 0.5 })
              .set(inner, { clearProps: "width,height,overflow" });
            gsap.from("[data-contact-content] input", { opacity: 0, duration: 0.5, stagger: 0.18, delay: 0.6 });
            gsap.from("[data-contact-content] button, [data-contact-content] p", { opacity: 0, duration: 0.5, delay: 1.2 });
          }
        }
      });
    }, root);
    previousPanel.current = panel;
    return () => { media.revert(); ctx.revert(); };
  }, [panel]);

  return <header ref={root} className={styles.header}>
    <a href="/" className={styles.logo} aria-label="Otherlife home">
      {/* Original wordmark is a locally stored SVG, including the MoonPay signature. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/otherlife-logo.svg" width="974" height="325" alt="Otherlife — a MoonPay Company" />
    </a>
    {!panel && <div className={styles.controls}>
      <button ref={menuButton} className={styles.menuButton} aria-label="Menu" aria-expanded={false} aria-controls="navigation-panel" onClick={() => setPanel("menu")}><Hamburger open={false}/></button>
      <button className={styles.contactButton} onClick={() => openContact()}>Contact Us</button>
    </div>}
    {panel && <div
      ref={dialog}
      id="navigation-panel"
      role="dialog"
      aria-modal="true"
      aria-label={panel === "contact" ? "Contact us" : "Navigation"}
      tabIndex={-1}
      className={`${styles.panel} ${panel === "contact" ? styles.contactPanel : styles.menuPanel}`}
    >
      {panel === "menu" ? <>
        <div className={`${styles.controls} ${styles.openControls}`}>
          <button className={styles.menuButton} aria-label="Close menu" aria-expanded={true} onClick={() => closePanel()}><Hamburger open/></button>
          <button className={styles.contactButton} onClick={() => openContact()}>Contact Us</button>
        </div>
        <div className={styles.mobileLogo} aria-hidden="true"><img src="/assets/otherlife-logo.svg" width="100" height="34" alt=""/></div>
        <nav className={styles.navigation} aria-label="Main navigation">
          {navigation.map(({ label, href }, index) => <a href={href} key={label} aria-current={pathname === href || (href === "/work" && pathname.startsWith("/work/")) ? "page" : undefined} onClick={pathname === href ? (event) => { event.preventDefault(); closePanel(); } : undefined}>
            <span className={styles.navText} data-menu-link><span><small>0{index + 1}</small>{label}</span></span>
            <span className={styles.navHover} aria-hidden="true"><span><small>0{index + 1}</small>{label}</span></span>
          </a>)}
        </nav>
        <button className={styles.mobileContact} onClick={() => openContact()}>Contact Us</button>
        <div className={styles.menuBottom}><p>Unconventional Solutions</p><SocialLinks/></div>
      </> : <div className={styles.contactInner} data-contact-inner>
        <h2>Lets work together.</h2>
        <button className={styles.closeContact} aria-label="Close contact form" onClick={() => closePanel("menu")}><Hamburger open/></button>
        <div data-contact-content><ContactForm key={subject} subject={subject}/></div>
      </div>}
    </div>}
  </header>;
}
