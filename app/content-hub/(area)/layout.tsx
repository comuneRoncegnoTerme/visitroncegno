import { getContentHubSession } from "@/lib/content-hub-auth";
import HubNav from "./HubNav";
import styles from "./hub.module.css";

export default async function ContentHubAreaLayout({ children }: LayoutProps<"/content-hub">) {
  // Le singole pagine verificano comunque la sessione e rimandano al login.
  const session = await getContentHubSession();

  return (
    <div className={styles.shell}>
      <HubNav name={session?.name ?? ""} role={session?.role ?? ""} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
