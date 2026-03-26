

import { Variants } from "framer-motion";


export const eventImgDemo = "https://projet-hangout-sio.onrender.com/uploads/bba09e43-94b0-4531-be65-ec517d2aae23.png";
export const eventImgDemo2 = "https://projet-hangout-sio.onrender.com/uploads/471c53c3-61d1-4acf-8603-11877998e0f0.png";
export const customUploadedImg = "https://projet-hangout-sio.onrender.com/uploads/d8ab2d6d-32e5-4b66-9b6d-45d4a8224702.webp";
export const bgHero = "https://projet-hangout-sio.onrender.com/uploads/8ddeae57-ab25-4cdf-acd1-571d73da393b.webp";

export const avatarUrls = [
  "https://randomuser.me/api/portraits/men/34.jpg",
  "https://randomuser.me/api/portraits/women/79.jpg",
];

export const avatarUrls2 = [
  "https://randomuser.me/api/portraits/men/55.jpg",
  "https://randomuser.me/api/portraits/women/60.jpg",
];


export const imagesToPreload = [
  bgHero,
  eventImgDemo,
  customUploadedImg,
  ...avatarUrls,
  ...avatarUrls2,
];


export const miniCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.65,
    filter: "blur(16px)",
    x: 0,
    y: 0,
    rotate: 0,
  },
  animateRight: {
    opacity: 1,
    scale: 1.16,
    filter: "blur(0px)",
    x: 98,
    y: 16,
    rotate: 13,
    transition: {
      duration: 1.1,
      type: "spring",
      bounce: 0.45,
      filter: { duration: 0.5 },
      opacity: { duration: 0.5 }
    }
  },
  animateLeft: {
    opacity: 1,
    scale: 1.16,
    filter: "blur(0px)",
    x: -36, 
    y: 82,  
    rotate: -16,
    transition: {
      duration: 1.1,
      type: "spring",
      bounce: 0.45,
      filter: { duration: 0.53 },
      opacity: { duration: 0.52 }
    }
  },
  
  static: {
    opacity: 1,
    scale: 1.16,
    filter: "blur(0px)",
    
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 0 }
  }
};


