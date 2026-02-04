import React, { useState } from "react";

import vi from "../../../i18n/vi";

export default function Information({ addresses = [] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");

  return (
    <div className="rounded-2xl shadow-lg border p-6 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700 dark:text-slate-100">
          <span className="material-symbols-outlined">person</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">
            {vi.profile.information.title}
          </h1>
          <p className="text-sm mt-1 dark:text-slate-300">
            {vi.profile.information.desc}
          </p>
        </div>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-medium dark:text-slate-200">
            {vi.profile.information.labels.fullName}
          </label>
          <input
            name="fullName"
            placeholder={vi.profile.information.placeholders.fullName}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <p className="text-sm font-semibold break-all">
            {fullName || "(khong co)"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-200">
            {vi.profile.information.labels.phone}
          </label>
          <input
            name="phone"
            placeholder={vi.profile.information.placeholders.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <p className="text-sm font-semibold break-all">
            {phone || "(khong co)"}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium dark:text-slate-200">
            {vi.profile.information.labels.email}
          </label>
          <input
            name="email"
            placeholder={vi.profile.information.placeholders.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <p className="text-sm font-semibold break-all">
            {email || "(khong co)"}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium dark:text-slate-200">
            {vi.profile.information.labels.defaultAddress}
          </label>
          <select
            name="defaultAddress"
            value={defaultAddress}
            onChange={(e) => setDefaultAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">
              {vi.profile.information.placeholders.selectAddress}
            </option>
            {addresses.length === 0 && (
              <option value="sample-1">123 Nguyễn Trãi, Q1</option>
            )}
            {addresses.map((a, i) => (
              <option
                key={i}
                value={`${a.city}-${a.ward}-${a.street}`}
              >{`${a.city} - ${a.ward} - ${a.street}`}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-md font-semibold shadow hover:opacity-95"
          >
            {vi.profile.information.updateInfor}
          </button>
        </div>
      </form>
    </div>
  );
}
