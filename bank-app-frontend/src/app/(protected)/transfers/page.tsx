"use client";

import { LockKeyhole } from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import CardSelect from "@/components/CardSelect/CardSelect";
import TransferSuccessModal from "@/components/TransferSuccessModal/TransferSuccessModal";
import type { Transactions } from "@/types/types";

import {
  lookupTransferRecipient,
  type RecipientMethod,
  type TransferRecipientLookup,
  type TransferType,
} from "@/services/api";

import {
  createTransactionThunk,
  fetchTransactionsThunk,
} from "@/features/transactions/transactionsSlice";

import { fetchCardsThunk } from "@/features/cards/cardsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

import styles from "./Transfer.module.css";
import clsx from "clsx";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const parseAmount = (value: string): number | null => {
  const normalized = value
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
};

const formatAmountInput = (value: string): string => {
  const separatorIndex = value.search(/[.,]/);
  const integerPart =
    separatorIndex === -1
      ? value
      : value.slice(0, separatorIndex);
  const decimalPart =
    separatorIndex === -1
      ? ""
      : value.slice(separatorIndex + 1);
  const separator =
    separatorIndex === -1 ? "" : value[separatorIndex];
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    " ",
  );

  return `${formattedInteger}${separator}${decimalPart}`;
};

const formatBalance = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

const sanitizeAmountInput = (value: string): string => {
  let result = value.replace(/[^\d.,\s\u00a0\u202f]/g, "");
  result = result.replace(/[\s\u00a0\u202f]/g, "");

  const separatorIndex = result.search(/[.,]/);

  if (separatorIndex === -1) {
    return result;
  }

  const integerPart = result.slice(0, separatorIndex);
  const decimalPart = result
    .slice(separatorIndex + 1)
    .replace(/[.,]/g, "")
    .slice(0, 2);

  const separator =
    result[separatorIndex] === "," ? "," : ".";

  return `${integerPart}${separator}${decimalPart}`;
};

