import React, { useState } from "react";

export default function TeacherFind() {
  const [teacherId, setTeacherId] = useState("");
  const [teacher, setTeacher] = useState(null);

  const handleSearch = () => {
    console.log("Поиск преподавателя по ID:", teacherId);
    setTeacher({
      id: teacherId,
      full_name: "Тестовый преподаватель",
      department: "Кафедра ИТ",
    });
  };

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Найти преподавателя по ID</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="ID преподавателя"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Найти
        </button>
      </div>

      {teacher && (
        <div className="p-4 border rounded-lg bg-slate-50 mt-4">
          <p>ID: {teacher.id}</p>
          <p>ФИО: {teacher.full_name}</p>
          <p>Кафедра: {teacher.department}</p>
        </div>
      )}
    </section>
  );
}
