"use client";

import styles from "./Dashboard.module.css";

import WelcomeBlock from "@/components/WelcomeBlock/WelcomeBlock";
import BalanceCard from "@/components/BalanceCard/BalanceCard";
import CardsSection from "@/components/CardsSection/CardsSection";
import PhysicalCardSection from "@/components/PhysicalCardSection/PhysicalCardSection";
import CreditCardSection from "@/components/CreditCardSection/CreditCardSection";
import SavingsAccountsSection from "@/components/SavingsAccountsSection/SavingsAccountsSection";

export default function DashboardPage() {

  return (
    <main className={styles.container}>
      <WelcomeBlock />
      <BalanceCard />
      <CardsSection />
      <PhysicalCardSection />
      <CreditCardSection />
      <SavingsAccountsSection />
    </main>
  );
}