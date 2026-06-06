import jsPDF from "jspdf";

export const generateShippingLabel = (order: any): void => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margins = 10;
  let yPos = 0;

  // 1. DARK HEADER BAR
  doc.setFillColor(0, 0, 0);
  doc.rect(0, yPos, pageWidth, 15, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Fancy Store", margins, yPos + 10);

  doc.setFontSize(12);
  const orderNum = `#${order.id.toString().padStart(5, "0")}`;
  doc.text(orderNum, pageWidth - margins - 15, yPos + 10);

  yPos += 18;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // 2. META ROW (3 columns with borders)
  const metaRowHeight = 12;
  const colWidth = (pageWidth - 2 * margins) / 3;
  const metaStartX = margins;
  const metaStartY = yPos;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);

  // Vertical dividers
  doc.line(metaStartX + colWidth, metaStartY, metaStartX + colWidth, metaStartY + metaRowHeight);
  doc.line(metaStartX + 2 * colWidth, metaStartY, metaStartX + 2 * colWidth, metaStartY + metaRowHeight);

  // Bottom border
  doc.line(metaStartX, metaStartY + metaRowHeight, metaStartX + 3 * colWidth, metaStartY + metaRowHeight);

  // Column content
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US");
  doc.text(`Date: ${orderDate}`, metaStartX + 2, metaStartY + 5);
  doc.text(`Payment: ${order.paymentMethod}`, metaStartX + colWidth + 2, metaStartY + 5);
  doc.text(`Status: ${order.status.replace(/_/g, " ")}`, metaStartX + 2 * colWidth + 2, metaStartY + 5);

  yPos += metaRowHeight + 4;

  // 3. SHIP TO SECTION
  const shipToX = margins;
  const shipToY = yPos;
  const shipToWidth = pageWidth - 2 * margins;
  const shipToHeight = 30;

  doc.setFillColor(200, 220, 255);
  doc.rect(shipToX, shipToY, shipToWidth, shipToHeight, "F");

  doc.setDrawColor(100, 150, 200);
  doc.setLineWidth(1);
  doc.rect(shipToX, shipToY, shipToWidth, shipToHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("SHIP TO", shipToX + 4, shipToY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(order.fullName || order.User?.name, shipToX + 4, shipToY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Phone: ${order.phoneNumber}`, shipToX + 4, shipToY + 18);

  doc.setFontSize(10);
  const addressText = `${order.address}, ${order.city}, ${order.postalCode}, ${order.country}`;
  const addressLines = doc.splitTextToSize(addressText, shipToWidth - 8);
  doc.text(addressLines, shipToX + 4, shipToY + 24);

  yPos += shipToHeight + 4;

  // 4. BARCODE ROW
  const barcodeStartX = margins;
  const barcodeWidth = 70;
  const barWidth = barcodeWidth / 20;

  doc.setFillColor(0, 0, 0);
  for (let i = 0; i < 20; i++) {
    const barHeight = i % 2 === 0 ? 10 : 6;
    const barX = barcodeStartX + i * barWidth;
    doc.rect(barX, yPos, barWidth - 0.3, barHeight, "F");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const trackingNum = `FS-2026-${order.id}-PK`;
  doc.text(trackingNum, barcodeStartX, yPos + 13);

  yPos += 18;

  // 5. ITEMS TABLE
  const tableMarginLeft = margins;
  const tableMarginRight = pageWidth - margins;
  const tableColWidth = (tableMarginRight - tableMarginLeft) / 3;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  doc.text("Item", tableMarginLeft + 2, yPos + 5);
  doc.text("Qty", tableMarginLeft + tableColWidth + 2, yPos + 5);
  doc.text("Subtotal", tableMarginLeft + 2 * tableColWidth + 2, yPos + 5);

  // Header divider
  doc.setLineWidth(0.5);
  doc.line(tableMarginLeft, yPos + 7, tableMarginRight, yPos + 7);

  yPos += 10;

  // Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  order.OrderItems?.forEach((item: any) => {
    const itemName = item.productName || `Product #${item.productId}`;
    const subtotal = item.price * item.quantity;

    doc.text(itemName, tableMarginLeft + 2, yPos);
    doc.text(item.quantity.toString(), tableMarginLeft + tableColWidth + 2, yPos);
    doc.text(`Rs. ${subtotal.toLocaleString()}`, tableMarginLeft + 2 * tableColWidth + 2, yPos);

    yPos += 6;

    // Divider between rows
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(tableMarginLeft, yPos, tableMarginRight, yPos);
    yPos += 2;
  });

  yPos += 4;

  // 6. TOTALS BLOCK (right aligned)
  const totalsX = tableMarginRight - 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const subtotal = order.totalAmount - 299;
  doc.text(`Subtotal: Rs. ${subtotal.toLocaleString()}`, totalsX, yPos);
  yPos += 6;

  doc.text("Shipping Fee: Rs. 299", totalsX, yPos);
  yPos += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL: Rs. ${order.totalAmount.toLocaleString()}`, totalsX, yPos);

  yPos += 12;

  // 7. FOOTER ROW
  // Left: Payment method badge (green)
  doc.setFillColor(34, 197, 94);
  doc.rect(tableMarginLeft, yPos, 22, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(order.paymentMethod, tableMarginLeft + 3, yPos + 6);

  // Right: Email
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("support@fancystore.com", tableMarginRight - 50, yPos + 6);

  // Download
  doc.save(`Order_#${order.id.toString().padStart(5, "0")}_ShippingLabel.pdf`);
};
