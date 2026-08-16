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

type PdfMember = {
  id: number;
  firstname: string;
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
  members: PdfMember[];
  tripImageUrl?: string | null;
};

type CategoryTotal = {
  name: string;
  amount: number;
};

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

type PdfColor = [number, number, number];

type SummaryItem = {
  label: string;
  amount: string;
  background: PdfColor;
  icon: string;
};

/* =========================================================
   CONFIGURATION
   ========================================================= */

const LOGO_URL = "/logos/logo.png";

const COLORS = {
  primary: [27, 94, 29] as PdfColor, // #1b5e1d
  primaryDark: [16, 73, 24] as PdfColor,
  primarySoft: [232, 243, 232] as PdfColor,
  primaryVerySoft: [244, 249, 244] as PdfColor,

  cream: [252, 250, 246] as PdfColor,
  white: [255, 255, 255] as PdfColor,
  text: [37, 43, 39] as PdfColor,
  muted: [103, 110, 105] as PdfColor,
  border: [221, 226, 220] as PdfColor,
  softGrey: [247, 248, 246] as PdfColor,

  blue: [103, 160, 217] as PdfColor,
  blueSoft: [226, 238, 249] as PdfColor,
  yellow: [238, 181, 57] as PdfColor,
  yellowSoft: [253, 243, 211] as PdfColor,
  purple: [159, 124, 211] as PdfColor,
  coral: [212, 142, 101] as PdfColor,
  greenChart: [110, 168, 108] as PdfColor,
} as const;

const CATEGORY_COLORS: PdfColor[] = [
  COLORS.blue,
  COLORS.greenChart,
  COLORS.yellow,
  COLORS.purple,
  COLORS.coral,
];

const PAGE_MARGIN = 14;
const FOOTER_Y_OFFSET = 8;

/* =========================================================
   FORMATAGE
   ========================================================= */

/**
 * Important : Intl.NumberFormat("fr-FR") utilise des espaces insécables
 * (U+00A0 / U+202F). Certaines polices standard de jsPDF les rendent mal,
 * ce qui provoque les barres / caractères parasites entre les chiffres.
 * On les remplace donc par des espaces ASCII classiques.
 */
const sanitizePdfText = (value: string): string =>
  value
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatCurrency = (amount: number, currency: string): string => {
  try {
    const value = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

    return sanitizePdfText(value);
  } catch {
    return `${Number(amount || 0).toFixed(2).replace(".", ",")} ${currency}`;
  }
};

const formatDate = (value?: string | null): string => {
  if (!value) return "-";

  const dateValue = value.slice(0, 10);
  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) return sanitizePdfText(value);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const getExpenseAmount = (expense: PdfExpense): number =>
  Number(
    expense.converted_amount ??
      expense.amount ??
      expense.original_amount ??
      0,
  );

const getPercentage = (amount: number, total: number): number => {
  if (total <= 0) return 0;
  return (amount / total) * 100;
};

/* =========================================================
   IMAGES
   ========================================================= */

const loadImageAsDataUrl = async (imageUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : null);
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Impossible de charger l'image : ${imageUrl}`, error);
    return null;
  }
};

const getImageElement = (dataUrl: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });

/**
 * Crée une image "cover" avec coins arrondis via Canvas.
 * Cela permet d'obtenir un vrai rendu moderne dans jsPDF.
 */
const createRoundedCoverImage = async (
  dataUrl: string,
  width = 1200,
  height = 720,
  radius = 48,
): Promise<string | null> => {
  const image = await getImageElement(dataUrl);
  if (!image) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.moveTo(radius, 0);
  context.lineTo(width - radius, 0);
  context.quadraticCurveTo(width, 0, width, radius);
  context.lineTo(width, height - radius);
  context.quadraticCurveTo(width, height, width - radius, height);
  context.lineTo(radius, height);
  context.quadraticCurveTo(0, height, 0, height - radius);
  context.lineTo(0, radius);
  context.quadraticCurveTo(0, 0, radius, 0);
  context.closePath();
  context.clip();

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
};

