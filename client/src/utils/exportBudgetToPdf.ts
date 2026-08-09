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

type PdfColor = [
  number,
  number,
  number,
];

/* =========================================================
   COULEURS TRIPTOGETHER
   ========================================================= */

const COLORS: Record<
  string,
  PdfColor
> = {
  darkGreen: [
    31,
    89,
    46,
  ],
  green: [
    47,
    110,
    62,
  ],
  lightGreen: [
    232,
    243,
    232,
  ],

  cream: [
    252,
    250,
    246,
  ],
  white: [
    255,
    255,
    255,
  ],

  text: [
    42,
    47,
    44,
  ],
  muted: [
    103,
    110,
    105,
  ],

  border: [
    223,
    226,
    219,
  ],

  blue: [
    107,
    164,
    220,
  ],
  softBlue: [
    225,
    238,
    250,
  ],

  yellow: [
    242,
    190,
    73,
  ],
  softYellow: [
    253,
    243,
    211,
  ],

  purple: [
    165,
    132,
    214,
  ],
  softPurple: [
    239,
    231,
    248,
  ],

  softGrey: [
    246,
    246,
    244,
  ],
};

/* =========================================================
   FORMATAGE
   ========================================================= */

const formatCurrency = (
  amount: number,
  currency: string,
): string => {
  try {
    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency,
      },
    ).format(amount);
  } catch {
    return `${amount.toFixed(
      2,
    )} ${currency}`;
  }
};

const formatDate = (
  value?: string | null,
): string => {
  if (!value) {
    return "-";
  }

  const dateValue =
    value.slice(
      0,
      10,
    );

  const [
    year,
    month,
    day,
  ] = dateValue
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  );
};

const getExpenseAmount = (
  expense: PdfExpense,
): number => {
  return Number(
    expense.converted_amount ??
      expense.amount ??
      expense.original_amount ??
      0,
  );
};

/* =========================================================
   IMAGE DISTANTE → DATA URL
   ========================================================= */

const loadImageAsDataUrl = async (
  imageUrl: string,
): Promise<
  string | null
> => {
  try {
    const response =
      await fetch(
        imageUrl,
      );

    if (!response.ok) {
      return null;
    }

    const blob =
      await response.blob();

    return await new Promise(
      (resolve) => {
        const reader =
          new FileReader();

        reader.onloadend =
          () => {
            resolve(
              typeof reader.result ===
                "string"
                ? reader.result
                : null,
            );
          };

        reader.onerror =
          () => {
            resolve(
              null,
            );
          };

        reader.readAsDataURL(
          blob,
        );
      },
    );
  } catch (error) {
    console.error(
      "Impossible de charger l'image du voyage :",
      error,
    );

    return null;
  }
};

/* =========================================================
   TITRES DE SECTION
   ========================================================= */

const drawSectionTitle = (
  doc: jsPDF,
  title: string,
  y: number,
): number => {
  doc.setTextColor(
    ...COLORS.darkGreen,
  );

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(
    14,
  );

  doc.text(
    title,
    14,
    y,
  );

  return y + 7;
};

/* =========================================================
   CARTES ARRONDIES
   ========================================================= */

const drawCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
): void => {
  doc.setFillColor(
    ...COLORS.white,
  );

  doc.setDrawColor(
    ...COLORS.border,
  );

  doc.roundedRect(
    x,
    y,
    width,
    height,
    4,
    4,
    "FD",
  );
};

/* =========================================================
   RÉCAPITULATIF
   ========================================================= */

