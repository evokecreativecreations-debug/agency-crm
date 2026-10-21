import { PDFDocument, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { billingTotals, money } from "./billing";
import type { BillingFields } from "@/types/billing";
export interface PdfDocumentInput extends BillingFields {
  kind: "invoice" | "quotation";
  number: string;
  created_at: string;
  due_date: string | null;
  recipient_name: string;
  recipient_email: string;
  amount: number;
  status: string;
  paid?: number;
}
const ink = rgb(0.1, 0.16, 0.19),
  muted = rgb(0.38, 0.44, 0.47),
  green = rgb(0.04, 0.38, 0.3),
  line = rgb(0.87, 0.9, 0.9),
  paper = rgb(0.95, 0.97, 0.96);
// Remove control characters. Unsupported glyphs are replaced visibly rather than crashing export.
function printable(text: string, font: PDFFont) {
  const supported = new Set(font.getCharacterSet());
  return [...text.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")]
    .map((c) => (c === "\n" || supported.has(c.codePointAt(0)!) ? c : "?"))
    .join("");
}
export async function createBillingPdf(input: PdfDocumentInput) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontDir = path.join(process.cwd(), "features/invoices/fonts");
  const [regularBytes, boldBytes] = await Promise.all([
    readFile(path.join(fontDir, "NotoSans-Regular.ttf")),
    readFile(path.join(fontDir, "NotoSans-Bold.ttf")),
  ]);
  const regular = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  doc.setTitle(
    `${input.kind === "invoice" ? "Invoice" : "Quotation"} ${input.number}`,
  );
  doc.setAuthor("Evoke Creative Creations");
  doc.setSubject(
    input.kind === "invoice" ? "Project invoice" : "Service quotation",
  );
  const width = 595.28,
    height = 841.89,
    margin = 44,
    right = width - margin;
  let page: PDFPage;
  let y = 0;
  function text(
    value: string,
    x: number,
    at: number,
    size = 10,
    font = regular,
    color = ink,
  ) {
    page.drawText(printable(value, font), { x, y: at, size, font, color });
  }
  function rule(at: number) {
    page.drawLine({
      start: { x: margin, y: at },
      end: { x: right, y: at },
      color: line,
      thickness: 0.7,
    });
  }
  function newPage() {
    page = doc.addPage([width, height]);
    y = height - margin;
    text("EVOKE", margin, y - 3, 23, bold, green);
    text("CREATIVE CREATIONS", margin, y - 21, 8, bold, muted);
    const title = input.kind === "invoice" ? "INVOICE" : "QUOTATION";
    text(
      title,
      right - bold.widthOfTextAtSize(title, 11),
      y - 1,
      11,
      bold,
      green,
    );
    text(
      input.number,
      right - regular.widthOfTextAtSize(input.number, 10),
      y - 20,
      10,
    );
    y -= 44;
    rule(y);
    y -= 24;
  }
  function ensure(space: number) {
    if (y - space < 72) newPage();
  }
  function lines(
    value: string,
    maxWidth: number,
    size = 10,
    font = regular,
  ): string[] {
    const result: string[] = [];
    for (const para of printable(value, font).split("\n")) {
      let current = "";
      for (const word of para.split(/\s+/)) {
        if (!word) continue;
        if (
          font.widthOfTextAtSize(current ? `${current} ${word}` : word, size) <=
          maxWidth
        ) {
          current = current ? `${current} ${word}` : word;
          continue;
        }
        if (current) result.push(current);
        current = "";
        for (const ch of word) {
          if (
            font.widthOfTextAtSize(current + ch, size) > maxWidth &&
            current
          ) {
            result.push(current);
            current = "";
          }
          current += ch;
        }
      }
      result.push(current);
    }
    return result;
  }
  function paragraph(
    value: string,
    maxWidth = right - margin,
    size = 10,
    font = regular,
    color = ink,
  ) {
    for (const part of lines(value, maxWidth, size, font)) {
      ensure(17);
      text(part, margin, y, size, font, color);
      y -= 16;
    }
  }
  function totalRow(label: string, amount: number, emphasis = false) {
    ensure(27);
    text(
      label,
      320,
      y,
      emphasis ? 12 : 10,
      emphasis ? bold : regular,
      emphasis ? green : muted,
    );
    const value = money(amount);
    text(
      value,
      right -
        (emphasis ? bold : regular).widthOfTextAtSize(
          value,
          emphasis ? 12 : 10,
        ),
      y,
      emphasis ? 12 : 10,
      emphasis ? bold : regular,
      emphasis ? green : ink,
    );
    y -= emphasis ? 30 : 22;
  }
  newPage();
  text(
    input.kind === "invoice" ? "BILL TO" : "PREPARED FOR",
    margin,
    y,
    8,
    bold,
    muted,
  );
  y -= 20;
  paragraph(input.recipient_name, right - margin, 13, bold);
  paragraph(input.recipient_email, right - margin, 10, regular, muted);
  y -= 10;
  paragraph(
    `Created: ${input.created_at.slice(0, 10)}    |    Status: ${input.status.replaceAll("_", " ")}`,
    right - margin,
    9,
    regular,
    muted,
  );
  if (input.due_date)
    paragraph(
      `${input.kind === "invoice" ? "Payment due" : "Valid until"}: ${input.due_date}`,
      right - margin,
      9,
      regular,
      muted,
    );
  y -= 15;
  function tableHead() {
    ensure(45);
    page.drawRectangle({
      x: margin,
      y: y - 9,
      width: right - margin,
      height: 28,
      color: paper,
    });
    text("DESCRIPTION", margin + 9, y, 8, bold, muted);
    text("QTY", 323, y, 8, bold, muted);
    text("UNIT PRICE", 367, y, 8, bold, muted);
    text("AMOUNT", 470, y, 8, bold, muted);
    y -= 31;
  }
  tableHead();
  const items = input.line_items.length
    ? input.line_items
    : [
        {
          description: "Project services",
          quantity: 1,
          unit_price: input.amount,
        },
      ];
  for (const item of items) {
    const description = lines(item.description, 258, 10);
    let first = true;
    for (const chunk of description) {
      if (y < 95) {
        newPage();
        tableHead();
      }
      text(chunk, margin + 9, y, 10);
      if (first) {
        text(String(item.quantity), 323, y, 9);
        const rate = money(item.unit_price),
          amount = money(billingTotals([item]).total);
        text(rate, 437 - regular.widthOfTextAtSize(rate, 9), y, 9);
        text(amount, right - 9 - regular.widthOfTextAtSize(amount, 9), y, 9);
        first = false;
      }
      y -= 16;
    }
    y -= 8;
    rule(y);
    y -= 20;
  }
  const totals = input.line_items.length
    ? billingTotals(input.line_items, input.discount_amount, input.tax_rate)
    : { subtotal: input.amount, tax: 0, total: input.amount };
  ensure(180);
  y -= 4;
  totalRow("Subtotal", totals.subtotal);
  if (input.discount_amount) totalRow("Discount", -input.discount_amount);
  if (input.tax_rate) totalRow(`Tax (${input.tax_rate}%)`, totals.tax);
  totalRow("Total (USD)", input.amount, true);
  if (input.deposit_amount)
    totalRow("Advance requested*", input.deposit_amount);
  if (input.kind === "invoice") {
    totalRow("Recorded payments", input.paid ?? 0);
    totalRow(
      "Balance due",
      Math.max(0, input.amount - (input.paid ?? 0)),
      true,
    );
  }
  y -= 8;
  if (input.deposit_amount) {
    paragraph(
      "*Advance requested is included in the total; it is not a received payment.",
      right - margin,
      9,
      regular,
      muted,
    );
    y -= 12;
  }
  for (const section of [
    { label: "PAYMENT TERMS", value: input.payment_terms },
    { label: "NOTES", value: input.notes },
  ]) {
    if (!section.value.trim()) continue;
    ensure(50);
    text(section.label, margin, y, 8, bold, green);
    y -= 20;
    paragraph(section.value, right - margin, 10, regular, muted);
    y -= 18;
  }
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    page = p;
    rule(51);
    text("Evoke Creative Creations", margin, 33, 8, regular, muted);
    const count = `${i + 1} / ${pages.length}`;
    text(
      count,
      right - regular.widthOfTextAtSize(count, 8),
      33,
      8,
      regular,
      muted,
    );
  });
  return doc.save();
}
