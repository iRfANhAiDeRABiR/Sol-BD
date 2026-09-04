"use client";

import { useMemo, useState } from "react";
import { TOOLS } from "@/data/tools";
import { ToolCard } from "@/components/tools/ToolCard";
import { SearchIcon, SettingsIcon } from "@/components/tools/ToolIcons";
import styles from "./utility-dashboard.module.css";

export function ToolsClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const query = searchQuery.toLowerCase().trim();
    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <section className={styles.dashboard} aria-labelledby="utility-tools-title">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden="true">
            <SettingsIcon size={32} color="#a78bfa" />
          </span>
          <h1 id="utility-tools-title" className={styles.title}>
            Utility Tools
          </h1>
        </div>
        <p className={styles.subtitle}>
          {TOOLS.length} tools available
        </p>
      </div>

      <div className={styles.searchContainer}>
        <span className={styles.searchIcon} aria-hidden="true">
          <SearchIcon size={20} />
        </span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search utility tools"
        />
      </div>

      <div className={styles.grid} role="list">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <div key={tool.id} role="listitem">
              <ToolCard tool={tool} />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            No tools found matching &ldquo;{searchQuery}&rdquo;. Try a different search term.
          </div>
        )}
      </div>
    </section>
  );
}