"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { BillingFields } from "@/types/billing";
import type { Service } from "@/types/service";
import { billingTotals, money } from "../billing";
import { Plus, Trash2 } from "lucide-react";
export function BillingEditor({
  value,
  onChange,
  disabled = false,
  preview = false,
}: {
  value: BillingFields;
  onChange: (value: BillingFields) => void;
  disabled?: boolean;
  preview?: boolean;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [catalogError, setCatalogError] = useState("");
  useEffect(() => {
    if (preview) return;
    let active = true;
    void createClient()
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data, error }) => {
        if (active) {
          setServices(data ?? []);
          if (error)
            setCatalogError(
              "Service catalog unavailable. You can still enter items manually.",
            );
        }
      });
    return () => {
      active = false;
    };
  }, [preview]);
  const totals = billingTotals(
    value.line_items,
    value.discount_amount,
    value.tax_rate,
  );
  function patchItem(
    index: number,
    patch: Partial<BillingFields["line_items"][number]>,
  ) {
    onChange({
      ...value,
      line_items: value.line_items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });
  }
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Services & items</h3>
          <span className="text-xs text-muted">USD</span>
        </div>
        {services.length > 0 && (
          <Select
            aria-label="Add service from catalog"
            value=""
            onChange={(e) => {
              const s = services.find((s) => s.id === e.target.value);
              if (!s) return;
              const item = {
                description: s.name,
                quantity: 1,
                unit_price: Number(s.default_price ?? 0),
              };
              onChange({
                ...value,
                line_items:
                  value.line_items.length === 1 &&
                  !value.line_items[0].description
                    ? [item]
                    : [...value.line_items, item],
              });
            }}
          >
            <option value="">Add from service catalog…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.default_price != null ? ` — ${money(s.default_price)}` : ""}
              </option>
            ))}
          </Select>
        )}
        {catalogError && <p className="text-xs text-slate">{catalogError}</p>}
        {value.line_items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-paper p-3 space-y-3"
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  label={`Item ${index + 1}`}
                  value={item.description}
                  maxLength={1000}
                  required
                  onChange={(e) =>
                    patchItem(index, { description: e.target.value })
                  }
                  placeholder="Service or deliverable"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mt-6"
                aria-label={`Remove item ${index + 1}`}
                disabled={value.line_items.length === 1}
                onClick={() =>
                  onChange({
                    ...value,
                    line_items: value.line_items.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Quantity"
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                value={Number.isNaN(item.quantity) ? "" : item.quantity}
                required
                onChange={(e) =>
                  patchItem(index, {
                    quantity:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
              <Input
                label="Unit price"
                type="number"
                min="0"
                step="0.01"
                value={Number.isNaN(item.unit_price) ? "" : item.unit_price}
                required
                onChange={(e) =>
                  patchItem(index, {
                    unit_price:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
              <div className="flex flex-col justify-end pb-2">
                <span className="text-xs text-muted">Line total</span>
                <span className="mt-1 text-sm font-medium">
                  {money(billingTotals([item]).total)}
                </span>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={value.line_items.length >= 100}
          onClick={() =>
            onChange({
              ...value,
              line_items: [
                ...value.line_items,
                { description: "", quantity: 1, unit_price: 0 },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            { key: "discount_amount", label: "Discount (USD)" },
            { key: "tax_rate", label: "Tax (%)" },
            { key: "deposit_amount", label: "Advance requested (USD)" },
          ] as const
        ).map((f) => (
          <Input
            key={f.key}
            label={f.label}
            type="number"
            min="0"
            max={f.key === "tax_rate" ? 100 : undefined}
            step="0.01"
            value={Number.isNaN(value[f.key]) ? "" : value[f.key]}
            required
            onChange={(e) =>
              onChange({
                ...value,
                [f.key]: e.target.value === "" ? NaN : Number(e.target.value),
              })
            }
          />
        ))}
      </div>
      <div
        className="rounded-xl border border-line bg-signal-soft p-4 text-sm space-y-2"
        aria-live="polite"
      >
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>−{money(value.discount_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({value.tax_rate}%)</span>
          <span>{money(totals.tax)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2 font-semibold">
          <span>Total</span>
          <span>{money(totals.total)}</span>
        </div>
        <p className="text-xs text-slate">
          Requested advance is part of the total. Record it in Payments only
          after receiving it.
        </p>
      </div>
      <Textarea
        label="Notes"
        maxLength={10000}
        value={value.notes}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
        placeholder="Scope, deliverables or other details"
      />
      <Textarea
        label="Payment terms"
        maxLength={5000}
        value={value.payment_terms}
        onChange={(e) => onChange({ ...value, payment_terms: e.target.value })}
        placeholder="Agreed payment schedule and instructions"
      />
    </fieldset>
  );
}
