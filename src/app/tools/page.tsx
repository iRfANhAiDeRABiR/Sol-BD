import type { Metadata } from "next";
import Link from "next/link";
import { ToolsClient } from "./ToolsClient";
import styles from "./tools-page.module.css";

export const metadata: Metadata = {
  title: "Useful Tools | SolutionsBD",
  description:
    "Free useful tools from SolutionsBD including a license finder, password generator, storage converter, download time calculator, and activation checklist.",
};

const resourceCards = [
  {
    icon: "🪟",
    title: "Windows buying guide",
    detail:
      "Compare Home, Pro, and Enterprise licensing options before placing your order.",
    href: "/shop?cat=windows",
  },
  {
    icon: "📦",
    title: "Office & Microsoft 365",
    detail:
      "Find one-time Office keys or subscription options based on your work style.",
    href: "/shop?cat=office",
  },
  {
    icon: "💬",
    title: "Need personal help?",
    detail:
      "Message our team for product selection, installation, and activation support.",
    href: "https://wa.me/8801410699879",
  },
];

export default function ToolsPage() {
  return (
    <main className={styles.page}>
      <ToolsClient />

      <section className={`container ${styles.resources}`} aria-labelledby="tool-resources-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Helpful links</span>
          <h2 id="tool-resources-title">Continue with trusted resources</h2>
          <p>
            After using the tools, jump straight to the product category or
            support channel that fits your need.
          </p>
        </div>

        <div className={styles.resourceGrid}>
          {resourceCards.map((card) => {
            const isExternal = card.href.startsWith("http");

            return isExternal ? (
              <a
                className={styles.resourceCard}
                href={card.href}
                key={card.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.resourceIcon} aria-hidden="true">
                  {card.icon}
                </span>
                <strong>{card.title}</strong>
                <span>{card.detail}</span>
              </a>
            ) : (
              <Link className={styles.resourceCard} href={card.href} key={card.title}>
                <span className={styles.resourceIcon} aria-hidden="true">
                  {card.icon}
                </span>
                <strong>{card.title}</strong>
                <span>{card.detail}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}