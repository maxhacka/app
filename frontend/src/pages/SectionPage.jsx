import React from "react";
import { useParams } from "react-router-dom";
import { sections, functions } from "../data/mockSectionsAndFunctions";

export default function SectionPage() {
  const { sectionId } = useParams();

  // Находим выбранный раздел
  const section = sections.find((s) => s.id === Number(sectionId));

  // Фильтруем материалы, относящиеся к этому разделу
  const sectionFunctions = functions.filter(
    (m) => m.sectionId === Number(sectionId)
  );

  // Если раздел не найден
  if (!section) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">Раздел не найден</h1>
        <p className="text-slate-600">
          Возможно, вы перешли по неверной ссылке или раздел был удалён.
        </p>
      </section>
    );
  }

  return (
    <section>
      {/* Название раздела */}
      <h1 className="mb-4 text-2xl font-bold">{section.name}</h1>

      {/* Материалы раздела */}
      {sectionFunctions.length > 0 ? (
        <div className="space-y-4">
          {sectionFunctions.map((item) => (
            <article
              key={item.id}
              className="p-4 transition-shadow bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md"
            >
              <h2 className="mb-2 text-lg font-semibold">{item.title}</h2>
              <p className="mb-2 text-slate-700">{item.content}</p>

              {item.image && (
                <img
                  src={item.image}
                  alt="Изображение материала"
                  className="object-cover w-full mb-2 rounded-lg"
                />
              )}

              <p className="text-sm text-slate-500">
                Добавлено: {new Date(item.date).toLocaleDateString("ru-RU")}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-slate-50">
          <h2 className="font-semibold">Функции раздела</h2>
          <p className="mt-2 text-sm text-slate-600">
            Пока здесь ничего нет. Добавьте функционал или попробуйте позже.
          </p>
        </div>
      )}
    </section>
  );
}
