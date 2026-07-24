import jsPDF from "jspdf";
import QRCode from "qrcode";

// Proper TypeScript Interfaces for strict typing
export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  Product?: {
    name: string;
  };
  variant?: {
    materialName: string;
  };
  price: number;
  quantity: number;
}

export interface OrderData {
  id: number | string;
  createdAt: string | Date;
  paymentMethod: string;
  status: string;
  fullName?: string;
  User?: {
    name: string;
  };
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  totalAmount: number;
  OrderItems?: OrderItem[];
}

export const generateShippingLabel = async (order: OrderData): Promise<void> => {
  // A6 size standard dimensions (105mm x 148mm) - Perfect 1/4 of A4
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6",
  });

  const width = 105;
  const height = 148;
  const margin = 4; // Compact borders for Daraz look

  // Helper variables for layout
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);

  // Outer Border
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, width - margin * 2, height - margin * 2);

  // ==========================================
  // TOP BAR: Centered Store Name (No Logo)
  // ==========================================
  let currentY = margin;
  const topBarHeight = 10; // Thoda text space barhaya hai balance ke liye
  
  // Bottom line of Top Bar
  doc.line(
    margin,
    currentY + topBarHeight,
    width - margin,
    currentY + topBarHeight,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14); // Font size badha diya taake center me achha lage
  
  // Text ko center align karne ke liye exact calculations
  doc.text("fancystore.store", width / 2, currentY + 6.5, { align: "center" });

  currentY += topBarHeight;

  // ==========================================
  // SECTION 2: QR Code & Standard Details (Grid)
  // ==========================================
  const gridHeight = 35;
  doc.line(
    margin,
    currentY + gridHeight,
    width - margin,
    currentY + gridHeight,
  );
  // Vertical line separating QR and Daraz Details
  const gridSplitX = 42;
  doc.line(gridSplitX, currentY, gridSplitX, currentY + gridHeight);

  // 1. Generate and Add QR Code (Left side)
  try {
    const storeUrl = "https://fancystore.store";
    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      margin: 1,
      width: 120,
    });
    // Centered inside the left grid box
    doc.addImage(qrCodeDataUrl, "PNG", margin + 2, currentY + 2, 32, 32);
  } catch (error) {
    console.error("QR Code Generation Error:", error);
  }

  // 2. Right side info grid (Daraz standard blocks)
  const rightContentX = gridSplitX + 3;
  const rowH = gridHeight / 5; // 5 rows inside right grid

  doc.setFontSize(8);
  // Row 1: STANDARD
  doc.setFont("helvetica", "bold");
  doc.text("STANDARD", width - margin - 2, currentY + 5, { align: "right" });
  doc.line(gridSplitX, currentY + rowH, width - margin, currentY + rowH);

  // Row 2: Weight
  doc.setFont("helvetica", "normal");
  doc.text("0.9 KG", width - margin - 2, currentY + rowH + 5, {
    align: "right",
  });
  doc.line(
    gridSplitX,
    currentY + rowH * 2,
    width - margin,
    currentY + rowH * 2,
  );

  // Row 3: Delivery Type
  doc.text("HOME", width - margin - 2, currentY + rowH * 2 + 5, {
    align: "right",
  });
  doc.line(
    gridSplitX,
    currentY + rowH * 3,
    width - margin,
    currentY + rowH * 3,
  );

  // Row 4: COD status
  doc.setFont("helvetica", "bold");
  const isCOD =
    order.paymentMethod.toLowerCase() === "cod" ||
    order.paymentMethod.toLowerCase() === "cash_on_delivery";
  doc.text(
    isCOD ? "COD" : "PAID",
    width - margin - 2,
    currentY + rowH * 3 + 5,
    { align: "right" },
  );
  doc.line(
    gridSplitX,
    currentY + rowH * 4,
    width - margin,
    currentY + rowH * 4,
  );

  // Row 5: Price
  doc.text("PKR", rightContentX, currentY + rowH * 4 + 5);
  doc.text(
    `${order.totalAmount.toLocaleString()}.00`,
    width - margin - 2,
    currentY + rowH * 4 + 5,
    { align: "right" },
  );

  // Add the route text inside QR zone
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PK-DEX", margin + 12, currentY + gridHeight - 2);

  currentY += gridHeight;

  // ==========================================
  // SECTION 3: Order Number & Tracking Bar
  // ==========================================
  const orderBarHeight = 12;
  doc.line(
    margin,
    currentY + orderBarHeight,
    width - margin,
    currentY + orderBarHeight,
  );

  doc.setFontSize(9);
  const cleanOrderId = order.id.toString().padStart(5, "0");
  doc.text(`Tracking Number: FS-DEX-${cleanOrderId}`, margin + 4, currentY + 5);
  doc.text(`Order Number: 00${order.id}`, margin + 4, currentY + 10);

  currentY += orderBarHeight;

  // ==========================================
  // SECTION 4: Creation Dates
  // ==========================================
  const dateBarHeight = 6;
  doc.line(
    margin,
    currentY + dateBarHeight,
    width - margin,
    currentY + dateBarHeight,
  );
  doc.line(width / 2, currentY, width / 2, currentY + dateBarHeight);

  const createdDateStr = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const printDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Order Date: ${createdDateStr}`, margin + 2, currentY + 4);
  doc.text(`Print Date: ${printDateStr}`, width / 2 + 2, currentY + 4);

  currentY += dateBarHeight;

  // ==========================================
  // SECTION 5: Recipient & Sender Address Boxes
  // ==========================================
  const addressAreaHeight = 42;
  doc.line(width / 2, currentY, width / 2, currentY + addressAreaHeight); // Middle splitter
  doc.line(
    margin,
    currentY + addressAreaHeight,
    width - margin,
    currentY + addressAreaHeight,
  ); // Bottom line

  doc.setFontSize(7);

  // --- Left Side: Recipient (Customer) ---
  let recY = currentY + 4;
  doc.setFont("helvetica", "bold");
  doc.text("Recipient:", margin + 2, recY);

  doc.setFont("helvetica", "normal");
  const recipientName = order.fullName || order.User?.name || "Customer";
  doc.text(recipientName, margin + 14, recY);

  recY += 4;
  const rawAddress = `${order.address}, ${order.city}`;
  const choppedAddress = doc.splitTextToSize(
    rawAddress,
    width / 2 - margin - 4,
  );
  doc.text(choppedAddress, margin + 2, recY);

  // Shift Y down dynamically based on address wrapping length
  const phoneY = currentY + addressAreaHeight - 3;
  doc.setFont("helvetica", "bold");
  doc.text(`Phone: ${order.phoneNumber}`, margin + 2, phoneY);

  // --- Right Side: Sender (Fancy Store Static Details) ---
  let sendY = currentY + 4;
  doc.setFont("helvetica", "bold");
  doc.text("Sender:", width / 2 + 2, sendY);
  doc.setFont("helvetica", "normal");
  doc.text("Fancy.Store.", width / 2 + 12, sendY);

  sendY += 4;
  const senderAddress =
    "72 B block new chauburji sham nager park lahore, Punjab, Lahore - Chaburji, Shamnagar";
  const choppedSender = doc.splitTextToSize(
    senderAddress,
    width / 2 - margin - 4,
  );
  doc.text(choppedSender, width / 2 + 2, sendY);

  doc.setFont("helvetica", "bold");
  doc.text("Phone: 03174961945", width / 2 + 2, phoneY);

  currentY += addressAreaHeight;

  // ==========================================
  // SECTION 6: Simple Items List Footer (All items included)
  // ==========================================
  let itemY = currentY + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Item Description", margin + 2, itemY);
  doc.text("Qty", width - margin - 15, itemY);

  doc.line(margin, itemY + 2, width - margin, itemY + 2);
  itemY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5); // 6+ products ko safely adapt karne ke liye size optimum rakha hai

  const itemsToPrint = order.OrderItems || [];
  itemsToPrint.forEach((item) => {
    let name =
      item.productName || item.Product?.name || `Product #${item.productId}`;
    const vLabel = (item.variant as any)?.variantValue || item.variant?.materialName;
    if (vLabel) {
      name = `${name} (${vLabel})`;
    }
    const truncatedName =
      name.length > 50 ? name.substring(0, 48) + "..." : name;

    doc.text(truncatedName, margin + 2, itemY);
    doc.text(item.quantity.toString(), width - margin - 13, itemY);
    itemY += 4;
  });

  // Save the customized generated PDF
  doc.save(`fancystore_label_${cleanOrderId}.pdf`);
};