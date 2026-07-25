"use client";

import WelcomeBlock from "@/components/WelcomeBlock/WelcomeBlock";
import styles from "./Dashboard.module.css";
import BalanceCard from "@/components/BalanceCard/BalanceCard";
import CardsSection from "@/components/CardsSection/CardsSection";

export default function DashboardPage() {

  return (
    <main className={styles.container}>
      <WelcomeBlock />
      <BalanceCard />
      <CardsSection />
    </main>
  );
}