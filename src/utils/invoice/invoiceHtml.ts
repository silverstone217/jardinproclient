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

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeAmount);
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
  }).format(date);
}

function formatTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
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

  const shopName = invoice.shopName.trim() || "Jardin Pro";

  const pointOfSaleName = invoice.pointOfSaleName.trim() || "Point de vente";

  const logoUrl = invoice.shopLogo?.trim() || null;

  // ==========================================================
  // ARTICLES
  // ==========================================================

  const itemsHtml =
    invoice.items.length > 0
      ? invoice.items
          .map((item) => {
            const itemCurrency = item.currency ?? currency;

            return `
              <tr class="item-row">
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

                <td class="amount-cell item-total">
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
          <div class="summary-row discount-row">
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
          <section class="customer-card">
            <div class="customer-card-icon">
              <span>●</span>
            </div>

            <div class="customer-card-content">
              <div class="card-label">
                CLIENT
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
            </div>
          </section>
        `
      : `
          <section class="customer-card">
            <div class="customer-card-icon">
              <span>●</span>
            </div>

            <div class="customer-card-content">
              <div class="card-label">
                CLIENT
              </div>

              <div class="customer-name">
                Client de passage
              </div>
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
          <section class="loyalty-card">
            <div class="loyalty-header">
              <div class="loyalty-icon">
                ★
              </div>

              <div>
                <div class="loyalty-title">
                  PROGRAMME FIDÉLITÉ
                </div>

                <div class="loyalty-subtitle">
                  Merci pour votre fidélité
                </div>
              </div>
            </div>

            <div class="loyalty-values">
              ${
                pointsEarned > 0
                  ? `
                      <div class="loyalty-value">
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
                      <div class="loyalty-value">
                        <span>
                          Points utilisés
                        </span>

                        <strong class="used-points">
                          -${pointsUsed}
                        </strong>
                      </div>
                    `
                  : ""
              }
            </div>
          </section>
        `
      : "";

  // ==========================================================
  // LOGO
  // ==========================================================

  const logoHtml = logoUrl
    ? `
        <img
          class="shop-logo"
          src="${escapeHtml(logoUrl)}"
          alt="${escapeHtml(shopName)}"
        />
      `
    : `
        <div class="logo-placeholder">
          <span>JP</span>
        </div>
      `;

  // ==========================================================
  // INFORMATIONS PDV
  // ==========================================================

  const shopDetailsHtml =
    invoice.pointOfSaleAddress || invoice.pointOfSaleTelephone
      ? `
          <div class="shop-details">
            ${
              invoice.pointOfSaleAddress
                ? `
                    <span>
                      ${escapeHtml(invoice.pointOfSaleAddress)}
                    </span>
                  `
                : ""
            }

            ${
              invoice.pointOfSaleTelephone
                ? `
                    <span>
                      ${escapeHtml(invoice.pointOfSaleTelephone)}
                    </span>
                  `
                : ""
            }
          </div>
        `
      : "";

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

    /* ========================================================
       RESET
       ======================================================== */

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

      font-size: 11px;
      line-height: 1.45;

      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ========================================================
       PAGE
       ======================================================== */

    .invoice {
      width: 100%;
      max-width: 780px;

      margin: 0 auto;

      padding: 36px 38px;

      background: #ffffff;
    }

    /* ========================================================
       TOP BRAND
       ======================================================== */

    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 24px;

      padding-bottom: 24px;

      border-bottom:
        1px solid #e4e9e1;
    }

    .brand-left {
      display: flex;
      align-items: center;

      min-width: 0;

      gap: 15px;
    }

    .shop-logo,
    .logo-placeholder {
      width: 66px;
      height: 66px;

      flex: 0 0 66px;

      border-radius: 18px;
    }

    .shop-logo {
      object-fit: contain;

      background: #f5f8f3;

      border:
        1px solid #e2e9df;
    }

    .logo-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;

      background: #eaf2e7;

      color: #2d5a27;

      font-size: 19px;
      font-weight: 800;
    }

    .brand-info {
      min-width: 0;
    }

    .shop-name {
      margin: 0;

      color: #2d5a27;

      font-size: 22px;
      font-weight: 800;

      line-height: 1.15;

      overflow-wrap: anywhere;
    }

    .pos-name {
      margin-top: 5px;

      color: #555555;

      font-size: 11px;
      font-weight: 700;

      overflow-wrap: anywhere;
    }

    .shop-details {
      display: flex;
      flex-direction: column;

      gap: 2px;

      margin-top: 6px;

      color: #858585;

      font-size: 9.5px;

      overflow-wrap: anywhere;
    }

    /* ========================================================
       INVOICE META
       ======================================================== */

    .invoice-meta {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      gap: 24px;

      margin-top: 27px;
      margin-bottom: 25px;
    }

    .invoice-heading {
      min-width: 0;
    }

    .invoice-kicker {
      margin-bottom: 4px;

      color: #2d5a27;

      font-size: 8px;
      font-weight: 800;

      letter-spacing: 1.5px;
    }

    .invoice-title {
      margin: 0;

      color: #252525;

      font-size: 25px;
      font-weight: 800;

      line-height: 1.1;
    }

    .invoice-number {
      margin-top: 8px;

      color: #555555;

      font-size: 10.5px;
      font-weight: 700;

      overflow-wrap: anywhere;
    }

    .invoice-date {
      margin-top: 3px;

      color: #8a8a8a;

      font-size: 9.5px;
    }

    .invoice-badge {
      min-width: 105px;

      padding: 10px 13px;

      border-radius: 12px;

      background: #f2f6ef;

      border:
        1px solid #e0e9dc;

      text-align: right;
    }

    .invoice-badge-label {
      color: #8a8a8a;

      font-size: 7.5px;
      font-weight: 700;

      letter-spacing: 0.8px;
    }

    .invoice-badge-value {
      margin-top: 3px;

      color: #2d5a27;

      font-size: 12px;
      font-weight: 800;
    }

    /* ========================================================
       CLIENT
       ======================================================== */

    .customer-card {
      display: flex;
      align-items: center;

      gap: 11px;

      margin-bottom: 25px;

      padding: 13px 15px;

      border:
        1px solid #e6ebe3;

      border-radius: 13px;

      background: #fafbf9;
    }

    .customer-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 34px;
      height: 34px;

      flex: 0 0 34px;

      border-radius: 11px;

      background: #eaf2e7;

      color: #2d5a27;

      font-size: 8px;
    }

    .customer-card-content {
      min-width: 0;
    }

    .card-label {
      margin-bottom: 3px;

      color: #8b8b8b;

      font-size: 7.5px;
      font-weight: 800;

      letter-spacing: 1.2px;
    }

    .customer-name {
      color: #333333;

      font-size: 11px;
      font-weight: 700;

      overflow-wrap: anywhere;
    }

    .customer-phone {
      margin-top: 2px;

      color: #777777;

      font-size: 9.5px;
    }

    /* ========================================================
       SECTION TITLE
       ======================================================== */

    .section-heading {
      display: flex;
      align-items: center;

      gap: 9px;

      margin-bottom: 9px;
    }

    .section-marker {
      width: 5px;
      height: 16px;

      border-radius: 5px;

      background: #2d5a27;
    }

    .section-title {
      color: #333333;

      font-size: 9px;
      font-weight: 800;

      letter-spacing: 0.9px;
    }

    /* ========================================================
       ARTICLES
       ======================================================== */

    .items-table {
      width: 100%;

      border-collapse: separate;
      border-spacing: 0;

      overflow: hidden;

      border:
        1px solid #e7ebe5;

      border-radius: 12px;
    }

    .items-table thead {
      display: table-header-group;
    }

    .items-table th {
      padding: 10px 11px;

      background: #f2f6ef;

      color: #667060;

      font-size: 7.5px;
      font-weight: 800;

      letter-spacing: 0.8px;

      text-align: left;

      border-bottom:
        1px solid #e0e7dd;
    }

    .items-table td {
      padding: 12px 11px;

      border-bottom:
        1px solid #edf0eb;

      vertical-align: middle;
    }

    .items-table tbody tr:last-child td {
      border-bottom: none;
    }

    .product-cell {
      width: 45%;
    }

    .product-name {
      color: #333333;

      font-size: 10.5px;
      font-weight: 700;

      overflow-wrap: anywhere;
    }

    .product-size {
      display: inline-block;

      margin-top: 4px;

      padding: 2px 6px;

      border-radius: 5px;

      background: #f5f5f2;

      color: #7c7c7c;

      font-size: 7.5px;
      font-weight: 700;
    }

    .quantity-cell {
      width: 11%;

      color: #555555;

      font-size: 10px;
      font-weight: 700;

      text-align: center;

      white-space: nowrap;
    }

    .amount-cell {
      width: 22%;

      color: #555555;

      font-size: 9.5px;

      text-align: right;

      white-space: nowrap;
    }

    .item-total {
      width: 22%;

      color: #2d5a27;

      font-weight: 800;
    }

    .empty-items {
      padding: 25px !important;

      color: #888888;

      text-align: center;
    }

    /* ========================================================
       BOTTOM AREA
       ======================================================== */

    .bottom-grid {
      display: flex;
      align-items: flex-start;

      justify-content: space-between;

      gap: 30px;

      margin-top: 22px;
    }

    .payment-block {
      flex: 1;

      padding-top: 4px;
    }

    .payment-label {
      color: #8a8a8a;

      font-size: 7.5px;
      font-weight: 800;

      letter-spacing: 1px;
    }

    .payment-value {
      margin-top: 5px;

      color: #333333;

      font-size: 10px;
      font-weight: 700;
    }

    .summary {
      width: 290px;
      flex: 0 0 290px;
    }

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 20px;

      padding: 4px 0;

      color: #666666;

      font-size: 9.5px;
    }

    .summary-row span:last-child {
      color: #333333;

      font-weight: 700;

      text-align: right;

      white-space: nowrap;
    }

    .discount-row {
      color: #2d5a27;
    }

    .discount-row span:last-child {
      color: #2d5a27;
    }

    .grand-total {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 20px;

      margin-top: 9px;

      padding: 13px 15px;

      border-radius: 13px;

      background: #2d5a27;

      color: #ffffff;
    }

    .grand-total-label {
      font-size: 9px;
      font-weight: 700;

      letter-spacing: 0.7px;
    }

    .grand-total-value {
      font-size: 15px;
      font-weight: 800;

      text-align: right;

      white-space: nowrap;
    }

    /* ========================================================
       LOYALTY
       ======================================================== */

    .loyalty-card {
      margin-top: 18px;

      padding: 13px 15px;

      border:
        1px solid #f1dfbd;

      border-radius: 13px;

      background: #fffaf0;
    }

    .loyalty-header {
      display: flex;
      align-items: center;

      gap: 9px;
    }

    .loyalty-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 32px;
      height: 32px;

      border-radius: 10px;

      background: #fff0d1;

      color: #ff9f1c;

      font-size: 14px;
      font-weight: 800;
    }

    .loyalty-title {
      color: #77531b;

      font-size: 7.5px;
      font-weight: 800;

      letter-spacing: 1px;
    }

    .loyalty-subtitle {
      margin-top: 2px;

      color: #9a814e;

      font-size: 8.5px;
    }

    .loyalty-values {
      display: flex;

      gap: 30px;

      margin-top: 10px;

      padding-top: 9px;

      border-top:
        1px solid #f2e5cb;
    }

    .loyalty-value {
      display: flex;
      flex-direction: column;

      gap: 2px;
    }

    .loyalty-value span {
      color: #8b8b8b;

      font-size: 8px;
    }

    .loyalty-value strong {
      color: #2d5a27;

      font-size: 11px;
      font-weight: 800;
    }

    .loyalty-value .used-points {
      color: #a56a00;
    }

    /* ========================================================
       FOOTER
       ======================================================== */

    .footer {
      margin-top: 32px;

      padding-top: 17px;

      border-top:
        1px solid #e7ebe5;

      text-align: center;
    }

    .footer-thanks {
      color: #2d5a27;

      font-size: 11px;
      font-weight: 800;
    }

    .footer-text {
      margin-top: 3px;

      color: #8a8a8a;

      font-size: 8.5px;
    }

    .footer-brand {
      margin-top: 8px;

      color: #b1b1b1;

      font-size: 7.5px;
      font-weight: 700;

      letter-spacing: 1px;
    }

    /* ========================================================
       PRINT
       ======================================================== */

    @page {
      size: A4;
      margin: 10mm;
    }

    @media screen {
      body {
        background: #f5f5f5;
        padding: 18px;
      }

      .invoice {
        min-height: 100vh;

        border-radius: 16px;

        box-shadow:
          0 8px 30px
          rgba(
            45,
            90,
            39,
            0.08
          );
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
        border-radius: 0;
      }

      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .customer-card,
      .loyalty-card,
      .grand-total {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }

  </style>

</head>

<body>

  <main class="invoice">

    <!-- =====================================================
         BRAND
         ===================================================== -->

    <header class="brand">

      <div class="brand-left">

        ${logoHtml}

        <div class="brand-info">

          <h1 class="shop-name">
            ${escapeHtml(shopName)}
          </h1>

          <div class="pos-name">
            ${escapeHtml(pointOfSaleName)}
          </div>

          ${shopDetailsHtml}

        </div>

      </div>

    </header>


    <!-- =====================================================
         FACTURE
         ===================================================== -->

    <section class="invoice-meta">

      <div class="invoice-heading">

        <div class="invoice-kicker">
          DOCUMENT COMMERCIAL
        </div>

        <h2 class="invoice-title">
          Facture
        </h2>

        <div class="invoice-number">
          N° ${escapeHtml(invoice.invoiceNumber)}
        </div>

        <div class="invoice-date">
          ${escapeHtml(formatDate(invoice.createdAt))}
          ${
            formatTime(invoice.createdAt)
              ? ` · ${escapeHtml(formatTime(invoice.createdAt))}`
              : ""
          }
        </div>

      </div>

      <div class="invoice-badge">

        <div class="invoice-badge-label">
          MONTANT TOTAL
        </div>

        <div class="invoice-badge-value">
          ${formatAmount(invoice.totalAmount, currency)}
        </div>

      </div>

    </section>


    <!-- =====================================================
         CLIENT
         ===================================================== -->

    ${customerHtml}


    <!-- =====================================================
         ARTICLES
         ===================================================== -->

    <section>

      <div class="section-heading">

        <div class="section-marker"></div>

        <div class="section-title">
          DÉTAIL DE LA COMMANDE
        </div>

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


    <!-- =====================================================
         TOTAL / PAIEMENT
         ===================================================== -->

    <section class="bottom-grid">

      <div class="payment-block">

        <div class="payment-label">
          MOYEN DE PAIEMENT
        </div>

        <div class="payment-value">
          ${escapeHtml(getPaymentMethodLabel(invoice.paymentMethod))}
        </div>

      </div>


      <div class="summary">

        <div class="summary-row">

          <span>
            Sous-total
          </span>

          <span>
            ${formatAmount(invoice.subtotal, currency)}
          </span>

        </div>

        ${discountHtml}

        <div class="grand-total">

          <span class="grand-total-label">
            TOTAL À PAYER
          </span>

          <span class="grand-total-value">
            ${formatAmount(invoice.totalAmount, currency)}
          </span>

        </div>

      </div>

    </section>


    <!-- =====================================================
         FIDÉLITÉ
         ===================================================== -->

    ${loyaltyHtml}


    <!-- =====================================================
         FOOTER
         ===================================================== -->

    <footer class="footer">

      <div class="footer-thanks">
        Merci pour votre confiance !
      </div>

      <div class="footer-text">
        À bientôt chez
        ${escapeHtml(shopName)}.
      </div>

      <div class="footer-brand">
        JARDIN PRO · FACTURE CLIENT
      </div>

    </footer>

  </main>

</body>

</html>
  `;
}
