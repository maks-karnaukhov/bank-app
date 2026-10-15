"use client";

import styles from "./Dashboard.module.css";

import WelcomeBlock from "@/components/WelcomeBlock/WelcomeBlock";
import BalanceCard from "@/components/BalanceCard/BalanceCard";
import CardsSection from "@/components/CardsSection/CardsSection";
import PhysicalCardSection from "@/components/PhysicalCardSection/PhysicalCardSection";
import CreditCardSection from "@/components/CreditCardSection/CreditCardSection";
import SavingsAccountsSection from "@/components/SavingsAccountsSection/SavingsAccountsSection";
import LoansSection from "@/components/LoansSection/LoansSection";

export default function DashboardPage() {

  return (
    <main className={styles.container}>
      <WelcomeBlock />
      <BalanceCard />
      <CardsSection />
      <PhysicalCardSection />
      <CreditCardSection />
      <SavingsAccountsSection />
      <LoansSection />
    </main>
  );
}