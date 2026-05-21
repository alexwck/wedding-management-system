"use client";

import React from "react";

interface NewTabLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function NewTabLink({ href, children, className, title }: NewTabLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <a href={href} className={className} title={title} onClick={handleClick}>
      {children}
    </a>
  );
}
