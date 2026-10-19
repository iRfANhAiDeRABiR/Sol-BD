'use client';

import React from 'react';
import { OrderType } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface PrintableInvoiceProps {
  order: OrderType;
}

export default function PrintableInvoice({ order }: PrintableInvoiceProps) {
  const isPaid = order.paymentStatus === 'PAID';

  const items = order.items || [];
  const calculatedSubtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  return (
    <div
      id="invoice-print-area"
      className="hidden print:block print-invoice bg-white text-slate-900 w-full font-sans antialiased text-[11px] leading-relaxed p-0 m-0"
    >
      {/* 1. Header Section */}
      <div className="flex items-start justify-between pb-3 border-b-2 border-slate-800 print-avoid-break">
        {/* Brand & Merchant Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full border border-blue-200 overflow-hidden bg-white flex-shrink-0">
            <img
              src="/logo.png"
              alt="SolutionsBD Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-black tracking-tight text-slate-950">Solutions</span>
              <span className="text-2xl font-black tracking-tight text-[#0066ff] ml-1">BD</span>
            </div>
            <div className="text-[8.5px] font-black tracking-widest text-slate-500 uppercase mt-0.5">
              YOUR TRUSTED SOFTWARE PARTNER
            </div>
            <div className="text-[10px] text-slate-600 mt-1 space-y-0.5">
              <p>Official Genuine Software & License Key Store • Dhaka, Bangladesh</p>
              <p>Phone / WhatsApp: +880 1410-699879 • Email: info@techsolutions.bd</p>
              <p>Website: https://solutionsbd.com</p>
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="text-right">
          <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
            INVOICE / অর্ডার রসিদ
          </h1>
          <span className="inline-block border border-slate-300 bg-slate-50 text-[9px] font-bold text-slate-600 px-2 py-0.5 rounded mt-0.5">
            COMMERCIAL RECEIPT
          </span>
          <div className="mt-2 text-xs font-mono font-bold text-indigo-700">
            Order No: {order.orderNumber}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            Date: {formatDate(order.createdAt)}
          </div>
        </div>
      </div>

      {/* 2. Customer & Order Info Panels */}
      <div className="grid grid-cols-2 gap-3 my-3 print-avoid-break text-[11px]">
        {/* Customer Info */}
        <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-2.5 space-y-1">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
            CUSTOMER INFORMATION (ক্রেতার তথ্য)
          </div>
          <div>
            <span className="text-slate-500">Name: </span>
            <strong className="text-slate-900">{order.customerName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Phone: </span>
            <strong className="text-slate-800">{order.customerPhone}</strong>
          </div>
          <div>
            <span className="text-slate-500">Email: </span>
            <span className="text-slate-800 break-all">{order.customerEmail}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-2.5 space-y-1">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
            ORDER & PAYMENT DETAILS
          </div>
          <div>
            <span className="text-slate-500">Payment Method: </span>
            <strong className="text-slate-800">{order.paymentMethod}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Payment Status: </span>
            {isPaid ? (
              <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 text-[10px] px-1.5 py-0.2 rounded">
                ✓ PAID / পরিশোধিত
              </span>
            ) : (
              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-300 text-[10px] px-1.5 py-0.2 rounded">
                PENDING VERIFICATION
              </span>
            )}
          </div>
          {order.paymentTrxId && (
            <div>
              <span className="text-slate-500">Transaction ID: </span>
              <strong className="font-mono text-slate-800">{order.paymentTrxId}</strong>
            </div>
          )}
          <div>
            <span className="text-slate-500">Delivery: </span>
            <span className="text-slate-800 font-medium">Instant Digital Email & Vault Delivery</span>
          </div>
        </div>
      </div>

      {/* 3. Items Table */}
      <div className="my-3 border border-slate-200 rounded-lg overflow-hidden print-avoid-break">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2 px-3 text-center w-8">#</th>
              <th className="py-2 px-3">Item Description (সফটওয়্যার বিবরণ)</th>
              <th className="py-2 px-3 text-center w-14">Qty</th>
              <th className="py-2 px-3 text-right w-24">Unit Price</th>
              <th className="py-2 px-3 text-right w-24">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[11px]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-3 px-3 text-center text-slate-500">
                  Digital Software License
                </td>
              </tr>
            ) : (
              items.map((item: any, idx: number) => {
                const title = item.productName || item.variant?.product?.title || 'Digital License';
                const variant = item.variantName || item.variant?.name || 'Standard';
                const lineTotal = item.unitPrice * item.quantity;
                return (
                  <tr key={idx} className="print-avoid-break hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-slate-900 block">{title}</span>
                      <span className="text-violet-700 font-semibold text-[10px]">{variant}</span>
                    </td>
                    <td className="py-2 px-3 text-center font-semibold tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-700">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums text-slate-900">
                      {formatPrice(lineTotal)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Totals & Pricing Summary */}
      <div className="flex justify-end my-3 print-avoid-break">
        <div className="w-64 space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (সাবটোটাল):</span>
            <span className="tabular-nums font-semibold text-slate-800">
              {formatPrice(calculatedSubtotal || order.totalAmount)}
            </span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Discount ({order.couponCode || 'Promo'}):</span>
              <span className="tabular-nums font-semibold">
                - {formatPrice(order.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Digital Delivery (ডেলিভারি):</span>
            <span className="tabular-nums font-semibold text-emerald-700">৳0 (Free)</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-slate-900 font-black text-sm">
            <span>Grand Total (মোট মূল্য):</span>
            <span className="tabular-nums text-base text-violet-700 font-black">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Official Guarantee & Support Box */}
      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 my-3 print-avoid-break text-[10px] text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <span className="text-emerald-600">✓</span>
          <span>আমাদের প্রতিশ্রুতি:</span>
          <span className="font-semibold text-slate-700">
            ১০০% জেনুইন অফিশিয়াল লাইসেন্স কি
          </span>
        </div>
        <p className="leading-normal">
          Solutions BD থেকে কেনাকাটা করার জন্য ধন্যবাদ। ডিজিটাল লাইসেন্স কোড আপনার লাইসেন্স ভল্টে সংরক্ষিত রয়েছে। যেকোনো অ্যাক্টিভেশন সহায়তায় আমাদের সাথে WhatsApp অথবা ইমেইলে যোগাযোগ করুন।
        </p>
      </div>

      {/* 6. Footer Information */}
      <div className="pt-3 border-t border-slate-200 text-center text-[9px] text-slate-500 space-y-0.5 print-avoid-break">
        <p className="font-semibold text-slate-700">
          Solutions BD — Genuine Digital Software & License Key Store Bangladesh
        </p>
        <p>
          Support Helpline: +880 1410-699879 | Email: info@techsolutions.bd | Website: https://solutionsbd.com
        </p>
        <p className="italic text-slate-400">
          This is an electronically generated official receipt. No signature is required.
        </p>
      </div>
    </div>
  );
}
