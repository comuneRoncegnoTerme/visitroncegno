import type { ReactNode } from "react";
import styles from "./hub.module.css";

type Props = {
  title: string;
  intro?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({ title, intro, actions, className }: Props) {
  return (
    <header className={`${styles.pageHeader} ${className ?? ""}`}>
      <div>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      {actions && <div className={styles.pageHeaderActions}>{actions}</div>}
    </header>
  );
}