const drawLogo = async (
  doc: jsPDF,
  x: number,
  y: number,
): Promise<void> => {
  const logo =
    await loadImageAsDataUrl(
      LOGO_URL,
    );

  doc.setTextColor(
    ...COLORS.primary,
  );
  doc.setFont(
    "helvetica",
    "bold",
  );
  doc.setFontSize(14);

  if (!logo) {
    doc.text(
      "TripTogether",
      x,
      y + 7,
    );
    return;
  }

  const image =
    await getImageElement(
      logo,
    );

  if (!image) {
    doc.text(
      "TripTogether",
      x,
      y + 7,
    );
    return;
  }

  /*
   * Le logo PNG contient uniquement le pictogramme.
   * On ajoute donc le nom TripTogether à droite.
   */
  const maxWidth = 13;
  const maxHeight = 12;
  const ratio =
    image.width /
    image.height;

  let width = maxWidth;
  let height =
    width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width =
      height * ratio;
  }

  const format =
    logo.startsWith(
      "data:image/png",
    )
      ? "PNG"
      : "JPEG";

  doc.addImage(
    logo,
    format,
    x,
    y,
    width,
    height,
  );

  const brandTextX =
    x + width + 4;

  const brandTextY =
    y +
    height / 2 +
    2.2;

  doc.setTextColor(
    52,
    52,
    52,
  );
  doc.setFont(
    "helvetica",
    "bold",
  );
  doc.setFontSize(14);

  doc.text(
    "TripTogether",
    brandTextX,
    brandTextY,
  );
};

/* =========================================================
   COMPOSANTS VISUELS
   ========================================================= */

const drawPageBackground = (doc: jsPDF): void => {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFillColor(...COLORS.cream);
  doc.rect(0, 0, width, height, "F");
};

const drawSectionTitle = (
  doc: jsPDF,
  title: string,
  y: number,
  icon?: string,
): number => {
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);

  if (icon) {
    doc.setFillColor(...COLORS.primarySoft);
    doc.circle(PAGE_MARGIN + 3, y - 1.2, 3.2, "F");
    doc.setFontSize(7.5);
    doc.text(icon, PAGE_MARGIN + 3, y, { align: "center" });
    doc.setFontSize(13.5);
    doc.text(title, PAGE_MARGIN + 9, y);
  } else {
    doc.text(title, PAGE_MARGIN, y);
  }

  return y + 7;
};

const drawCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: PdfColor = COLORS.white,
): void => {
  doc.setFillColor(...fillColor);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, width, height, 3.5, 3.5, "FD");
};

const drawSummary = (
  doc: jsPDF,
  y: number,
  currency: string,
  total: number,
  paid: number,
  balance: number,
): number => {
  const x = PAGE_MARGIN;
  const width = 182;
  const height = 34;
  const columnWidth = width / 3;

  drawCard(doc, x, y, width, height);

  const items: SummaryItem[] = [
    {
      label: "Total des dépenses",
      amount: formatCurrency(total, currency),
      background: COLORS.primarySoft,
      icon: "€",
    },
    {
      label: "J'ai payé",
      amount: formatCurrency(paid, currency),
      background: COLORS.yellowSoft,
      icon: "€",
    },
    {
      label: "Solde net",
      amount: formatCurrency(balance, currency),
      background: COLORS.blueSoft,
      icon: "=",
    },
  ];

  for (
    const [index, item] of
    items.entries()
  ) {
    const columnX =
      x +
      index * columnWidth;

    if (index > 0) {
      doc.setDrawColor(
        ...COLORS.border,
      );
      doc.setLineWidth(0.2);
      doc.line(
        columnX,
        y + 6,
        columnX,
        y + height - 6,
      );
    }

    doc.setFillColor(
      ...item.background,
    );
    doc.circle(
      columnX + 10,
      y + 17,
      6.3,
      "F",
    );

    doc.setTextColor(
      ...COLORS.primaryDark,
    );
    doc.setFont(
      "helvetica",
      "bold",
    );
    doc.setFontSize(8.5);
    doc.text(
      item.icon,
      columnX + 10,
      y + 18.2,
      {
        align: "center",
      },
    );

    doc.setTextColor(
      ...COLORS.text,
    );
    doc.setFont(
      "helvetica",
      "normal",
    );
    doc.setFontSize(7.7);
    doc.text(
      item.label,
      columnX + 20,
      y + 12,
    );

    doc.setTextColor(
      ...COLORS.primaryDark,
    );
    doc.setFont(
      "helvetica",
      "bold",
    );
    doc.setFontSize(13.5);
    doc.text(
      item.amount,
      columnX + 20,
      y + 23.5,
    );
  }

  return y + height + 11;
};

