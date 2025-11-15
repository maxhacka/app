import React from "react";

export default function InDevelopment({ title = "Функция в разработке" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-600">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-500">
        Эта страница находится в разработке. Следите за обновлениями!
      </p>
    </div>
  );
}
