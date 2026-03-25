

import { Github, Instagram, Twitter, Linkedin } from "lucide-react";
import React from "react";
import { buildUploadUrl } from "@/lib/uploads";

const socials = [
  {
    icon: <Twitter className="w-5 h-5" />,
    url: "https://twitter.com",
    name: "Twitter"
  },
  {
    icon: <Instagram className="w-5 h-5" />,
    url: "https://instagram.com",
    name: "Instagram"
  },
  {
    icon: <Linkedin className="w-5 h-5" />,
    url: "https://linkedin.com",
    name: "Linkedin"
  },
  {
    icon: <Github className="w-5 h-5" />,
    url: "https://github.com",
    name: "GitHub"
  }
];

const Footer = () => (
  <footer
    className="w-full flex flex-col items-center pt-8 pb-5 text-black/60 font-pretendard animate-footer-in"
    style={{
      animation: "footer-in 0.75s cubic-bezier(.38,1.25,.42,1.01) both"
    }}
  >
    <style>
      {`
      @keyframes footer-in {
        0% {
          opacity: 0;
          transform: translateY(48px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      `}
    </style>
    <div className="relative mb-3 flex flex-col items-center">
      <span className="w-16 h-16 rounded-xl overflow-hidden shadow-lg bg-white/60 backdrop-blur-2xl flex items-center justify-center mb-2">
        <img
          src={buildUploadUrl("0e54e0da-a11b-44ad-b2d5-0da73a96a0d6.webp") || ""}
          alt="Hangout Logo"
          className="h-10 w-10 opacity-90"
          draggable={false}
        />
      </span>
      <span className="text-[#388ff7] text-lg font-bold tracking-wider">Hangout</span>
    </div>
    <div className="flex flex-row gap-6 mb-4">
      {socials.map((soc) => (
        <a
          key={soc.name}
          href={soc.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={soc.name}
          className="rounded-full p-2 bg-white/50 border border-white/30 backdrop-blur-md shadow hover:bg-[#388ff7]/80 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {soc.icon}
        </a>
      ))}
    </div>
    <span className="text-xs text-black/40 tracking-wide mb-1 text-center px-1">
      © 2025 Hangout — Tous droits réservés.<br />
      Designed with 💧 by Hangout team.
    </span>
  </footer>
);

export default Footer;