const drawSummary = (
  doc: jsPDF,
  startY: number,
  currency: string,
  total: number,
  paid: number,
  balance: number,
): number => {
  const x = 14;
  const width = 182;
  const height = 28;

  drawCard(
    doc,
    x,
    startY,
    width,
    height,
  );

  const columnWidth =
    width / 3;

  const summaryItems = [
    {
      label:
        "Total des dépenses",
      amount:
        formatCurrency(
          total,
          currency,
        ),
      background:
        COLORS.lightGreen,
      icon:
        "€",
    },
    {
      label:
        "J'ai payé",
      amount:
        formatCurrency(
          paid,
          currency,
        ),
      background:
        COLORS.softYellow,
      icon:
        "€",
    },
    {
      label:
        "Solde net",
      amount:
        formatCurrency(
          balance,
          currency,
        ),
      background:
        COLORS.softBlue,
      icon:
        "=",
    },
  ];

  summaryItems.forEach(
    (
      item,
      index,
    ) => {
      const columnX =
        x +
        index *
          columnWidth;

      if (index > 0) {
        doc.setDrawColor(
          ...COLORS.border,
        );

        doc.line(
          columnX,
          startY + 5,
          columnX,
          startY +
            height -
            5,
        );
      }

      doc.setFillColor(
        ...item.background,
      );

      doc.circle(
        columnX + 10,
        startY + 14,
        6,
        "F",
      );

      doc.setTextColor(
        ...COLORS.darkGreen,
      );

      doc.setFont(
        "helvetica",
        "bold",
      );

      doc.setFontSize(
        9,
      );

      doc.text(
        item.icon,
        columnX + 10,
        startY + 15.2,
        {
          align:
            "center",
        },
      );

      doc.setTextColor(
        ...COLORS.text,
      );

      doc.setFont(
        "helvetica",
        "normal",
      );

      doc.setFontSize(
        8.5,
      );

      doc.text(
        item.label,
        columnX + 20,
        startY + 10,
      );

      doc.setTextColor(
        ...COLORS.darkGreen,
      );

      doc.setFont(
        "helvetica",
        "bold",
      );

      doc.setFontSize(
        13,
      );

      doc.text(
        item.amount,
        columnX + 20,
        startY + 20,
      );
    },
  );

  return (
    startY +
    height +
    12
  );
};

/* =========================================================
   TOTAL PAR CATÉGORIE
   ========================================================= */

const buildCategoryTotals = (
  expenses: PdfExpense[],
): CategoryTotal[] => {
  const totals =
    new Map<
      string,
      number
    >();

  for (
    const expense of expenses
  ) {
    const category =
      expense.category_name ||
      "Autre";

    const amount =
      getExpenseAmount(
        expense,
      );

    totals.set(
      category,
      (
        totals.get(
          category,
        ) || 0
      ) + amount,
    );
  }

  return Array.from(
    totals.entries(),
  )
    .map(
      ([
        name,
        amount,
      ]) => ({
        name,
        amount,
      }),
    )
    .sort(
      (
        categoryA,
        categoryB,
      ) =>
        categoryB.amount -
        categoryA.amount,
    );
};

/* =========================================================
   GRAPHIQUE EN ANNEAU
   ========================================================= */

const drawDonutChart = (
  doc: jsPDF,
  categories: CategoryTotal[],
  centerX: number,
  centerY: number,
  radius: number,
): void => {
  const total = categories.reduce(
    (sum, category) =>
      sum + category.amount,
    0,
  );

  if (total <= 0) {
    return;
  }

  const palette: PdfColor[] = [
    COLORS.blue,
    [123, 175, 116],
    COLORS.yellow,
    COLORS.purple,
    [205, 141, 93],
  ];

  let currentAngle =
    -Math.PI / 2;

  categories.forEach(
    (
      category,
      index,
    ) => {
      const portion =
        category.amount / total;

      const percentage =
        portion * 100;

      const endAngle =
        currentAngle +
        portion *
          Math.PI *
          2;

      const steps =
        Math.max(
          12,
          Math.ceil(
            portion * 80,
          ),
        );

      const points: Array<
        [number, number]
      > = [];

      points.push([
        centerX,
        centerY,
      ]);

      for (
        let indexStep = 0;
        indexStep <= steps;
        indexStep += 1
      ) {
        const angle =
          currentAngle +
          ((endAngle -
            currentAngle) *
            indexStep) /
            steps;

        points.push([
          centerX +
            Math.cos(
              angle,
            ) *
              radius,
          centerY +
            Math.sin(
              angle,
            ) *
              radius,
        ]);
      }

      doc.setFillColor(
        ...palette[
          index %
            palette.length
        ],
      );

      const [
        first,
        ...rest
      ] = points;

      const vectors =
        rest.map(
          (
            point,
            pointIndex,
          ) => {
            const previous =
              pointIndex === 0
                ? first
                : rest[
                    pointIndex -
                      1
                  ];

            return [
              point[0] -
                previous[0],
              point[1] -
                previous[1],
            ] as [
              number,
              number,
            ];
          },
        );

      doc.lines(
        vectors,
        first[0],
        first[1],
        [1, 1],
        "F",
        true,
      );

      /*
       * Position du pourcentage
       * au milieu de chaque portion.
       */
      const middleAngle =
        currentAngle +
        (endAngle -
          currentAngle) /
          2;

      const labelRadius =
        radius * 0.73;

      const labelX =
        centerX +
        Math.cos(
          middleAngle,
        ) *
          labelRadius;

      const labelY =
        centerY +
        Math.sin(
          middleAngle,
        ) *
          labelRadius;

      /*
       * On affiche le pourcentage
       * uniquement si la portion
       * est suffisamment grande.
       *
       * Cela évite que les textes
       * se chevauchent pour une
       * catégorie représentant 1 %.
       */
      if (percentage >= 5) {
        doc.setTextColor(
          ...COLORS.white,
        );

        doc.setFont(
          "helvetica",
          "bold",
        );

        doc.setFontSize(
          percentage >= 10
            ? 8
            : 6.5,
        );

        doc.text(
          `${Math.round(
            percentage,
          )} %`,
          labelX,
          labelY + 1,
          {
            align:
              "center",
          },
        );
      }

      currentAngle =
        endAngle;
    },
  );

  /*
   * Trou central de l'anneau.
   */
  doc.setFillColor(
    ...COLORS.cream,
  );

  doc.circle(
    centerX,
    centerY,
    radius * 0.47,
    "F",
  );
};

