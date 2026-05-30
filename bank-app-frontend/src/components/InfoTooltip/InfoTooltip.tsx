"use client";

import { useState } from "react";
import styles from "./InfoTooltip.module.css";

interface Props {
  title?: string;
  content: React.ReactNode;
}

export default function InfoTooltip({ title, content }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.icon}
        onClick={() => setOpen((v) => !v)}
      >
        !
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />

          <div className={styles.tooltip}>
            {title && <div className={styles.title}>{title}</div>}

            <div className={styles.content}>{content}</div>
          </div>
        </>
      )}
    </div>
  );
}