export default function TransferPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error } = useSelector(
    (state: RootState) => state.transactions,
  );

  const {
    cards,
    loading: cardsLoading,
    error: cardsError,
  } = useSelector((state: RootState) => state.cards);

  const [transferType, setTransferType] = useState<TransferType>("recipient");
  const [fromCardId, setFromCardId] = useState("");
  const [toCardId, setToCardId] = useState("");
  const [recipientMethod, setRecipientMethod] = useState<RecipientMethod>("email");
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [activeMethodIndex, setActiveMethodIndex] = useState(0);
  const [recipientValue, setRecipientValue] = useState("");
  const [recipientLookup, setRecipientLookup] = useState<TransferRecipientLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [anyCard, setAnyCard] = useState(false);
  const [amount, setAmount] = useState("");

  const [completedTransfer, setCompletedTransfer] = useState<{
    transaction: Transactions;
    recipientLabel: string;
    destinationCardLast4?: string;
    isOwnTransfer: boolean;
  } | null>(null);

  const methodSelectRef = useRef<HTMLDivElement>(null);
  const methodTriggerRef = useRef<HTMLButtonElement>(null);

  const recipientMethods: {
    value: RecipientMethod;
    label: string;
  }[] = [
    { value: "email", label: "Email address" },
    { value: "phone", label: "Phone number" },
    { value: "card", label: "Card number" },
  ];

  const selectedMethod = recipientMethods.find(
    (method) => method.value === recipientMethod,
  );

  useEffect(() => {
    dispatch(fetchCardsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!isMethodOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (
        methodSelectRef.current &&
        !methodSelectRef.current.contains(event.target as Node)
      ) {
        setIsMethodOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMethodOpen(false);
        methodTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick,
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMethodOpen]);

  const chooseRecipientMethod = (method: RecipientMethod) => {
    setIsMethodOpen(false);
    handleRecipientMethodChange(method);
    methodTriggerRef.current?.focus();
  };

  const handleMethodKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      if (!isMethodOpen) {
        const currentIndex = recipientMethods.findIndex(
          (method) => method.value === recipientMethod,
        );

        setActiveMethodIndex(Math.max(0, currentIndex));
        setIsMethodOpen(true);
        return;
      }

      setActiveMethodIndex((current) =>
        event.key === "ArrowDown"
          ? (current + 1) % recipientMethods.length
          : (current - 1 + recipientMethods.length) %
            recipientMethods.length,
      );
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isMethodOpen) {
        const method = recipientMethods[activeMethodIndex];

        if (method) chooseRecipientMethod(method.value);
      } else {
        const currentIndex = recipientMethods.findIndex(
          (method) => method.value === recipientMethod,
        );

        setActiveMethodIndex(Math.max(0, currentIndex));
        setIsMethodOpen(true);
      }
    }
  };

  const availableCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          card.type === "DEBIT" &&
          card.isActive &&
          !card.isFrozen &&
          !card.isClosed,
      ),
    [cards],
  );

  const selectedCard = availableCards.find(
    (card) => card.id === fromCardId,
  );

  const ownDestinationCards = availableCards.filter(
    (card) =>
      card.id !== fromCardId &&
      card.currency === selectedCard?.currency,
  );

  const parsedAmount = parseAmount(amount);

  const amountError = useMemo(() => {
    if (!amount.trim()) {
      return "Enter the transfer amount.";
    }

    if (parsedAmount === null) {
      return "Enter a positive amount with no more than 2 decimal places.";
    }

    if (selectedCard && parsedAmount > selectedCard.balance) {
      return "The amount exceeds the available balance.";
    }

    return "";
  }, [amount, parsedAmount, selectedCard]);

  const recipientInputValid = useMemo(() => {
    const value = recipientValue.trim();

    if (!value) return false;

    if (recipientMethod === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (recipientMethod === "phone") {
      return value.replace(/\D/g, "").length >= 7;
    }

    return value.replace(/\D/g, "").length === 16;
  }, [recipientMethod, recipientValue]);

  useEffect(() => {
    if (!fromCardId && availableCards.length > 0) {
      setFromCardId(availableCards[0].id);
    }
  }, [fromCardId, availableCards]);

  useEffect(() => {
    setToCardId("");
    setRecipientLookup(null);
    setLookupError("");
  }, [fromCardId]);

  const resetRecipient = () => {
    setRecipientLookup(null);
    setLookupError("");
    setToCardId("");
    setAnyCard(false);
  };

  const handleTransferTypeChange = (type: TransferType) => {
    setTransferType(type);
    setToCardId("");
    setRecipientValue("");
    setRecipientLookup(null);
    setLookupError("");
    setAnyCard(false);
  };

  const handleRecipientMethodChange = (
    method: RecipientMethod,
  ) => {
    setRecipientMethod(method);
    setRecipientValue("");
    resetRecipient();
  };

  const handleLookup = async () => {
    setLookupError("");
    setRecipientLookup(null);
    setToCardId("");
    setAnyCard(false);

    if (!fromCardId) {
      setLookupError("Select the card you want to transfer from.");
      return;
    }

    if (!recipientInputValid) {
      setLookupError(
        recipientMethod === "email"
          ? "Enter a valid email address."
          : recipientMethod === "phone"
            ? "Enter a valid phone number."
            : "Enter a 16-digit card number.",
      );
      return;
    }

    setLookupLoading(true);

    try {
      const response = await lookupTransferRecipient({
        method: recipientMethod,
        value: recipientValue.trim(),
        fromCardId,
      });

      const result = response.data;
      setRecipientLookup(result);

      if (!result.found || !result.recipient) {
        setLookupError(
          result.message ??
            "No verified recipient account was found.",
        );
        return;
      }

      if (result.cards.length === 0) {
        setLookupError(
          result.message ??
            "The recipient has no available cards in this currency.",
        );
        return;
      }

      if (result.matchedCardId && result.cards.some((card) => card.id === result.matchedCardId)) {
        setToCardId(result.matchedCardId);
      }
    } catch (error) {
      const apiError = error as ApiError;

      setLookupError(
        apiError.response?.data?.message ??
          apiError.message ??
          "Failed to search for recipient.",
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedCard || parsedAmount === null || amountError) {
      return;
    }

    if (transferType === "own") {
      if (!toCardId || toCardId === fromCardId || !ownDestinationCards.some((card) => card.id === toCardId)) {
        return;
      }
    } else {
      if (!recipientLookup?.found || !recipientLookup.recipient || recipientLookup.cards.length === 0) {
        setLookupError("Find and verify the recipient before sending.");
        return;
      }

      if (!anyCard && !recipientLookup.cards.some((card) => card.id === toCardId)) {
        setLookupError("Choose a recipient card or enable automatic selection.");
        return;
      }
    }

    try {
      const transaction = await dispatch(
        createTransactionThunk(
          transferType === "own"
            ? {
                fromCardId,
                toCardId,
                amount: parsedAmount,
                transferType: "own",
                anyCard: false,
              }
            : {
                fromCardId,
                amount: parsedAmount,
                transferType: "recipient",
                recipientMethod,
                recipientValue: recipientValue.trim(),
                ...(anyCard ? { anyCard: true } : { toCardId }),
              },
        ),
      ).unwrap();

      const isOwnTransfer = transferType === "own";

      const destinationCard = isOwnTransfer
        ? ownDestinationCards.find((card) => card.id === toCardId)
        : recipientLookup?.cards.find((card) => card.id === toCardId);

      const recipient = recipientLookup?.recipient;

      const recipientLabel = isOwnTransfer
        ? destinationCard?.name ?? "Your account"
        : recipient
          ? `${recipient.firstName} ${recipient.lastName}`.trim() ||
            recipient.email ||
            recipientValue.trim()
          : recipientValue.trim();

      setCompletedTransfer({
        transaction,
        recipientLabel,
        destinationCardLast4: destinationCard?.last4,
        isOwnTransfer,
      });

      setCompletedTransfer({
        transaction,
        recipientLabel,
        destinationCardLast4: destinationCard?.last4,
        isOwnTransfer,
      });

      setAmount("");

      await Promise.all([
        dispatch(fetchCardsThunk()),
        dispatch(fetchTransactionsThunk()),
      ]);

      if (transferType === "recipient") {
        setRecipientLookup(null);
        setRecipientValue("");
        setToCardId("");
        setAnyCard(false);
      } else {
        setToCardId("");
      }
    } catch {
      // Redux stores the error and the page displays it below.
    }
  };

  const recipientCardSelected =
    transferType === "recipient" &&
    Boolean(toCardId) &&
    recipientLookup?.cards.some((card) => card.id === toCardId);

  const canSubmit =
    !loading &&
    !cardsLoading &&
    !lookupLoading &&
    Boolean(selectedCard) &&
    parsedAmount !== null &&
    !amountError &&
    (transferType === "own"
      ? Boolean(
          toCardId &&
            toCardId !== fromCardId &&
            ownDestinationCards.some(
              (card) => card.id === toCardId,
            ),
        )
      : Boolean(
          recipientLookup?.found &&
            recipientLookup.recipient &&
            recipientLookup.cards.length > 0 &&
            (anyCard || recipientCardSelected),
        ));

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>BETTA BANK</span>
          <h1 className={styles.title}>Transfer money</h1>
          <p className={styles.subtitle}>
            Transfer funds between your cards or send money to another user.
          </p>
        </header>

        <div className={styles.modeSwitch} aria-label="Transfer type">
          <button
            type="button"
            className={
              transferType === "recipient"
                ? clsx(styles.modeButton, styles.modeButtonActive)
                : styles.modeButton
            }
            onClick={() => handleTransferTypeChange("recipient")}
            disabled={loading}
          >
            To another user
          </button>

          <button
            type="button"
            className={
              transferType === "own"
                ? clsx(styles.modeButton, styles.modeButtonActive)
                : styles.modeButton
            }
            onClick={() => handleTransferTypeChange("own")}
            disabled={loading}
          >
            Between my cards
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>1</span>
              <div>
                <h2 className={styles.sectionTitle}>From</h2>
                <p className={styles.sectionDescription}>
                  Select the debit card to transfer from.
                </p>
              </div>
            </div>

            {cardsLoading ? (
              <p className={styles.helper}>Loading your cards...</p>
            ) : availableCards.length === 0 ? (
              <p className={styles.error}>
                You don&apos;t have an available debit card.
              </p>
            ) : (
              <CardSelect
                id="sender-card"
                cards={availableCards}
                value={fromCardId}
                onChange={setFromCardId}
                disabled={loading}
                placeholder="Select a debit card"
              />
            )}

            {selectedCard && (
              <div className={styles.balanceLine}>
                <span>Available balance</span>
                <strong>
                  {formatBalance(selectedCard.balance, selectedCard.currency)}
                </strong>
              </div>
            )}
          </section>

          {transferType === "own" ? (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.step}>2</span>
                <div>
                  <h2 className={styles.sectionTitle}>To</h2>
                  <p className={styles.sectionDescription}>
                    Choose another debit card in the same currency.
                  </p>
                </div>
              </div>

              {ownDestinationCards.length === 0 ? (
                <p className={styles.helper}>
                  You need another available debit card in{" "}
                  {selectedCard?.currency ?? "the same currency"}.
                </p>
              ) : (
                <CardSelect
                  id="destination-card"
                  cards={ownDestinationCards}
                  value={toCardId}
                  onChange={setToCardId}
                  disabled={loading}
                  placeholder="Select your destination card"
                />
              )}

              <p className={styles.helper}>
                Transfers to the same card are not allowed.
              </p>
            </section>
          ) : (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.step}>2</span>
                <div>
                  <h2 className={styles.sectionTitle}>Recipient</h2>
                  <p className={styles.sectionDescription}>
                    Search by email, phone number or card number.
                  </p>
                </div>
              </div>

              <label className={styles.label} htmlFor="recipient-method">
                Search by
              </label>

              <div ref={methodSelectRef} className={styles.methodSelect}>
                <button
                  ref={methodTriggerRef}
                  id="recipient-method"
                  type="button"
                  className={clsx(
                    styles.methodTrigger,
                    isMethodOpen ? styles.methodTriggerOpen : "",
                  )}
                  aria-haspopup="listbox"
                  aria-expanded={isMethodOpen}
                  aria-controls="recipient-method-options"
                  disabled={loading || lookupLoading}
                  onClick={() => {
                    if (isMethodOpen) {
                      setIsMethodOpen(false);
                    } else {
                      const currentIndex = recipientMethods.findIndex(
                        (method) => method.value === recipientMethod,
                      );

                      setActiveMethodIndex(Math.max(0, currentIndex));
                      setIsMethodOpen(true);
                    }
                  }}
                  onKeyDown={handleMethodKeyDown}
                >
                  <span className={styles.methodSelected}>
                    {selectedMethod?.label ?? "Select a search method"}
                  </span>

                  <svg
                    className={clsx(
                      styles.methodChevron,
                      isMethodOpen ? styles.methodChevronOpen : "",
                    )}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isMethodOpen && (
                  <div
                    id="recipient-method-options"
                    className={styles.methodOptions}
                    role="listbox"
                    aria-label="Search by"
                  >
                    {recipientMethods.map((method, index) => (
                      <button
                        key={method.value}
                        type="button"
                        role="option"
                        aria-selected={method.value === recipientMethod}
                        tabIndex={-1}
                        className={clsx(
                          styles.methodOption,
                          method.value === recipientMethod ? styles.methodOptionSelected : "",
                        )}
                        onClick={() => chooseRecipientMethod(method.value)}
                        onMouseEnter={() => setActiveMethodIndex(index)}
                      >
                        <span>{method.label}</span>

                        {method.value === recipientMethod && (
                          <svg
                            className={styles.methodCheck}
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="m5 12 4 4L19 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className={styles.label} htmlFor="recipient-value">
                {recipientMethod === "email"
                  ? "Recipient email"
                  : recipientMethod === "phone"
                    ? "Recipient phone"
                    : "Recipient card number"}
              </label>

              <div className={styles.searchRow}>
                <input
                  id="recipient-value"
                  className={styles.input}
                  type="text"
                  value={recipientValue}
                  onChange={(event) => {
                    setRecipientValue(event.target.value);
                    resetRecipient();
                  }}
                  placeholder={
                    recipientMethod === "email"
                      ? "recipient@example.com"
                      : recipientMethod === "phone"
                        ? "+1 555 123 4567"
                        : "16-digit card number"
                  }
                  autoComplete={recipientMethod === "email" ? "email" : "off"}
                  disabled={loading || lookupLoading}
                />

                <button
                  type="button"
                  className={styles.searchButton}
                  onClick={handleLookup}
                  disabled={
                    loading ||
                    lookupLoading ||
                    !fromCardId ||
                    !recipientInputValid
                  }
                >
                  {lookupLoading ? "Searching..." : "Find"}
                </button>
              </div>

              {recipientLookup?.found && recipientLookup.recipient && (
                <div className={styles.recipientPanel}>
                  <div className={styles.recipientIdentity}>
                    <div className={styles.avatar} aria-hidden="true">
                      {recipientLookup.recipient.firstName.charAt(0).toUpperCase()}
                      {recipientLookup.recipient.lastName.charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.recipientDetails}>
                      <strong>
                        {recipientLookup.recipient.firstName}{" "}
                        {recipientLookup.recipient.lastName}
                      </strong>
                      <span>{recipientLookup.recipient.email}</span>
                      <span className={styles.verified}>
                        Recipient account found
                      </span>
                    </div>
                  </div>

                  {recipientLookup.cards.length > 0 && (
                    <>
                      <h3 className={styles.cardsTitle}>
                        Available destination cards
                      </h3>

                      <div className={styles.recipientCards}>
                        {recipientLookup.cards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            className={!anyCard && toCardId === card.id
                                ? clsx(styles.recipientCard, styles.recipientCardSelected)
                                : styles.recipientCard
                            }
                            onClick={() => {
                              setToCardId(card.id);
                              setAnyCard(false);
                            }}
                            disabled={loading}
                            aria-pressed={
                              !anyCard && toCardId === card.id
                            }
                          >
                            <span
                              className={styles.recipientCardIcon}
                              aria-hidden="true"
                            >
                              {card.network === "MASTERCARD" ? "M" : "D"}
                            </span>

                            <span className={styles.recipientCardInfo}>
                              <strong>{card.name}</strong>
                              <span>
                                {card.network} •••• {card.last4}
                              </span>
                            </span>

                            <span
                              className={styles.radioMark}
                              aria-hidden="true"
                            >
                              {!anyCard && toCardId === card.id ? "✓" : ""}
                            </span>
                          </button>
                        ))}
                      </div>

                      <label className={styles.anyCardOption}>
                        <input
                          type="checkbox"
                          checked={anyCard}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setAnyCard(checked);
                            if (checked) setToCardId("");
                          }}
                          disabled={loading}
                        />
                        <span>
                          <strong>
                            Transfer to any available card
                          </strong>
                          <small>
                            Betta Bank will select a compatible card automatically.
                          </small>
                        </span>
                      </label>
                    </>
                  )}
                </div>
              )}

              {lookupError && (
                <p className={styles.error} role="alert">
                  {lookupError}
                </p>
              )}
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>3</span>
              <div>
                <h2 className={styles.sectionTitle}>Amount</h2>
                <p className={styles.sectionDescription}>
                  Enter the amount in{" "}
                  {selectedCard?.currency ?? "your card's currency"}.
                </p>
              </div>
            </div>

            <label className={styles.label} htmlFor="transfer-amount">
              Transfer amount ({selectedCard?.currency ?? "USD"})
            </label>

            <div className={styles.amountWrap}>
              <input
                id="transfer-amount"
                className={styles.amountInput}
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(event) => {
                  const sanitizedValue = sanitizeAmountInput(event.target.value);

                  setAmount(formatAmountInput(sanitizedValue));
                }}
                onBlur={() => setAmount(formatAmountInput(sanitizeAmountInput(amount)))}
                disabled={loading}
                autoComplete="off"
                aria-describedby="amount-help"
              />
              <span className={styles.currencyBadge}>
                {selectedCard?.currency ?? "USD"}
              </span>
            </div>

            <p id="amount-help" className={styles.helper}>
              You can use a comma or a dot for cents. Spaces separate thousands.
            </p>

            {amountError && amount.trim() && (
              <p className={styles.error} role="alert">
                {amountError}
              </p>
            )}
          </section>

          {cardsError && (
            <p className={styles.error} role="alert">
              {cardsError}
            </p>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canSubmit}
          >
            {loading ? "Processing transfer..." : "Confirm transfer"}
          </button>

          <p className={styles.securityNote}>
            <LockKeyhole size={14} aria-hidden="true" />
            The transfer is validated and processed by the server.
          </p>
        </form>
      </section>

      {completedTransfer && (
        <TransferSuccessModal
          transaction={completedTransfer.transaction}
          recipientLabel={completedTransfer.recipientLabel}
          destinationCardLast4={completedTransfer.destinationCardLast4}
          isOwnTransfer={completedTransfer.isOwnTransfer}
          onClose={() => setCompletedTransfer(null)}
        />
      )}
    </main>
  );
}