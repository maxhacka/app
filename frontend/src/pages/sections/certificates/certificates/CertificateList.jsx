import React from "react";

export default function CertificateList() {
  const certificates = [
    {
      id: 1,
      name: "Справка об обучении",
      type: "Образовательная",
      status: "Активен",
    },
    {
      id: 2,
      name: "Справка об участии",
      type: "Мероприятие",
      status: "Неактивен",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Список сертификатов</h1>
      <ul className="divide-y divide-slate-200">
        {certificates.map((c) => (
          <li key={c.id} className="py-3 flex justify-between">
            <div>
              <div className="font-semibold text-slate-800">{c.name}</div>
              <div className="text-sm text-slate-600">{c.type}</div>
            </div>
            <span className="text-sm text-slate-500">{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
