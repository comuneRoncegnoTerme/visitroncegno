import styles from "./HomepageSkylineDivider.module.css";

export default function HomepageSkylineDivider() {
  return (
    <section className={styles.divider} aria-label="Roncegno Terme, paesaggio e identità">
      <div className={styles.caption}>
        <span>Roncegno Terme</span>
        <small>Paesaggio · memoria · identità</small>
      </div>
      <div className={styles.image} aria-hidden="true" />
      <div className={styles.fade} aria-hidden="true" />
    </section>
  );
}
