import React, { useState } from "react";

export default function StudentFind() {
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);

  const handleSearch = () => {
    console.log("Поиск студента по ID:", studentId);
    setStudent({
      id: studentId,
      full_name: "Тестовый студент",
      group_name: "CS101",
    });
  };

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Найти студента по ID</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="ID студента"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Найти
        </button>
      </div>
      {student && (
        <div className="p-4 border rounded-lg bg-slate-50 mt-4">
          <p>ID: {student.id}</p>
          <p>ФИО: {student.full_name}</p>
          <p>Группа: {student.group_name}</p>
        </div>
      )}
    </section>
  );
}
