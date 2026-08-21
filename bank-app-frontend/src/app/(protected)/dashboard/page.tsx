"use client";

import WelcomeBlock from "@/components/WelcomeBlock/WelcomeBlock";
import styles from "./Dashboard.module.css";
import BalanceCard from "@/components/BalanceCard/BalanceCard";
import CardsSection from "@/components/CardsSection/CardsSection";
import PhysicalCardSection from "@/components/PhysicalCardSection/PhysicalCardSection";
import CreditCardSection from "@/components/CreditCardSection/CreditCardSection";

export default function DashboardPage() {

  return (
    <main className={styles.container}>
      <WelcomeBlock />
      <BalanceCard />
      <CardsSection />
      <PhysicalCardSection />
      <CreditCardSection />
    </main>
  );
}