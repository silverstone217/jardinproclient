import type {
  InvoiceDocumentBottleSize,
  InvoiceDocumentCurrency,
  InvoiceDocumentData,
  InvoiceDocumentPaymentMethod,
} from "./invoice";

// ============================================================
// FORMATAGE
// ============================================================

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAmount(
  amount: number,
  currency: InvoiceDocumentCurrency,
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  const fractionDigits = currency === "CDF" ? 0 : 2;

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeAmount);

  return `${formatted} ${currency}`;
}

function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBottleSizeLabel(size: InvoiceDocumentBottleSize): string {
  const labels: Record<InvoiceDocumentBottleSize, string> = {
    ML_200: "200 ml",
    ML_500: "500 ml",
  };

  return labels[size] ?? size;
}

function getPaymentMethodLabel(
  method: InvoiceDocumentPaymentMethod | null,
): string {
  if (!method) {
    return "Non précisé";
  }

  const labels: Partial<Record<InvoiceDocumentPaymentMethod, string>> = {
    CASH: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    CARD: "Carte bancaire",
    OTHER: "Autre",
  };

  return labels[method] ?? method;
}

// ============================================================
// HTML
// ============================================================

export function buildInvoiceHtml(invoice: InvoiceDocumentData): string {
  const currency = invoice.currency;

  // ==========================================================
  // ARTICLES
  // ==========================================================

  const itemsHtml =
    invoice.items.length > 0
      ? invoice.items
          .map((item) => {
            const itemCurrency = item.currency ?? currency;

            return `
              <tr>
                <td class="product-cell">
                  <div class="product-name">
                    ${escapeHtml(item.productName)}
                  </div>

                  <div class="product-size">
                    ${escapeHtml(getBottleSizeLabel(item.size))}
                  </div>
                </td>

                <td class="quantity-cell">
                  ${item.quantity}
                </td>

                <td class="amount-cell">
                  ${formatAmount(item.unitPrice, itemCurrency)}
                </td>

                <td class="amount-cell total-cell">
                  ${formatAmount(item.subtotal, itemCurrency)}
                </td>
              </tr>
            `;
          })
          .join("")
      : `
          <tr>
            <td
              colspan="4"
              class="empty-items"
            >
              Aucun article
            </td>
          </tr>
        `;

  // ==========================================================
  // REMISE
  // ==========================================================

  const discountHtml =
    invoice.discountAmount > 0
      ? `
          <div class="total-row discount-row">
            <span>Remise fidélité</span>

            <span>
              -${formatAmount(invoice.discountAmount, currency)}
            </span>
          </div>
        `
      : "";

  // ==========================================================
  // CLIENT
  // ==========================================================

  const customerName = invoice.customer.name?.trim();

  const customerPhone = invoice.customer.phone?.trim();

  const customerHtml =
    customerName || customerPhone
      ? `
          <section class="customer-section">
            <div class="section-label">
              FACTURÉ À
            </div>

            ${
              customerName
                ? `
                    <div class="customer-name">
                      ${escapeHtml(customerName)}
                    </div>
                  `
                : ""
            }

            ${
              customerPhone
                ? `
                    <div class="customer-phone">
                      ${escapeHtml(customerPhone)}
                    </div>
                  `
                : ""
            }
          </section>
        `
      : `
          <section class="customer-section">
            <div class="section-label">
              CLIENT
            </div>

            <div class="customer-name">
              Client de passage
            </div>
          </section>
        `;

  // ==========================================================
  // FIDÉLITÉ
  // ==========================================================

  const pointsEarned = Number.isFinite(invoice.loyalty.pointsEarned)
    ? invoice.loyalty.pointsEarned
    : 0;

  const pointsUsed = Number.isFinite(invoice.loyalty.pointsUsed)
    ? invoice.loyalty.pointsUsed
    : 0;

  const loyaltyHtml =
    pointsEarned > 0 || pointsUsed > 0
      ? `
          <section class="loyalty">
            <div class="loyalty-title">
              FIDÉLITÉ
            </div>

            ${
              pointsEarned > 0
                ? `
                    <div class="loyalty-row">
                      <span>
                        Points gagnés
                      </span>

                      <strong>
                        +${pointsEarned}
                      </strong>
                    </div>
                  `
                : ""
            }

            ${
              pointsUsed > 0
                ? `
                    <div class="loyalty-row">
                      <span>
                        Points utilisés
                      </span>

                      <strong>
                        -${pointsUsed}
                      </strong>
                    </div>
                  `
                : ""
            }
          </section>
        `
      : "";

  // ==========================================================
  // BOUTIQUE
  // ==========================================================

  const shopName = invoice.shopName.trim() || "Jardin Pro";

  const pointOfSaleName = invoice.pointOfSaleName.trim() || "Point de vente";

  // ==========================================================
  // HTML COMPLET
  // ==========================================================

  return `
    <!DOCTYPE html>

    <html lang="fr">

      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          Facture ${escapeHtml(invoice.invoiceNumber)}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
          }

          body {
            background: #ffffff;
            color: #333333;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size: 12px;
            line-height: 1.5;

            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice {
            width: 100%;
            max-width: 780px;

            margin: 0 auto;

            padding: 34px;

            background: #ffffff;
          }

          /* ==================================================
             BRAND
             ================================================== */

          .brand {
            padding-bottom: 20px;

            border-bottom:
              3px solid #2D5A27;
          }

          .shop-name {
            margin: 0;

            color: #2D5A27;

            font-size: 27px;
            font-weight: 800;

            letter-spacing: 1.2px;
            line-height: 1.2;

            overflow-wrap: anywhere;
          }

          .pos-name {
            margin-top: 7px;

            color: #333333;

            font-size: 15px;
            font-weight: 700;

            overflow-wrap: anywhere;
          }

          .shop-details {
            margin-top: 5px;

            color: #777777;

            font-size: 11px;

            overflow-wrap: anywhere;
          }

          /* ==================================================
             FACTURE HEADER
             ================================================== */

          .invoice-heading {
            display: flex;

            justify-content:
              space-between;

            align-items:
              flex-start;

            gap: 20px;

            margin: 24px 0;
          }

          .invoice-title {
            margin: 0;

            color: #333333;

            font-size: 22px;
            font-weight: 800;

            letter-spacing: 0.8px;
          }

          .invoice-number {
            margin-top: 5px;

            font-size: 12px;
            font-weight: 700;

            overflow-wrap: anywhere;
          }

          .invoice-date {
            margin-top: 5px;

            color: #777777;

            font-size: 11px;
          }

          /* ==================================================
             CLIENT
             ================================================== */

          .customer-section {
            margin-bottom: 24px;

            padding: 14px 16px;

            border:
              1px solid #E8E8E5;

            border-radius: 8px;

            background: #FAFAF8;

            overflow-wrap: anywhere;
          }

          .section-label {
            margin-bottom: 5px;

            color: #777777;

            font-size: 9px;
            font-weight: 700;

            letter-spacing: 1px;
          }

          .customer-name {
            font-size: 13px;
            font-weight: 700;
          }

          .customer-phone {
            margin-top: 2px;

            color: #666666;

            font-size: 11px;
          }

          /* ==================================================
             ARTICLES
             ================================================== */

          .items-table {
            width: 100%;

            border-collapse:
              collapse;

            margin-top: 8px;
          }

          .items-table thead {
            display:
              table-header-group;
          }

          .items-table th {
            padding: 10px 7px;

            background: #2D5A27;
            color: #ffffff;

            font-size: 9px;
            font-weight: 700;

            letter-spacing: 0.4px;

            text-align: left;
          }

          .items-table th:first-child {
            border-radius:
              5px 0 0 0;
          }

          .items-table th:last-child {
            border-radius:
              0 5px 0 0;
          }

          .items-table td {
            padding: 12px 7px;

            border-bottom:
              1px solid #EEEEEA;

            vertical-align:
              top;
          }

          .product-name {
            font-weight: 700;

            overflow-wrap:
              anywhere;
          }

          .product-size {
            margin-top: 3px;

            color: #888888;

            font-size: 10px;
          }

          .quantity-cell {
            width: 45px;

            text-align:
              center;

            white-space:
              nowrap;
          }

          .amount-cell {
            text-align:
              right;

            white-space:
              nowrap;
          }

          .total-cell {
            font-weight: 700;
          }

          .empty-items {
            padding: 20px !important;

            color: #888888;

            text-align:
              center;
          }

          /* ==================================================
             TOTALS
             ================================================== */

          .summary {
            width: 100%;

            max-width: 340px;

            margin:
              22px 0 0 auto;
          }

          .total-row {
            display: flex;

            justify-content:
              space-between;

            gap: 16px;

            padding: 6px 0;

            font-size: 11px;
          }

          .total-row span:last-child {
            text-align:
              right;

            white-space:
              nowrap;
          }

          .discount-row {
            color: #2D5A27;
          }

          .grand-total {
            display: flex;

            justify-content:
              space-between;

            gap: 16px;

            margin-top: 8px;

            padding:
              13px 14px;

            border-radius: 6px;

            background: #2D5A27;

            color: #ffffff;

            font-size: 15px;
            font-weight: 800;
          }

          .grand-total span:last-child {
            text-align:
              right;

            white-space:
              nowrap;
          }

          /* ==================================================
             FIDÉLITÉ
             ================================================== */

          .loyalty {
            margin-top: 18px;

            padding:
              12px 14px;

            border:
              1px solid #DDE9D9;

            border-radius: 7px;

            background: #EDF4EB;
          }

          .loyalty-title {
            margin-bottom: 7px;

            color: #2D5A27;

            font-size: 9px;
            font-weight: 700;

            letter-spacing: 1px;
          }

          .loyalty-row {
            display: flex;

            justify-content:
              space-between;

            gap: 16px;

            padding: 3px 0;

            color: #555555;

            font-size: 10px;
          }

          .loyalty-row strong {
            color: #2D5A27;
          }

          /* ==================================================
             PAIEMENT
             ================================================== */

          .payment {
            margin-top: 22px;

            padding-top: 13px;

            border-top:
              1px solid #E8E8E5;

            font-size: 11px;
          }

          .payment strong {
            color: #333333;
          }

          /* ==================================================
             FOOTER
             ================================================== */

          .footer {
            margin-top: 34px;

            padding-top: 16px;

            border-top:
              1px dashed #DADAD5;

            color: #777777;

            font-size: 10px;

            text-align:
              center;
          }

          .footer-thanks {
            margin-bottom: 4px;

            color: #2D5A27;

            font-size: 13px;
            font-weight: 700;
          }

          /* ==================================================
             PRINT
             ================================================== */

          @page {
            size: A4;
            margin: 12mm;
          }

          @media screen {

            body {
              background: #F5F5F5;
              padding: 16px;
            }

            .invoice {
              box-shadow:
                0 2px 14px
                rgba(
                  0,
                  0,
                  0,
                  0.07
                );

              border-radius: 8px;
            }
          }

          @media print {

            body {
              background: #ffffff;
            }

            .invoice {
              max-width: none;

              padding: 0;

              box-shadow: none;
            }

            tr {
              break-inside:
                avoid;

              page-break-inside:
                avoid;
            }
          }

        </style>
      </head>

      <body>

        <main class="invoice">

          <!-- ==================================================
               BOUTIQUE / PDV
               ================================================== -->

          <header class="brand">

            <h1 class="shop-name">
              ${escapeHtml(shopName)}
            </h1>

            <div class="pos-name">
              ${escapeHtml(pointOfSaleName)}
            </div>

            ${
              invoice.pointOfSaleAddress
                ? `
                    <div class="shop-details">
                      ${escapeHtml(invoice.pointOfSaleAddress)}
                    </div>
                  `
                : ""
            }

            ${
              invoice.pointOfSaleTelephone
                ? `
                    <div class="shop-details">
                      ${escapeHtml(invoice.pointOfSaleTelephone)}
                    </div>
                  `
                : ""
            }

          </header>

          <!-- ==================================================
               INFORMATIONS FACTURE
               ================================================== -->

          <section class="invoice-heading">

            <div>

              <h2 class="invoice-title">
                FACTURE
              </h2>

              <div class="invoice-number">
                N°
                ${escapeHtml(invoice.invoiceNumber)}
              </div>

              <div class="invoice-date">
                ${escapeHtml(formatDate(invoice.createdAt))}
              </div>

            </div>

          </section>

          <!-- ==================================================
               CLIENT
               ================================================== -->

          ${customerHtml}

          <!-- ==================================================
               ARTICLES
               ================================================== -->

          <section>

            <div class="section-label">
              DÉTAIL DE LA COMMANDE
            </div>

            <table class="items-table">

              <thead>

                <tr>

                  <th>
                    ARTICLE
                  </th>

                  <th
                    style="
                      text-align: center;
                    "
                  >
                    QTÉ
                  </th>

                  <th
                    style="
                      text-align: right;
                    "
                  >
                    PRIX UNIT.
                  </th>

                  <th
                    style="
                      text-align: right;
                    "
                  >
                    TOTAL
                  </th>

                </tr>

              </thead>

              <tbody>

                ${itemsHtml}

              </tbody>

            </table>

          </section>

          <!-- ==================================================
               TOTALS
               ================================================== -->

          <section class="summary">

            <div class="total-row">

              <span>
                Sous-total
              </span>

              <span>
                ${formatAmount(invoice.subtotal, currency)}
              </span>

            </div>

            ${discountHtml}

            <div class="grand-total">

              <span>
                TOTAL
              </span>

              <span>
                ${formatAmount(invoice.totalAmount, currency)}
              </span>

            </div>

          </section>

          <!-- ==================================================
               FIDÉLITÉ
               ================================================== -->

          ${loyaltyHtml}

          <!-- ==================================================
               PAIEMENT
               ================================================== -->

          <section class="payment">

            Moyen de paiement :

            <strong>
              ${escapeHtml(getPaymentMethodLabel(invoice.paymentMethod))}
            </strong>

          </section>

          <!-- ==================================================
               FOOTER
               ================================================== -->

          <footer class="footer">

            <div class="footer-thanks">
              Merci pour votre confiance !
            </div>

            <div>
              À bientôt chez
              ${escapeHtml(shopName)}.
            </div>

          </footer>

        </main>

      </body>

    </html>
  `;
}
