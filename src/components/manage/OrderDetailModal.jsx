import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function OrderDetailModal({
  open,
  onClose,
  orderDetails,
  loading,
}) {
  if (!open) return null;

  const items = Array.isArray(orderDetails?.items) ? orderDetails.items : [];
  const order = orderDetails?.order || {};

  const normalizedItems = items.map((it) => {
    const name =
      it?.name ||
      it?.productName ||
      it?.product?.name ||
      it?.title ||
      "San pham";
    const qty = Number(it?.quantity || it?.qty || it?.amount || 0);
    const price = Number(it?.price || it?.unitPrice || it?.product?.price || 0);

    return {
      name,
      qty,
      price,
      subtotal: qty * price,
    };
  });

  const buildInvoiceHtml = () => {
    const safeText = (value) =>
      String(value ?? "--")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    const rowsHtml =
      normalizedItems.length > 0
        ? normalizedItems
            .map(
              (it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${safeText(it.name)}</td>
                  <td class="text-right">${it.qty}</td>
                  <td class="text-right">${it.price.toLocaleString("vi-VN")} VND</td>
                  <td class="text-right">${it.subtotal.toLocaleString("vi-VN")} VND</td>
                </tr>`,
            )
            .join("")
        : '<tr><td colspan="5" style="text-align:center">Không có sản phẩm trong đơn hàng</td></tr>';

    const totalNumber = Number(order?.total_amount || 0);
    const total = totalNumber.toLocaleString("vi-VN");
    const createdDate = safeText(order?.created_at || "--");
    const statusText = safeText(order?.raw_status || order?.status || "--");
    const paymentMethod = safeText(order?.payment_method || "--");
    const customerName = safeText(order?.customer_name || "--");
    const customerPhone = safeText(order?.customer_phone || "--");
    const customerAddress = safeText(order?.address_detail || "--");
    const orderId = safeText(order?.order_id || "--");
    const authUserRaw = localStorage.getItem("authUser");
    let authUser = null;
    try {
      authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    } catch {
      authUser = null;
    }
    const issuerName = safeText(authUser?.name || "Nhan vien");
    const signatureImage =
      localStorage.getItem("invoiceSignatureDataUrl") || "";
    const signatureBlock = signatureImage
      ? `<img src="${signatureImage}" alt="chu-ky" class="signature-image" />`
      : `<div class="signature-text">${issuerName}</div>`;

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Hóa đơn ${orderId}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #0f172a;
              font-family: "Segoe UI", Arial, sans-serif;
              font-size: 13px;
              line-height: 1.45;
              background: #ffffff;
            }
            .invoice {
              border: 1px solid #dbe3ee;
              border-radius: 14px;
              overflow: hidden;
            }
            .topbar {
              height: 8px;
              background: linear-gradient(90deg, #0f766e 0%, #0ea5e9 100%);
            }
            .content {
              padding: 22px 24px 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              align-items: flex-start;
              margin-bottom: 18px;
            }
            .brand {
              display: inline-flex;
              align-items: center;
              gap: 10px;
            }
            .brand-mark {
              width: 38px;
              height: 38px;
              border-radius: 10px;
              display: grid;
              place-items: center;
              color: #ffffff;
              font-weight: 700;
              background: linear-gradient(135deg, #0f766e 0%, #0284c7 100%);
            }
            .brand-name {
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 0.2px;
            }
            .brand-sub {
              font-size: 12px;
              color: #64748b;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h1 {
              margin: 0;
              font-size: 22px;
              color: #0f766e;
              letter-spacing: 0.5px;
            }
            .invoice-title p {
              margin: 4px 0 0;
              color: #475569;
              font-size: 12px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 10px;
              margin-bottom: 16px;
            }
            .meta-item {
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 10px;
              background: #f8fafc;
            }
            .meta-item .label {
              font-size: 11px;
              color: #64748b;
              margin-bottom: 2px;
            }
            .meta-item .value {
              font-size: 13px;
              font-weight: 600;
              color: #0f172a;
              word-break: break-word;
            }
            .section-title {
              margin: 12px 0 8px;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              color: #0f766e;
              font-weight: 700;
            }
            .card {
              border: 1px solid #dbe3ee;
              border-radius: 12px;
              padding: 12px;
              margin-bottom: 12px;
            }
            .customer-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
            }
            .full {
              grid-column: 1 / -1;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              border: 1px solid #dbe3ee;
              border-radius: 12px;
              overflow: hidden;
            }
            th, td {
              padding: 10px 10px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 12px;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              color: #334155;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.4px;
            }
            tbody tr:nth-child(even) td {
              background: #fcfdff;
            }
            tbody tr:last-child td {
              border-bottom: none;
            }
            .text-right {
              text-align: right;
            }
            .summary {
              margin-top: 14px;
              margin-left: auto;
              width: 320px;
              border: 1px solid #dbe3ee;
              border-radius: 12px;
              overflow: hidden;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              background: #ffffff;
            }
            .summary-row:last-child {
              border-bottom: none;
              background: #ecfeff;
              color: #0f172a;
              font-weight: 700;
              font-size: 14px;
            }
            .footer {
              margin-top: 16px;
              padding-top: 10px;
              border-top: 1px dashed #cbd5e1;
              display: flex;
              justify-content: space-between;
              gap: 16px;
              color: #64748b;
              font-size: 11px;
            }
            .sign {
              text-align: center;
              min-width: 180px;
              color: #334155;
            }
            .signature-image {
              max-width: 150px;
              max-height: 58px;
              display: block;
              margin: 10px auto 8px;
              object-fit: contain;
            }
            .signature-text {
              margin: 10px auto 8px;
              font-family: "Brush Script MT", "Segoe Script", cursive;
              font-size: 26px;
              color: #0f766e;
              line-height: 1;
            }
            .issuer-name {
              font-size: 12px;
              font-weight: 600;
              color: #1e293b;
            }
            .sign .line {
              margin-top: 8px;
              border-top: 1px solid #94a3b8;
            }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="topbar"></div>
            <div class="content">
              <div class="header">
                <div class="brand">
                  <div class="brand-mark">UT</div>
                  <div>
                    <div class="brand-name">UbrainTech</div>
                    <div class="brand-sub">Hóa đơn bán lẻ</div>
                  </div>
                </div>
                <div class="invoice-title">
                    <h1>HÓA ĐƠN BÁN HÀNG</h1>
                    <p>Ngày in: ${new Date().toLocaleDateString("vi-VN")}</p>
                  </div>
              </div>

              <div class="meta-grid">
                <div class="meta-item">
                  <div class="label">Mã hóa đơn</div>
                  <div class="value">${orderId}</div>
                </div>
                <div class="meta-item">
                  <div class="label">Ngày đặt</div>
                  <div class="value">${createdDate}</div>
                </div>
                <div class="meta-item">
                  <div class="label">Trạng thái</div>
                  <div class="value">${statusText}</div>
                </div>
                <div class="meta-item">
                  <div class="label">Thanh toán</div>
                  <div class="value">${paymentMethod}</div>
                </div>
              </div>

              <div class="section-title">Thông tin khách hàng</div>
              <div class="card customer-grid">
                <div><strong>Tên khách:</strong> ${customerName}</div>
                <div><strong>Số điện thoại:</strong> ${customerPhone}</div>
                <div class="full"><strong>Địa chỉ nhận hàng:</strong> ${customerAddress}</div>
              </div>
              <div class="section-title">Chi tiết sản phẩm</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 60px">STT</th>
                    <th>Sản phẩm</th>
                    <th style="width: 90px" class="text-right">Số lượng</th>
                    <th style="width: 140px" class="text-right">Đơn giá</th>
                    <th style="width: 150px" class="text-right">Tạm tính</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <div class="summary">
                <div class="summary-row">
                  <span>Tổng tiền hàng</span>
                  <span>${total} VND</span>
                </div>
                <div class="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>0 VND</span>
                </div>
                <div class="summary-row">
                  <span>Cần thanh toán</span>
                  <span>${total} VND</span>
                </div>
              </div>

              <div class="footer">
                <div>
                  Cảm ơn quý khách đã mua sắm tại UbrainTech.<br />
                  Hóa đơn được in từ hệ thống quản lý đơn hàng.
                </div>
                <div class="sign">
                  Nguoi lap hoa don
                  ${signatureBlock}
                  <div class="issuer-name">${issuerName}</div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const html = buildInvoiceHtml();

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadInvoice = async () => {
    const html = buildInvoiceHtml();
    const orderCode = String(order?.order_id || "hoa-don").replace(
      /[^a-zA-Z0-9-_]/g,
      "-",
    );
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
    const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);

    if (!styleMatch || !bodyMatch) return;

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-10000px";
    tempContainer.style.top = "0";
    tempContainer.style.width = "794px";
    tempContainer.style.background = "#ffffff";
    tempContainer.style.zIndex = "-1";
    tempContainer.innerHTML = `<style>${styleMatch[1]}</style>${bodyMatch[1]}`;

    document.body.appendChild(tempContainer);

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let remainingHeight = imageHeight;
      let y = 0;

      pdf.addImage(imageData, "PNG", 0, y, imageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        y = remainingHeight - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, y, imageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(`${orderCode}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF invoice:", error);
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-lg w-full max-w-2xl p-6 border bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Chi tiết đơn {order?.order_id}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadInvoice}
              className="px-3 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
              disabled={loading}
            >
              Tải PDF
            </button>
            <button
              onClick={handlePrintInvoice}
              className="px-3 py-1 rounded-md bg-[var(--color-primary)] text-white hover:opacity-90"
              disabled={loading}
            >
              In / Xuất PDF
            </button>
            <button onClick={onClose} className="px-3 py-1 rounded-md border">
              Đóng
            </button>
          </div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div>
            <div className="mb-4 text-sm space-y-1">
              <p>
                <span className="font-semibold">Khách hàng:</span>{" "}
                {order.customer_name || "--"}
              </p>
              <p>
                <span className="font-semibold">Số điện thoại:</span>{" "}
                {order.customer_phone || "--"}
              </p>
              <p>
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {order.address_detail || "--"}
              </p>
              <p>
                <span className="font-semibold">Ngày đặt:</span>{" "}
                {order.created_at || "--"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-neutral-600 uppercase text-left">
                    <th className="px-3 py-2">Sản phẩm</th>
                    <th className="px-3 py-2">Số lượng</th>
                    <th className="px-3 py-2">Giá</th>
                    <th className="px-3 py-2">Tạm tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.length > 0 ? (
                    normalizedItems.map((it, idx) => {
                      return (
                        <tr key={idx} className="text-sm">
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2">{it.qty}</td>
                          <td className="px-3 py-2">
                            {it.price.toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="px-3 py-2">
                            {it.subtotal.toLocaleString("vi-VN")} ₫
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-6 text-center text-sm text-neutral-600"
                      >
                        Không có sản phẩm trong đơn hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right font-semibold">
              Tổng:{" "}
              {orderDetails?.order?.total_amount?.toLocaleString("vi-VN") || 0}{" "}
              ₫
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