/* =========================================================
   PIEDS DE PAGE
   ========================================================= */

const addFooters = (
  doc: jsPDF,
): void => {
  const totalPages =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= totalPages;
    page += 1
  ) {
    doc.setPage(
      page,
    );

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    doc.setTextColor(
      ...COLORS.muted,
    );

    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setFontSize(
      7.5,
    );

    doc.text(
      "Document généré par TripTogether",
      14,
      pageHeight - 8,
    );

    doc.text(
      `Page ${page}/${totalPages}`,
      pageWidth - 14,
      pageHeight - 8,
      {
        align:
          "right",
      },
    );
  }
};

/* =========================================================
   EXPORT PRINCIPAL
   ========================================================= */

export const exportBudgetToPdf =
  async ({
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
    const doc =
      new jsPDF({
        orientation:
          "portrait",
        unit:
          "mm",
        format:
          "a4",
      });

    const pdf =
      doc as JsPdfWithAutoTable;

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    /* =====================================================
       FOND
       ===================================================== */

    doc.setFillColor(
      ...COLORS.cream,
    );

    doc.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F",
    );

    /* =====================================================
       HEADER
       ===================================================== */

    let tripImage:
      | string
      | null = null;

    if (tripImageUrl) {
      tripImage =
        await loadImageAsDataUrl(
          tripImageUrl,
        );
    }

    if (tripImage) {
      doc.addImage(
        tripImage,
        "JPEG",
        104,
        0,
        106,
        69,
      );
    }

    doc.setTextColor(
      ...COLORS.darkGreen,
    );

    doc.setFont(
      "helvetica",
      "bold",
    );

    doc.setFontSize(
      14,
    );

    doc.text(
      "TripTogether",
      14,
      16,
    );

    doc.setFontSize(
      26,
    );

    doc.text(
      "Budget du voyage",
      14,
      36,
    );

    doc.setFillColor(
      ...COLORS.green,
    );

    doc.roundedRect(
      14,
      43,
      14,
      1.5,
      0.7,
      0.7,
      "F",
    );

    doc.setFontSize(
      16,
    );

    doc.text(
      tripTitle,
      14,
      57,
    );

    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setTextColor(
      ...COLORS.text,
    );

    doc.setFontSize(
      10,
    );

    if (destination) {
      doc.text(
        `• ${destination}`,
        14,
        68,
      );
    }

    doc.text(
      `${formatDate(
        startAt,
      )} - ${formatDate(
        endAt,
      )}`,
      14,
      76,
    );

    let currentY = 91;

    /* =====================================================
       RÉCAPITULATIF
       ===================================================== */

    currentY =
      drawSectionTitle(
        doc,
        "Récapitulatif",
        currentY,
      );

    currentY =
      drawSummary(
        doc,
        currentY,
        currency,
        total,
        paid,
        balance,
      );

    /* =====================================================
       DÉPENSES PAR CATÉGORIE
       ===================================================== */

    const categoryTotals =
      buildCategoryTotals(
        expenses,
      );

    currentY =
      drawSectionTitle(
        doc,
        "Dépenses par catégorie",
        currentY,
      );

    autoTable(
      doc,
      {
        startY:
          currentY,

        margin: {
          left: 14,
          right: 108,
        },

        head: [
          [
            "Catégorie",
            "Montant",
          ],
        ],

        body: [
          ...categoryTotals.map(
            (
              category,
            ) => [
              category.name,
              formatCurrency(
                category.amount,
                currency,
              ),
            ],
          ),

          [
            "TOTAL",
            formatCurrency(
              total,
              currency,
            ),
          ],
        ],

        theme:
          "grid",

        styles: {
          fontSize:
            8.5,
          cellPadding:
            3,
          textColor:
            COLORS.text,
          lineColor:
            COLORS.border,
          lineWidth:
            0.15,
        },

        headStyles: {
          fillColor:
            COLORS.darkGreen,
          textColor:
            COLORS.white,
          fontStyle:
            "bold",
        },

        alternateRowStyles: {
          fillColor:
            COLORS.softGrey,
        },

        didParseCell:
          (data) => {
            if (
              data.section ===
                "body" &&
              data.row.index ===
                categoryTotals.length
            ) {
              data.cell.styles.fillColor =
                COLORS.lightGreen;

              data.cell.styles.fontStyle =
                "bold";

              data.cell.styles.textColor =
                COLORS.darkGreen;
            }
          },
      },
    );

    const categoryTableEnd =
      pdf.lastAutoTable
        ?.finalY ??
      currentY;

    const chartCenterX =
      146;

    const chartCenterY =
      currentY +
      29;

    drawDonutChart(
      doc,
      categoryTotals,
      chartCenterX,
      chartCenterY,
      20,
    );

    const palette: PdfColor[] =
      [
        COLORS.blue,
        [
          123,
          175,
          116,
        ],
        COLORS.yellow,
        COLORS.purple,
        [
          205,
          141,
          93,
        ],
      ];

    categoryTotals
      .slice(
        0,
        5,
      )
      .forEach(
        (
          category,
          index,
        ) => {
          const legendY =
            currentY +
            12 +
            index *
              7;

          doc.setFillColor(
            ...palette[
              index %
                palette.length
            ],
          );

          doc.circle(
            174,
            legendY - 1,
            2,
            "F",
          );

          doc.setTextColor(
            ...COLORS.text,
          );

          doc.setFont(
            "helvetica",
            "normal",
          );

          doc.setFontSize(
            8,
          );

          doc.text(
            category.name,
            179,
            legendY,
          );
        },
      );

    currentY =
      Math.max(
        categoryTableEnd,
        currentY +
          55,
      ) + 10;

    /* =====================================================
       DÉTAIL DES DÉPENSES
       ===================================================== */

    currentY =
      drawSectionTitle(
        doc,
        "Détail des dépenses",
        currentY,
      );

    autoTable(
      doc,
      {
        startY:
          currentY,

        margin: {
          left: 14,
          right: 14,
          bottom: 20,
        },

        head: [
          [
            "Date",
            "Dépense",
            "Catégorie",
            "Payé par",
            "Montant",
          ],
        ],

        body:
          expenses.map(
            (
              expense,
            ) => {
              const amount =
                getExpenseAmount(
                  expense,
                );

              const expenseCurrency =
                expense.converted_currency ||
                currency;

              return [
                formatDate(
                  expense.date ||
                    expense.created_at,
                ),

                expense.title,

                expense.category_name ||
                  "Autre",

                expense.paid_by_name ||
                  "Participant",

                formatCurrency(
                  amount,
                  expenseCurrency,
                ),
              ];
            },
          ),

        theme:
          "grid",

        styles: {
          fontSize:
            7.8,
          cellPadding:
            2.5,
          textColor:
            COLORS.text,
          lineColor:
            COLORS.border,
          lineWidth:
            0.1,
        },

        headStyles: {
          fillColor:
            COLORS.darkGreen,
          textColor:
            COLORS.white,
          fontStyle:
            "bold",
        },

        alternateRowStyles: {
          fillColor:
            COLORS.softGrey,
        },

        columnStyles: {
          0: {
            cellWidth:
              25,
          },

          1: {
            cellWidth:
              48,
          },

          2: {
            cellWidth:
              38,
          },

          3: {
            cellWidth:
              34,
          },

          4: {
            cellWidth:
              35,
            halign:
              "right",
          },
        },
      },
    );

    currentY =
      (
        pdf.lastAutoTable
          ?.finalY ??
        currentY
      ) + 10;

    /* =====================================================
       SOLDES ENTRE PARTICIPANTS
       ===================================================== */

    if (
      balances.length >
      0
    ) {
      const currentPageHeight =
        doc.internal.pageSize.getHeight();

      if (
        currentY >
        currentPageHeight -
          65
      ) {
        doc.addPage();

        doc.setFillColor(
          ...COLORS.cream,
        );

        doc.rect(
          0,
          0,
          pageWidth,
          currentPageHeight,
          "F",
        );

        currentY = 20;
      }

      currentY =
        drawSectionTitle(
          doc,
          "Mes soldes avec les participants",
          currentY,
        );

      autoTable(
        doc,
        {
          startY:
            currentY,

          margin: {
            left: 14,
            right: 14,
          },

          head: [
            [
              "Participant",
              "À recevoir",
              "À rembourser",
              "Solde net",
            ],
          ],

          body:
            balances.map(
              (
                participant,
              ) => [
                participant.firstname,

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

          theme:
            "grid",

          styles: {
            fontSize:
              8,
            cellPadding:
              2.5,
            lineColor:
              COLORS.border,
            lineWidth:
              0.1,
          },

          headStyles: {
            fillColor:
              COLORS.darkGreen,
            textColor:
              COLORS.white,
          },

          alternateRowStyles: {
            fillColor:
              COLORS.softGrey,
          },
        },
      );

      currentY =
        (
          pdf.lastAutoTable
            ?.finalY ??
          currentY
        ) + 10;
    }

    /* =====================================================
       REMBOURSEMENTS CONFIRMÉS
       ===================================================== */

    const confirmedReimbursements =
      reimbursements.filter(
        (
          reimbursement,
        ) =>
          reimbursement.status ===
          "confirmed",
      );

    const getMemberFirstname = (
      userId: number,
    ): string => {
      const member =
        members.find(
          (
            currentMember,
          ) =>
            Number(
              currentMember.id,
            ) ===
            Number(
              userId,
            ),
        );

      return (
        member?.firstname ||
        "Participant"
      );
    };

    if (
      confirmedReimbursements.length >
      0
    ) {
      const currentPageHeight =
        doc.internal.pageSize.getHeight();

      if (
        currentY >
        currentPageHeight -
          60
      ) {
        doc.addPage();

        doc.setFillColor(
          ...COLORS.cream,
        );

        doc.rect(
          0,
          0,
          pageWidth,
          currentPageHeight,
          "F",
        );

        currentY = 20;
      }

      currentY =
        drawSectionTitle(
          doc,
          "Remboursements confirmés",
          currentY,
        );

      autoTable(
        doc,
        {
          startY:
            currentY,

          margin: {
            left: 14,
            right: 14,
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
              (
                reimbursement,
              ) => [
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

          theme:
            "grid",

          styles: {
            fontSize:
              8,
            cellPadding:
              2.5,
            lineColor:
              COLORS.border,
            lineWidth:
              0.1,
          },

          headStyles: {
            fillColor:
              COLORS.darkGreen,
            textColor:
              COLORS.white,
          },

          alternateRowStyles: {
            fillColor:
              COLORS.softGrey,
          },
        },
      );
    }

    /* =====================================================
       MESSAGE FINAL
       ===================================================== */

    const lastPage =
      doc.getNumberOfPages();

    doc.setPage(
      lastPage,
    );

    const lastPageHeight =
      doc.internal.pageSize.getHeight();

    const thankYouY =
      lastPageHeight -
      27;

    doc.setFillColor(
      ...COLORS.lightGreen,
    );

    doc.setDrawColor(
      ...COLORS.border,
    );

    doc.roundedRect(
      14,
      thankYouY,
      96,
      14,
      3,
      3,
      "FD",
    );

    doc.setTextColor(
      ...COLORS.darkGreen,
    );

    doc.setFont(
      "helvetica",
      "bold",
    );

    doc.setFontSize(
      8,
    );

    doc.text(
      "Merci à tous pour votre participation !",
      19,
      thankYouY + 5,
    );

    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setTextColor(
      ...COLORS.text,
    );

    doc.text(
      "Bon voyage et profitez à fond !",
      19,
      thankYouY + 10,
    );

    /* =====================================================
       PIEDS DE PAGE
       ===================================================== */

    addFooters(
      doc,
    );

    /* =====================================================
       NOM DU FICHIER
       ===================================================== */

    const safeTitle =
      tripTitle
        .toLowerCase()
        .normalize(
          "NFD",
        )
        .replace(
          /\p{M}/gu,
          "",
        )
        .replace(
          /[^a-z0-9]+/g,
          "-",
        )
        .replace(
          /^-|-$/g,
          "",
        );

    doc.save(
      `triptogether-budget-${safeTitle || "voyage"}.pdf`,
    );
  };