/* =========================================================
   CATÉGORIES + DONUT
   ========================================================= */

const buildCategoryTotals = (expenses: PdfExpense[]): CategoryTotal[] => {
  const totals =
    new Map<string, number>();

  for (const expense of expenses) {
    const category =
      expense.category_name ||
      "Autre";

    const amount =
      getExpenseAmount(
        expense,
      );

    totals.set(
      category,
      (totals.get(category) || 0) +
        amount,
    );
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
};

const drawDonutChart = (
  doc: jsPDF,
  categories: CategoryTotal[],
  centerX: number,
  centerY: number,
  radius: number,
): void => {
  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  if (total <= 0) return;

  let currentAngle = -Math.PI / 2;

  for (
    const [index, category] of
    categories.entries()
  ) {
    const portion = category.amount / total;
    const percentage = portion * 100;
    const endAngle = currentAngle + portion * Math.PI * 2;
    const steps = Math.max(16, Math.ceil(portion * 100));

    const points: Array<[number, number]> = [[centerX, centerY]];

    for (let step = 0; step <= steps; step += 1) {
      const angle =
        currentAngle + ((endAngle - currentAngle) * step) / steps;

      points.push([
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius,
      ]);
    }

    doc.setFillColor(...CATEGORY_COLORS[index % CATEGORY_COLORS.length]);

    const [first, ...rest] = points;
    const vectors = rest.map((point, pointIndex) => {
      const previous = pointIndex === 0 ? first : rest[pointIndex - 1];
      return [point[0] - previous[0], point[1] - previous[1]] as [
        number,
        number,
      ];
    });

    doc.lines(vectors, first[0], first[1], [1, 1], "F", true);

    if (percentage >= 5) {
      const middleAngle = currentAngle + (endAngle - currentAngle) / 2;
      const labelRadius = radius * 0.73;
      const labelX = centerX + Math.cos(middleAngle) * labelRadius;
      const labelY = centerY + Math.sin(middleAngle) * labelRadius;

      doc.setTextColor(...COLORS.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(percentage >= 10 ? 7.8 : 6.5);
      doc.text(`${Math.round(percentage)} %`, labelX, labelY + 1, {
        align: "center",
      });
    }

    currentAngle = endAngle;
  }

  doc.setFillColor(...COLORS.cream);
  doc.circle(centerX, centerY, radius * 0.48, "F");
};

const drawCategoryLegend = (
  doc: jsPDF,
  categories: CategoryTotal[],
  x: number,
  startY: number,
): void => {
  const total = categories.reduce((sum, category) => sum + category.amount, 0);

  for (
    const [index, category] of
    categories
      .slice(0, 5)
      .entries()
  ) {
    const y = startY + index * 7;

    doc.setFillColor(...CATEGORY_COLORS[index % CATEGORY_COLORS.length]);
    doc.circle(x, y - 1, 1.8, "F");

    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text(category.name, x + 4, y);

    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${Math.round(
        getPercentage(
          category.amount,
          total,
        ),
      )} %`,
      x + 33,
      y,
      {
        align: "right",
      },
    );
  }
};

/* =========================================================
   HEADER PAGE 1
   ========================================================= */

const drawFirstPageHeader = async (
  doc: jsPDF,
  tripTitle: string,
  destination: string | null | undefined,
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  tripImageUrl: string | null | undefined,
): Promise<number> => {
  await drawLogo(doc, PAGE_MARGIN, 11);

  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`Document généré le ${formatDate(new Date().toISOString())}`, 196, 17, {
    align: "right",
  });

  const imageX = 100;
  const imageY = 28;
  const imageWidth = 96;
  const imageHeight = 58;

  if (tripImageUrl) {
    const rawImage = await loadImageAsDataUrl(tripImageUrl);

    if (rawImage) {
      const cover = await createRoundedCoverImage(rawImage);
      if (cover) {
        doc.addImage(cover, "JPEG", imageX, imageY, imageWidth, imageHeight);
      }
    }
  }

  doc.setTextColor(...COLORS.primaryDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text("Budget du voyage", PAGE_MARGIN, 43);

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(PAGE_MARGIN, 50, 11, 1.5, 0.7, 0.7, "F");

  doc.setFontSize(14.5);
  doc.text(tripTitle, PAGE_MARGIN, 65);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);

  let infoY = 74;

  if (destination) {
    doc.setTextColor(...COLORS.primaryDark);
    doc.setFont("helvetica", "bold");
    doc.text("Destination", PAGE_MARGIN, infoY);

    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizePdfText(destination), PAGE_MARGIN + 22, infoY);
    infoY += 7;
  }

  doc.setTextColor(...COLORS.primaryDark);
  doc.setFont("helvetica", "bold");
  doc.text("Dates", PAGE_MARGIN, infoY);

  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${formatDate(startAt)} - ${formatDate(endAt)}`,
    PAGE_MARGIN + 22,
    infoY,
  );

  return 102;
};

/* =========================================================
   PAGE RELATIONS / REMBOURSEMENTS
   ========================================================= */

const drawThankYouCard = (
  doc: jsPDF,
  y: number,
): void => {
  drawCard(
    doc,
    PAGE_MARGIN,
    y,
    110,
    20,
    COLORS.primaryVerySoft,
  );

  doc.setTextColor(
    ...COLORS.primaryDark,
  );
  doc.setFont(
    "helvetica",
    "bold",
  );
  doc.setFontSize(8.5);

  doc.text(
    "Merci à tous pour votre participation !",
    PAGE_MARGIN + 8,
    y + 8,
  );

  doc.setTextColor(
    ...COLORS.text,
  );
  doc.setFont(
    "helvetica",
    "normal",
  );
  doc.setFontSize(7.5);

  doc.text(
    "Bon voyage et profitez à fond !",
    PAGE_MARGIN + 8,
    y + 14,
  );
};

/* =========================================================
   FOOTERS
   ========================================================= */

const addFooters = (doc: jsPDF): void => {
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(PAGE_MARGIN, pageHeight - 14, pageWidth - PAGE_MARGIN, pageHeight - 14);

    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.text("Document généré par TripTogether", PAGE_MARGIN, pageHeight - FOOTER_Y_OFFSET);
    doc.text(`Page ${page}/${totalPages}`, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_Y_OFFSET, {
      align: "right",
    });
  }
};

/* =========================================================
   EXPORT PRINCIPAL
   ========================================================= */

export const exportBudgetToPdf = async ({
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
  members,
  tripImageUrl,
}: ExportBudgetToPdfParams): Promise<void> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdf = doc as JsPdfWithAutoTable;
  const pageHeight = doc.internal.pageSize.getHeight();

  drawPageBackground(doc);

  /* =====================================================
     PAGE 1 : HEADER + KPI + CATÉGORIES + DÉPENSES
     ===================================================== */

  let currentY = await drawFirstPageHeader(
    doc,
    tripTitle,
    destination,
    startAt,
    endAt,
    tripImageUrl,
  );

  currentY = drawSectionTitle(doc, "Récapitulatif", currentY);
  currentY = drawSummary(doc, currentY, currency, total, paid, balance);

  const categoryTotals = buildCategoryTotals(expenses);
  const categoryTotalAmount = categoryTotals.reduce(
    (sum, category) => sum + category.amount,
    0,
  );

  currentY = drawSectionTitle(doc, "Dépenses par catégorie", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: {
      left: PAGE_MARGIN,
      right: 105,
    },
    tableWidth: 87,
    head: [["Catégorie", "Montant", "Répartition"]],
    body: [
      ...categoryTotals.map((category) => [
        category.name,
        formatCurrency(category.amount, currency),
        `${Math.round(getPercentage(category.amount, categoryTotalAmount))} %`,
      ]),
      ["TOTAL", formatCurrency(categoryTotalAmount, currency), "100 %"],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.2,
      cellPadding: 2.2,
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.12,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      lineColor: COLORS.primary,
      minCellHeight: 7,
    },
    alternateRowStyles: {
      fillColor: COLORS.softGrey,
    },
    columnStyles: {
      0: { cellWidth: 33 },
      1: { cellWidth: 32, halign: "right" },
      2: { cellWidth: 22, halign: "right" },
    },
    didParseCell: (data) => {
      if (
        data.section === "body" &&
        data.row.index === categoryTotals.length
      ) {
        data.cell.styles.fillColor = COLORS.primarySoft;
        data.cell.styles.textColor = COLORS.primaryDark;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const categoryTableEnd = pdf.lastAutoTable?.finalY ?? currentY;

  /*
   * Donut + légende légèrement décalés vers la gauche
   * pour mieux équilibrer la section.
   */
  const chartCenterX = 132;
  const chartCenterY =
    currentY + 23;

  drawDonutChart(
    doc,
    categoryTotals,
    chartCenterX,
    chartCenterY,
    17.5,
  );

  drawCategoryLegend(
    doc,
    categoryTotals,
    162,
    currentY + 11,
  );

  currentY = Math.max(categoryTableEnd, currentY + 48) + 9;
  currentY = drawSectionTitle(doc, "Détail des dépenses", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: {
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
      bottom: 22,
    },
    head: [["Date", "Dépense", "Catégorie", "Payé par", "Montant"]],
    body: expenses.map((expense) => {
      const amount = getExpenseAmount(expense);
      const expenseCurrency = expense.converted_currency || currency;

      return [
        formatDate(expense.date || expense.created_at),
        sanitizePdfText(expense.title),
        sanitizePdfText(expense.category_name || "Autre"),
        sanitizePdfText(expense.paid_by_name || "Participant"),
        formatCurrency(amount, expenseCurrency),
      ];
    }),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.2,
      cellPadding: 2.3,
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.1,
      overflow: "linebreak",
      minCellHeight: 7,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      lineColor: COLORS.primary,
      minCellHeight: 8,
    },
    alternateRowStyles: {
      fillColor: COLORS.softGrey,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 47 },
      2: { cellWidth: 36 },
      3: { cellWidth: 32 },
      4: { cellWidth: 42, halign: "right" },
    },

    /*
     * Lorsqu'autoTable poursuit les dépenses sur une nouvelle page,
     * on applique le même fond que sur la première page avant
     * de dessiner les lignes du tableau.
     */
    willDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawPageBackground(doc);
      }
    },
  });

  /*
   * autoTable peut avoir créé automatiquement une page 2.
   * On récupère donc la dernière page et la position finale du tableau,
   * puis on continue directement en dessous au lieu de créer
   * systématiquement une troisième page.
   */
  const detailLastPage =
    doc.getNumberOfPages();

  doc.setPage(
    detailLastPage,
  );

  currentY =
    (pdf.lastAutoTable?.finalY ??
      currentY) + 12;

  /* =====================================================
     SOLDES + REMBOURSEMENTS
     ===================================================== */

  const confirmedReimbursements =
    reimbursements.filter(
      (reimbursement) =>
        reimbursement.status ===
        "confirmed",
    );

  const getMemberFirstname = (
    userId: number,
  ): string => {
    const member =
      members.find(
        (currentMember) =>
          Number(
            currentMember.id,
          ) ===
          Number(userId),
      );

    return sanitizePdfText(
      member?.firstname ||
        "Participant",
    );
  };

  const hasSharedBudgetContent =
    balances.length > 0 ||
    confirmedReimbursements.length >
      0;

  if (hasSharedBudgetContent) {
    /*
     * Si le tableau des dépenses tient entièrement page 1,
     * on commence le budget partagé sur une page 2.
     *
     * S'il a déjà débordé sur une page 2, on reste sur cette
     * même page et on continue juste sous les dernières dépenses.
     */
    if (detailLastPage === 1) {
      doc.addPage();
      drawPageBackground(doc);
      currentY = 22;
    }

    /*
     * Titre de la seconde partie du PDF.
     * Il est placé sous la suite éventuelle du tableau des dépenses
     * afin de conserver un PDF compact sur 2 pages.
     */
    doc.setTextColor(
      ...COLORS.primaryDark,
    );
    doc.setFont(
      "helvetica",
      "bold",
    );
    doc.setFontSize(16);

    doc.text(
      "Budget partagé",
      PAGE_MARGIN,
      currentY,
    );

    doc.setDrawColor(
      ...COLORS.border,
    );
    doc.setLineWidth(0.25);
    doc.line(
      PAGE_MARGIN,
      currentY + 6,
      196,
      currentY + 6,
    );

    currentY += 18;

    if (balances.length > 0) {
      /*
       * On garde suffisamment de place pour le titre + le tableau.
       * Dans le cas contraire, on crée seulement alors une page
       * supplémentaire.
       */
      if (
        currentY >
        pageHeight - 65
      ) {
        doc.addPage();
        drawPageBackground(doc);
        currentY = 22;
      }

      currentY =
        drawSectionTitle(
          doc,
          "Mes soldes avec les participants",
          currentY,
        );

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: PAGE_MARGIN,
          right: PAGE_MARGIN,
          bottom: 22,
        },

        head: [
          [
            "Participant",
            "À recevoir",
            "À rembourser",
            "Solde net",
          ],
        ],

        body: balances.map(
          (participant) => [
            sanitizePdfText(
              participant.firstname,
            ),

            formatCurrency(
              participant.amountToReceive,
              currency,
            ),

            formatCurrency(
              participant.amountToPay,
              currency,
            ),

            formatCurrency(
              participant.netBalance,
              currency,
            ),
          ],
        ),

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 7.7,
          cellPadding: 2.7,
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.1,
          minCellHeight: 8,
        },

        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: "bold",
          lineColor: COLORS.primary,
        },

        alternateRowStyles: {
          fillColor: COLORS.softGrey,
        },

        columnStyles: {
          1: {
            halign: "right",
          },

          2: {
            halign: "right",
          },

          3: {
            halign: "right",
            fontStyle: "bold",
            textColor:
              COLORS.primaryDark,
          },
        },

      });

      currentY =
        (pdf.lastAutoTable
          ?.finalY ??
          currentY) + 13;
    }

    if (
      confirmedReimbursements.length >
      0
    ) {
      if (
        currentY >
        pageHeight - 80
      ) {
        doc.addPage();
        drawPageBackground(doc);
        currentY = 22;
      }

      currentY =
        drawSectionTitle(
          doc,
          "Remboursements confirmés",
          currentY,
        );

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: PAGE_MARGIN,
          right: PAGE_MARGIN,
          bottom: 22,
        },

        head: [
          [
            "Émetteur",
            "Bénéficiaire",
            "Montant",
            "Statut",
          ],
        ],

        body:
          confirmedReimbursements.map(
            (reimbursement) => [
              getMemberFirstname(
                reimbursement.from_user_id,
              ),

              getMemberFirstname(
                reimbursement.to_user_id,
              ),

              formatCurrency(
                Number(
                  reimbursement.amount ||
                    0,
                ),
                reimbursement.currency ||
                  currency,
              ),

              "Confirmé",
            ],
          ),

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 7.7,
          cellPadding: 2.7,
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.1,
          minCellHeight: 8,
        },

        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: "bold",
          lineColor: COLORS.primary,
        },

        alternateRowStyles: {
          fillColor: COLORS.softGrey,
        },

        columnStyles: {
          2: {
            halign: "right",
          },

          3: {
            halign: "center",
            fontStyle: "bold",
            textColor:
              COLORS.primaryDark,
            fillColor:
              COLORS.primarySoft,
          },
        },

      });

      currentY =
        (pdf.lastAutoTable
          ?.finalY ??
          currentY) + 14;
    }

    if (
      currentY >
      pageHeight - 48
    ) {
      doc.addPage();
      drawPageBackground(doc);
      currentY = 22;
    }

    drawThankYouCard(
      doc,
      currentY,
    );
  } else {
    /*
     * Aucun solde ni remboursement : on place simplement
     * la carte de remerciement après le détail des dépenses,
     * tant qu'elle tient correctement sur la dernière page.
     */
    if (
      currentY >
      pageHeight - 48
    ) {
      doc.addPage();
      drawPageBackground(doc);
      currentY = 22;
    }

    drawThankYouCard(
      doc,
      currentY,
    );
  }

  /* =====================================================
     FOOTERS
     ===================================================== */

  addFooters(doc);

  /* =====================================================
     NOM DU FICHIER
     ===================================================== */

  const safeTitle = tripTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  doc.save(`triptogether-budget-${safeTitle || "voyage"}.pdf`);
};