import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PdfExpense = {
  id: number;
  title: string;
  amount?: number;
  original_amount?: number | null;
  converted_amount?: number | null;
  converted_currency?: string | null;
  paid_by_name?: string;
  category_name?: string;
  date?: string | null;
  created_at?: string | null;
};

type PdfBalance = {
  userId: number;
  firstname: string;
  amountToReceive: number;
  amountToPay: number;
  netBalance: number;
};

type PdfReimbursement = {
  id: number;
  from_user_id: number;
  to_user_id: number;
  amount: string | number;
  currency: string;
  status: string;
};

type ExportBudgetToPdfParams = {
  tripTitle: string;
  destination?: string | null;
  startAt?: string | null;
  endAt?: string | null;

  currency: string;

  total: number;
  paid: number;
  balance: number;

  expenses: PdfExpense[];
  balances: PdfBalance[];
  reimbursements: PdfReimbursement[];
};

const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const exportBudgetToPdf = ({
  tripTitle,
  destination,
  startAt,
  endAt,
  currency,
  total,
  paid,
  balance,
  expenses,
  balances,
  reimbursements,
}: ExportBudgetToPdfParams): void => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  let currentY = 18;

  doc.setFontSize(20);
  doc.text("TripTogether", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 10;

  doc.setFontSize(16);
  doc.text("Budget du voyage", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 8;

  doc.setFontSize(13);
  doc.text(tripTitle, pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 7;

  doc.setFontSize(10);

  if (destination) {
    doc.text(destination, pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 6;
  }

  if (startAt || endAt) {
    doc.text(
      `${formatDate(startAt)} - ${formatDate(endAt)}`,
      pageWidth / 2,
      currentY,
      {
        align: "center",
      },
    );

    currentY += 10;
  }

  /*
   * RÉCAPITULATIF
   */

  doc.setFontSize(14);
  doc.text("Récapitulatif", 14, currentY);

  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [["Indicateur", "Montant"]],
    body: [
      ["Total des dépenses", formatCurrency(total, currency)],
      ["J'ai payé", formatCurrency(paid, currency)],
      ["Solde net", formatCurrency(balance, currency)],
    ],
    styles: {
      fontSize: 10,
    },
  });

  currentY =
    (
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY ?? currentY;

  currentY += 12;

  /*
   * DÉPENSES PAR CATÉGORIE
   */

  const categoryTotals = new Map<string, number>();

  for (const expense of expenses) {
    const category = expense.category_name || "Autre";

    const amount = Number(
      expense.converted_amount ??
        expense.amount ??
        expense.original_amount ??
        0,
    );

    categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
  }

  doc.setFontSize(14);
  doc.text("Dépenses par catégorie", 14, currentY);

  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [["Catégorie", "Montant"]],
    body: Array.from(categoryTotals.entries()).map(([category, amount]) => [
      category,
      formatCurrency(amount, currency),
    ]),
    styles: {
      fontSize: 10,
    },
  });

  currentY =
    (
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY ?? currentY;

  currentY += 12;

  /*
   * DÉTAIL DES DÉPENSES
   */

  doc.setFontSize(14);
  doc.text("Détail des dépenses", 14, currentY);

  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [["Date", "Dépense", "Catégorie", "Payé par", "Montant"]],
    body: expenses.map((expense) => {
      const amount = Number(
        expense.converted_amount ??
          expense.amount ??
          expense.original_amount ??
          0,
      );

      const expenseCurrency = expense.converted_currency || currency;

      return [
        formatDate(expense.date || expense.created_at),
        expense.title,
        expense.category_name || "-",
        expense.paid_by_name || "Participant",
        formatCurrency(amount, expenseCurrency),
      ];
    }),
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fontSize: 8,
    },
  });

  currentY =
    (
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY ?? currentY;

  currentY += 12;

  /*
   * SOLDES ENTRE PARTICIPANTS
   */

  if (balances.length > 0) {
    doc.setFontSize(14);
    doc.text("Mes soldes avec les participants", 14, currentY);

    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [["Participant", "À recevoir", "À rembourser", "Solde net"]],
      body: balances.map((participant) => [
        participant.firstname,
        formatCurrency(participant.amountToReceive, currency),
        formatCurrency(participant.amountToPay, currency),
        formatCurrency(participant.netBalance, currency),
      ]),
      styles: {
        fontSize: 9,
      },
    });

    currentY =
      (
        doc as jsPDF & {
          lastAutoTable?: {
            finalY: number;
          };
        }
      ).lastAutoTable?.finalY ?? currentY;

    currentY += 12;
  }

  /*
   * REMBOURSEMENTS CONFIRMÉS
   */

  const confirmedReimbursements = reimbursements.filter(
    (reimbursement) => reimbursement.status === "confirmed",
  );

  if (confirmedReimbursements.length > 0) {
    doc.setFontSize(14);
    doc.text("Remboursements confirmés", 14, currentY);

    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [["Émetteur", "Bénéficiaire", "Montant", "Statut"]],
      body: confirmedReimbursements.map((reimbursement) => [
        `Utilisateur ${reimbursement.from_user_id}`,
        `Utilisateur ${reimbursement.to_user_id}`,
        formatCurrency(
          Number(reimbursement.amount || 0),
          reimbursement.currency || currency,
        ),
        "Confirmé",
      ]),
      styles: {
        fontSize: 9,
      },
    });

    currentY =
      (
        doc as jsPDF & {
          lastAutoTable?: {
            finalY: number;
          };
        }
      ).lastAutoTable?.finalY ?? currentY;

    currentY += 12;
  }

  /*
   * PIED DE PAGE
   */

  const pageCount = doc.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);

    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);

    doc.text("Document généré par TripTogether", 14, pageHeight - 10);

    doc.text(
      `Page ${pageNumber}/${pageCount}`,
      pageWidth - 14,
      pageHeight - 10,
      {
        align: "right",
      },
    );
  }

  const safeTitle = tripTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  doc.save(`triptogether-budget-${safeTitle || "voyage"}.pdf`);
};
