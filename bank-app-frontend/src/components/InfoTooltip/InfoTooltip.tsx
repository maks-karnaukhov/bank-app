"use client";

import clsx from "clsx";
import { useState } from "react";
import styles from "./InfoTooltip.module.css";

interface Props {
  title?: string;
  content: React.ReactNode;
  isError: boolean;
}

export default function InfoTooltip({ title, content, isError }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={clsx(styles.icon, isError && styles.error)}
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