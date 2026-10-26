"use client";

import React, { useState } from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Official bKash Logo loaded with vector graphic and local fallback
 */
export function BkashLogo({ className = "w-7 h-7", size = 32 }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <Image
        src="/img_content/bkash.png"
        alt="bKash"
        width={size}
        height={size}
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg className={className} width={size} height={size} viewBox="11.2 10.7 458 209.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M327.99 110.75l12.99 58.4 85.01-43.04z" fill="#d12053" />
      <path d="M352.16 23.48L328 110.76l98.01 15.35z" fill="#e2136e" />
      <path d="M248.31 10.7l101.38 12.11-23.97 86.76z" fill="#d12053" />
      <path d="M247.52 27.76h11.29l31.67 40.5z" fill="#9e1638" />
      <path d="M428.69 125.55l-29.46-40.77 47.66-8.53z" fill="#d12053" />
      <path d="M423.77 137.5l3.04-9.07-74.39 37.74z" fill="#e2136e" />
      <path d="M325.91 113.05l15.52 69.77-46.06 37.46z" fill="#9e1638" />
      <path d="M442.25 96.97l27.05-.46-19.55-19.89z" fill="#e2136e" />
    </svg>
  );
}

/**
 * Official Nagad Logo loaded with local asset and vector fallback
 */
export function NagadLogo({ className = "w-7 h-7", size = 32 }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <Image
        src="/img_content/nagad.png"
        alt="Nagad"
        width={size}
        height={size}
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#F7941D" />
      <path
        d="M26 65V35L42 55L58 35V65"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="74" cy="50" r="6" fill="#ED1C24" />
    </svg>
  );
}

/**
 * Official Rocket Logo loaded with local asset and vector fallback
 */
export function RocketLogo({ className = "w-7 h-7", size = 32 }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <Image
        src="/img_content/rocket.png"
        alt="Rocket"
        width={size}
        height={size}
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#8C3494" />
      <path
        d="M50 20L65 55H35L50 20Z"
        fill="#FFFFFF"
      />
      <circle cx="50" cy="42" r="5" fill="#8C3494" />
      <path
        d="M42 60L50 78L58 60H42Z"
        fill="#F37023"
      />
    </svg>
  );
}

